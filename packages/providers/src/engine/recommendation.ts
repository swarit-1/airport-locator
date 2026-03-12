import type {
  GeoPoint,
  RiskProfile,
  RideMode,
  FlightType,
  ConfidenceLevel,
  TimeBreakdownItem,
  Recommendation,
  WaitTimeResult,
  TrafficResult,
  FlightInfo,
} from '@gateshare/domain';
import type { TrafficProvider, FlightProvider, WaitTimeProvider } from '../interfaces';

export interface AirportRules {
  curb_to_bag_drop_minutes: number;
  bag_drop_to_security_minutes: number;
  security_to_gate_minutes: number;
  avg_security_wait_minutes: number;
  peak_security_wait_minutes: number;
  min_arrival_before_departure: number;
}

export interface AirlineRules {
  bag_drop_cutoff_minutes: number;
  boarding_begins_minutes: number;
  gate_close_minutes: number;
}

export interface RecommendationInput {
  tripId: string;
  origin: GeoPoint;
  airportLocation: GeoPoint;
  airportIata: string;
  airlineIata: string;
  flightNumber: string;
  departureDate: string;
  departureTime: string; // HH:MM
  flightType: FlightType;
  hasCheckedBags: boolean;
  bagCount: number;
  partySize: number;
  hasTsaPrecheck: boolean;
  hasClear: boolean;
  travelingWithKids: boolean;
  accessibilityNeeds: boolean;
  rideMode: RideMode;
  riskProfile: RiskProfile;
  airportRules: AirportRules;
  airlineRules: AirlineRules;
}

// Risk profile multipliers for uncertainty buffers
const RISK_MULTIPLIERS: Record<RiskProfile, number> = {
  conservative: 1.5,
  balanced: 1.0,
  aggressive: 0.7,
};

export class RecommendationEngine {
  constructor(
    private trafficProvider: TrafficProvider,
    private flightProvider: FlightProvider,
    private waitTimeProvider: WaitTimeProvider,
  ) {}

