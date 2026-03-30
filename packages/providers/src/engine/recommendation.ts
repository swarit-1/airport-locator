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
} from '@boarding/domain';
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
  airportTimezone: string; // e.g. "America/Los_Angeles"
  airlineIata: string;
  flightNumber: string;
  departureDate: string;  // YYYY-MM-DD
  departureTime: string;  // HH:MM in airport-local time
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

const RISK_MULTIPLIERS: Record<RiskProfile, number> = {
  conservative: 1.5,
  balanced: 1.0,
  aggressive: 0.7,
};

/**
 * Parse a date + time string in a specific IANA timezone into a UTC Date.
 * Falls back to treating as UTC if Intl is unavailable.
 */
export function parseLocalTime(date: string, time: string, timezone: string): Date {
  // Build an ISO-like string without Z so Date.parse doesn't assume UTC
  const naive = `${date}T${time}:00`;
  try {
    // Use Intl to find the UTC offset for this timezone at this moment
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    });
    // Create a date assuming UTC, then compute the offset
    const asUtc = new Date(naive + 'Z');
    const parts = formatter.formatToParts(asUtc);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
    const localStr = `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}Z`;
    const localAsUtc = new Date(localStr);
    // offset = local - UTC (in ms)
    const offsetMs = localAsUtc.getTime() - asUtc.getTime();
    // The actual UTC time: naive local time minus the offset
    return new Date(new Date(naive + 'Z').getTime() - offsetMs);
  } catch {
    // Fallback: treat as UTC (better than crashing)
    return new Date(naive + 'Z');
  }
}

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

    // 1. Parse departure in airport-local timezone → UTC
    const scheduledDeparture = parseLocalTime(
      input.departureDate,
      input.departureTime,
      input.airportTimezone,
    );

    // 2. Get flight info (may have delay)
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

    // Always use the user's entered departure time as the baseline.
    // Only apply the delay offset from the flight provider — don't replace
    // the departure time entirely (mock providers generate random times).
    let actualDeparture = scheduledDeparture;
    if (flightInfo?.delay_minutes && flightInfo.delay_minutes > 0) {
      actualDeparture = new Date(scheduledDeparture.getTime() + flightInfo.delay_minutes * 60_000);
      warnings.push(`Flight is delayed by ${flightInfo.delay_minutes} minutes. Adjusted departure to account for delay.`);
    }

    // 3. Traffic estimate
    let traffic: TrafficResult;
    try {
      traffic = await this.trafficProvider.getTrafficEstimate(
        input.origin,
        input.airportLocation,
        actualDeparture,
      );
    } catch {
      traffic = {
        duration_minutes: 30,
        duration_in_traffic_minutes: 40,
        distance_km: 25,
        source: 'fallback',
        source_name: 'Fallback traffic model',
        source_type: 'fallback',
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
      source_type: traffic.source_type,
      freshness: traffic.fetched_at,
    });

    // 4. Pickup buffer
    const pickupBufferBase = getPickupBuffer(input.rideMode);
    const pickupBuffer = Math.round(pickupBufferBase * riskMultiplier);
    breakdown.push({
      label: 'Pickup buffer',
      minutes: pickupBuffer,
      description: getPickupDescription(input.rideMode),
    });

    // 5. Bag check path: curb → bag drop → walk to security
    let bagCheckMinutes = 0;
    if (input.hasCheckedBags) {
      const curbToDrop = input.airportRules.curb_to_bag_drop_minutes;
      const dropToSecurity = input.airportRules.bag_drop_to_security_minutes;
      const extraBagTime = input.bagCount > 2 ? 5 : 0;
      bagCheckMinutes = curbToDrop + dropToSecurity + extraBagTime;
      breakdown.push({
        label: 'Bag check',
        minutes: bagCheckMinutes,
        description: input.bagCount > 2
          ? `Curb to bag drop (${curbToDrop} min) + walk to security (${dropToSecurity} min) + extra for ${input.bagCount} bags`
          : `Curb to bag drop (${curbToDrop} min) + walk to security (${dropToSecurity} min)`,
      });
    }

    // 6. Security wait
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

    // 7. Walk from security to gate
    let walkMinutes = input.airportRules.security_to_gate_minutes;
    if (input.accessibilityNeeds) walkMinutes = Math.round(walkMinutes * 1.5);
    if (input.travelingWithKids) walkMinutes = Math.round(walkMinutes * 1.3);
    breakdown.push({
      label: 'Walk to gate',
      minutes: walkMinutes,
      description: input.accessibilityNeeds
        ? 'Adjusted for accessibility needs'
        : 'From security exit to gate area',
    });

    // 8. Boarding buffer (arrive before boarding starts)
    const boardingBuffer = Math.round(input.airlineRules.boarding_begins_minutes * riskMultiplier);
    breakdown.push({
      label: 'Pre-boarding buffer',
      minutes: boardingBuffer,
      description: `Arrive before boarding begins (${input.riskProfile})`,
    });

    // 9. Party size buffer
    let partySizeBuffer = 0;
    if (input.partySize > 3) {
      partySizeBuffer = 5;
      breakdown.push({
        label: 'Group buffer',
        minutes: partySizeBuffer,
        description: `Extra time for a party of ${input.partySize}`,
      });
    }

    // 10. International buffer
    let internationalBuffer = 0;
    if (input.flightType === 'international') {
      internationalBuffer = 15;
      breakdown.push({
        label: 'International buffer',
        minutes: internationalBuffer,
        description: 'Extra time for international departure procedures',
      });
    }

    // ─── Compute totals ───────────────────────────────────────────────
    const totalMinutes =
      trafficMinutes + pickupBuffer + bagCheckMinutes +
      securityMinutes + walkMinutes + boardingBuffer +
      partySizeBuffer + internationalBuffer;

    const departureMs = actualDeparture.getTime();
    const recommendedLeaveMs = departureMs - totalMinutes * 60_000;
    const windowPaddingMs = Math.round(15 * riskMultiplier) * 60_000;

    const recommendedLeaveTime = new Date(recommendedLeaveMs);
    const leaveWindowStart = new Date(recommendedLeaveMs - windowPaddingMs);
    const leaveWindowEnd = new Date(recommendedLeaveMs + Math.round(windowPaddingMs * 0.5));

    // Curb arrival = leave time + traffic + pickup buffer
    const curbArrivalMs = recommendedLeaveMs + (trafficMinutes + pickupBuffer) * 60_000;
    const recommendedCurbArrival = new Date(curbArrivalMs);

    // ─── Latest safe milestones (working backwards from gate close) ───
    // Gate close is the hard deadline
    const gateCloseMs = departureMs - input.airlineRules.gate_close_minutes * 60_000;

    // Must be at gate before gate close
    const latestSafeGateMs = gateCloseMs;
    const latestSafeGate = new Date(latestSafeGateMs);

    // Must clear security: gate arrival - walk time
    const latestSafeSecurityExitMs = latestSafeGateMs - walkMinutes * 60_000;
    // Must enter security: security exit - security wait
    const latestSafeSecurityEntryMs = latestSafeSecurityExitMs - securityMinutes * 60_000;
    const latestSafeSecurityEntry = new Date(latestSafeSecurityEntryMs);

    // Bag drop deadline: airline cutoff from departure OR
    // must complete bag drop + walk to security before latest security entry
    let latestSafeBagDrop: string | null = null;
    if (input.hasCheckedBags) {
      const airlineBagCutoffMs = departureMs - input.airlineRules.bag_drop_cutoff_minutes * 60_000;
      const walkFromDropMs = input.airportRules.bag_drop_to_security_minutes * 60_000;
      const structuralBagDeadlineMs = latestSafeSecurityEntryMs - walkFromDropMs;
      // Use whichever is earlier (more conservative)
      const bagDropMs = Math.min(airlineBagCutoffMs, structuralBagDeadlineMs);
      latestSafeBagDrop = new Date(bagDropMs).toISOString();
    }

    // ─── Confidence ───────────────────────────────────────────────────
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
    const departureStr = formatTime(actualDeparture);
    const summary = `Leave by ${leaveTimeStr} to comfortably make your ${departureStr} flight. ${
      overallConfidence === 'high'
        ? "We're confident in this estimate."
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
      latest_safe_security_entry: latestSafeSecurityEntry.toISOString(),
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
    case 'self_drive': return 10;
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
