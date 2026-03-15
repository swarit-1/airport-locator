import { NextResponse } from 'next/server';
import { z } from 'zod';
import { airportSeeds } from '@boarding/db';
import { getServerTripProviders } from '@/lib/server/provider-registry';
import { saveTrip, saveRecommendation } from '@/lib/server/demo-file-store';

const RecommendationRequestSchema = z.object({
  trip_id: z.string(),
  airline_iata: z.string().min(2).max(3),
  airline_name: z.string().min(1),
  flight_number: z.string().min(1),
  departure_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  departure_time: z.string().regex(/^\d{2}:\d{2}$/),
  airport_iata: z.string().min(3).max(3),
  flight_type: z.enum(['domestic', 'international']),
  origin_label: z.string().min(1),
  origin_lat: z.number(),
  origin_lng: z.number(),
  has_checked_bags: z.boolean(),
  bag_count: z.number().min(0),
  party_size: z.number().min(1),
  has_tsa_precheck: z.boolean(),
  has_clear: z.boolean(),
  traveling_with_kids: z.boolean(),
  accessibility_needs: z.boolean(),
  ride_mode: z.enum(['rideshare', 'friend_dropoff', 'self_drive', 'transit']),
  risk_profile: z.enum(['conservative', 'balanced', 'aggressive']),
  airport_rules: z.object({
    curb_to_bag_drop_minutes: z.number().min(0),
    bag_drop_to_security_minutes: z.number().min(0),
    security_to_gate_minutes: z.number().min(0),
    avg_security_wait_minutes: z.number().min(0),
    peak_security_wait_minutes: z.number().min(0),
    min_arrival_before_departure: z.number().min(0),
  }),
  airline_rules: z.object({
    bag_drop_cutoff_minutes: z.number().min(0),
    boarding_begins_minutes: z.number().min(0),
    gate_close_minutes: z.number().min(0),
  }),
});

export async function POST(request: Request) {
  try {
    const parsed = RecommendationRequestSchema.parse(await request.json());
    const airport = airportSeeds.find((item) => item.iata_code === parsed.airport_iata);

    if (!airport) {
      return NextResponse.json({ error: 'Unknown airport' }, { status: 404 });
    }

    const { recommendationEngine } = getServerTripProviders();
    const recommendation = await recommendationEngine.compute({
      tripId: parsed.trip_id,
      origin: { lat: parsed.origin_lat, lng: parsed.origin_lng },
      airportLocation: { lat: airport.lat, lng: airport.lng },
      airportIata: parsed.airport_iata,
      airportTimezone: airport.timezone,
      airlineIata: parsed.airline_iata,
      flightNumber: parsed.flight_number,
      departureDate: parsed.departure_date,
      departureTime: parsed.departure_time,
      flightType: parsed.flight_type,
      hasCheckedBags: parsed.has_checked_bags,
      bagCount: parsed.bag_count,
      partySize: parsed.party_size,
      hasTsaPrecheck: parsed.has_tsa_precheck,
      hasClear: parsed.has_clear,
      travelingWithKids: parsed.traveling_with_kids,
      accessibilityNeeds: parsed.accessibility_needs,
      rideMode: parsed.ride_mode,
      riskProfile: parsed.risk_profile,
      airportRules: parsed.airport_rules,
      airlineRules: parsed.airline_rules,
    });

    // Persist trip and recommendation server-side so share/circles pages
    // can read them immediately without waiting for client sync.
    saveTrip({
      id: parsed.trip_id,
      airline_iata: parsed.airline_iata,
      airline_name: parsed.airline_name,
      flight_number: parsed.flight_number,
      departure_date: parsed.departure_date,
      departure_time: parsed.departure_time,
      airport_iata: parsed.airport_iata,
      flight_type: parsed.flight_type,
      origin_label: parsed.origin_label,
      origin_lat: parsed.origin_lat,
      origin_lng: parsed.origin_lng,
      has_checked_bags: parsed.has_checked_bags,
      bag_count: parsed.bag_count,
      party_size: parsed.party_size,
      has_tsa_precheck: parsed.has_tsa_precheck,
      has_clear: parsed.has_clear,
      traveling_with_kids: parsed.traveling_with_kids,
      accessibility_needs: parsed.accessibility_needs,
      ride_mode: parsed.ride_mode,
      risk_profile: parsed.risk_profile,
      created_at: new Date().toISOString(),
    });

    saveRecommendation({
      ...recommendation,
      airline_name: parsed.airline_name,
      flight_number: parsed.flight_number,
      airport_iata: parsed.airport_iata,
      departure_time: parsed.departure_time,
      departure_date: parsed.departure_date,
    });

    return NextResponse.json({ recommendation });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Recommendation failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