  async compute(input: RecommendationInput): Promise<Recommendation> {
    const breakdown: TimeBreakdownItem[] = [];
    let overallConfidence: ConfidenceLevel = 'high';
    const warnings: string[] = [];
    const riskMultiplier = RISK_MULTIPLIERS[input.riskProfile];

    // 1. Get flight info
    let flightInfo: FlightInfo | null = null;
    try {
      flightInfo = await this.flightProvider.getFlightInfo(
        input.airlineIata,
        input.flightNumber,
        input.departureDate,
      );
    } catch {
      warnings.push('Could not fetch live flight status. Using scheduled time.');
      overallConfidence = 'medium';
    }

    // Use actual departure time (with delay) or scheduled
    const scheduledDepartureStr = `${input.departureDate}T${input.departureTime}:00.000Z`;
    const actualDeparture = flightInfo?.estimated_departure
      ? new Date(flightInfo.estimated_departure)
      : new Date(scheduledDepartureStr);

    if (flightInfo?.delay_minutes && flightInfo.delay_minutes > 0) {
      warnings.push(`Flight is delayed by ${flightInfo.delay_minutes} minutes.`);
    }

    // 2. Get traffic estimate
    let traffic: TrafficResult;
    try {
      traffic = await this.trafficProvider.getTrafficEstimate(
        input.origin,
        input.airportLocation,
      );
    } catch {
      // Fallback: assume 30 minutes
      traffic = {
        duration_minutes: 30,
        duration_in_traffic_minutes: 40,
        distance_km: 25,
        source: 'fallback',
        fetched_at: new Date().toISOString(),
      };
      overallConfidence = 'low';
      warnings.push('Traffic data unavailable. Using fallback estimate.');
    }

    const trafficMinutes = traffic.duration_in_traffic_minutes;
    breakdown.push({
      label: 'Drive time',
      minutes: trafficMinutes,
      description: `${traffic.distance_km} km with current traffic conditions`,
      source: traffic.source,
      source_type: traffic.source === 'mock' ? 'mock' : 'live_api',
      freshness: traffic.fetched_at,
    });

    // 3. Pickup uncertainty buffer based on ride mode
    const pickupBufferBase = getPickupBuffer(input.rideMode);
    const pickupBuffer = Math.round(pickupBufferBase * riskMultiplier);
    breakdown.push({
      label: 'Pickup buffer',
      minutes: pickupBuffer,
      description: getPickupDescription(input.rideMode),
    });

    // 4. Bag drop buffer
    let bagDropBuffer = 0;
    if (input.hasCheckedBags) {
      bagDropBuffer = input.airportRules.curb_to_bag_drop_minutes;
      // Extra time for multiple bags
      if (input.bagCount > 2) {
        bagDropBuffer += 5;
      }
      breakdown.push({
        label: 'Bag drop',
        minutes: bagDropBuffer,
        description: input.bagCount > 2
          ? `Check ${input.bagCount} bags (extra time for large party)`
          : `Check bags at counter`,
      });
    }

    // 5. Security wait time
    let waitTime: WaitTimeResult;
    try {
      waitTime = await this.waitTimeProvider.getWaitTime(
        input.airportIata,
        flightInfo?.terminal ?? undefined,
      );
    } catch {
      waitTime = {
        value_minutes: input.airportRules.avg_security_wait_minutes,
        source_name: 'Airport Default',
        source_type: 'fallback',
        freshness_timestamp: new Date().toISOString(),
        confidence_level: 'low',
        notes: 'Using airport average',
      };
      overallConfidence = 'low';
    }

    // Apply trusted traveler reductions
    let securityMinutes = waitTime.value_minutes;
    if (input.hasClear) {
      securityMinutes = Math.max(5, Math.round(securityMinutes * 0.3));
      breakdown.push({
        label: 'Security (CLEAR)',
        minutes: securityMinutes,
        description: 'CLEAR members skip the main line',
        source: waitTime.source_name,
        source_type: waitTime.source_type,
        freshness: waitTime.freshness_timestamp,
      });
    } else if (input.hasTsaPrecheck) {
      securityMinutes = Math.max(5, Math.round(securityMinutes * 0.5));
      breakdown.push({
        label: 'Security (PreCheck)',
        minutes: securityMinutes,
        description: 'TSA PreCheck expedited screening',
        source: waitTime.source_name,
        source_type: waitTime.source_type,
        freshness: waitTime.freshness_timestamp,
      });
    } else {
      breakdown.push({
        label: 'Security wait',
        minutes: securityMinutes,
        description: 'Standard TSA screening',
        source: waitTime.source_name,
        source_type: waitTime.source_type,
        freshness: waitTime.freshness_timestamp,
      });
    }

    // 6. Airport walk time
    let walkMinutes = input.airportRules.security_to_gate_minutes;
    if (input.accessibilityNeeds) {
      walkMinutes = Math.round(walkMinutes * 1.5);
    }
    if (input.travelingWithKids) {
      walkMinutes = Math.round(walkMinutes * 1.3);
    }
    breakdown.push({
      label: 'Walk to gate',
      minutes: walkMinutes,
      description: input.accessibilityNeeds
        ? 'Adjusted for accessibility needs'
        : 'From security to your gate area',
    });

    // 7. Boarding buffer
    const boardingBuffer = Math.round(
      input.airlineRules.boarding_begins_minutes * riskMultiplier,
    );
    breakdown.push({
      label: 'Boarding buffer',
      minutes: boardingBuffer,
      description: `Arrive before boarding begins (${input.riskProfile} profile)`,
    });

    // 8. Party size buffer
    let partySizeBuffer = 0;
    if (input.partySize > 3) {
      partySizeBuffer = 5;
      breakdown.push({
        label: 'Group buffer',
        minutes: partySizeBuffer,
        description: `Extra time for a party of ${input.partySize}`,
      });
    }

    // 9. International buffer
    let internationalBuffer = 0;
    if (input.flightType === 'international') {
      internationalBuffer = 15;
      breakdown.push({
        label: 'International buffer',
        minutes: internationalBuffer,
        description: 'Extra time for international departure procedures',
      });
    }

    // Calculate totals
    const totalMinutes =
      trafficMinutes +
      pickupBuffer +
      bagDropBuffer +
      securityMinutes +
      walkMinutes +
      boardingBuffer +
      partySizeBuffer +
      internationalBuffer;

    // Work backwards from departure
    const departureMs = actualDeparture.getTime();
    const recommendedLeaveMs = departureMs - totalMinutes * 60_000;
    const windowPaddingMs = Math.round(15 * riskMultiplier) * 60_000;

    const recommendedLeaveTime = new Date(recommendedLeaveMs);
    const leaveWindowStart = new Date(recommendedLeaveMs - windowPaddingMs);
    const leaveWindowEnd = new Date(recommendedLeaveMs + windowPaddingMs / 2);

    // Curb arrival = leave time + traffic + pickup buffer
    const curbArrivalMs = recommendedLeaveMs + (trafficMinutes + pickupBuffer) * 60_000;
    const recommendedCurbArrival = new Date(curbArrivalMs);

    // Latest safe times
    const gateCloseMs = departureMs - input.airlineRules.gate_close_minutes * 60_000;
    const latestSafeGate = new Date(gateCloseMs - walkMinutes * 60_000);
    const latestSafeSecurity = new Date(latestSafeGate.getTime() - securityMinutes * 60_000);
    const latestSafeBagDrop = input.hasCheckedBags
      ? new Date(departureMs - input.airlineRules.bag_drop_cutoff_minutes * 60_000).toISOString()
      : null;

    // Confidence score
    let confidenceScore = 85;
    if (waitTime.confidence_level === 'low') confidenceScore -= 20;
    if (waitTime.confidence_level === 'medium') confidenceScore -= 10;
    if (traffic.source === 'fallback' || traffic.source === 'mock') confidenceScore -= 15;
    if (flightInfo?.source === 'mock') confidenceScore -= 10;
    confidenceScore = Math.max(20, Math.min(100, confidenceScore));

    if (confidenceScore >= 70) overallConfidence = 'high';
    else if (confidenceScore >= 45) overallConfidence = 'medium';
    else overallConfidence = 'low';

    // Summary
    const leaveTimeStr = formatTime(recommendedLeaveTime);
    const summary = `Leave by ${leaveTimeStr} to comfortably make your ${formatTime(actualDeparture)} flight. ${
      overallConfidence === 'high'
        ? 'We\'re confident in this estimate.'
        : overallConfidence === 'medium'
          ? 'Some data sources are estimates — consider leaving a bit earlier.'
          : 'Limited data available — we recommend extra buffer time.'
    }`;

    return {
      id: crypto.randomUUID(),
      trip_id: input.tripId,
      recommended_leave_time: recommendedLeaveTime.toISOString(),
      leave_window_start: leaveWindowStart.toISOString(),
      leave_window_end: leaveWindowEnd.toISOString(),
      recommended_curb_arrival: recommendedCurbArrival.toISOString(),
      latest_safe_bag_drop: latestSafeBagDrop,
      latest_safe_security_entry: latestSafeSecurity.toISOString(),
      latest_safe_gate_arrival: latestSafeGate.toISOString(),
      confidence: overallConfidence,
      confidence_score: confidenceScore,
      breakdown,
      total_minutes: totalMinutes,
      summary,
      warnings,
      computed_at: new Date().toISOString(),
      version: 1,
    };
  }
}

function getPickupBuffer(rideMode: RideMode): number {
  switch (rideMode) {
    case 'rideshare': return 10;
    case 'friend_dropoff': return 5;
    case 'self_drive': return 10; // parking buffer
    case 'transit': return 15;
  }
}

function getPickupDescription(rideMode: RideMode): string {
  switch (rideMode) {
    case 'rideshare': return 'Wait for rideshare pickup';
    case 'friend_dropoff': return 'Coordination buffer for dropoff';
    case 'self_drive': return 'Parking and shuttle/walk to terminal';
    case 'transit': return 'Transit schedule uncertainty';
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
