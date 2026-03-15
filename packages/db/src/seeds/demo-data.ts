// Demo data for local development
// These use fixed UUIDs for reproducibility

export const demoCommunity = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'University of Washington',
  slug: 'uw',
  type: 'campus' as const,
  description: 'UW Huskies heading to the airport together',
  email_domain: 'uw.edu',
  lat: 47.6553,
  lng: -122.3035,
};

export const demoUsers = [
  { id: '11111111-1111-1111-1111-111111111111', email: 'alice@demo.boarding.app', display_name: 'Alice Chen' },
  { id: '22222222-2222-2222-2222-222222222222', email: 'bob@demo.boarding.app', display_name: 'Bob Martinez' },
  { id: '33333333-3333-3333-3333-333333333333', email: 'carol@uw.edu', display_name: 'Carol Kim' },
];

// Tomorrow's date for demo data
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split('T')[0];

export const demoTrips = [
  {
    user_email: 'alice@demo.boarding.app',
    airline_iata: 'AA',
    flight_number: '1234',
    departure_date: tomorrowStr,
    departure_time: '14:30',
    airport_iata: 'SEA',
    flight_type: 'domestic' as const,
    origin_lat: 47.6062,
    origin_lng: -122.3321,
    origin_label: 'Downtown Seattle',
    has_checked_bags: true,
    bag_count: 1,
    party_size: 1,
    has_tsa_precheck: true,
    ride_mode: 'rideshare' as const,
    risk_profile: 'balanced' as const,
  },
  {
    user_email: 'bob@demo.boarding.app',
    airline_iata: 'DL',
    flight_number: '567',
    departure_date: tomorrowStr,
    departure_time: '15:00',
    airport_iata: 'SEA',
    flight_type: 'domestic' as const,
    origin_lat: 47.6205,
    origin_lng: -122.3493,
    origin_label: 'Queen Anne, Seattle',
    has_checked_bags: false,
    bag_count: 0,
    party_size: 2,
    has_tsa_precheck: false,
    ride_mode: 'rideshare' as const,
    risk_profile: 'conservative' as const,
  },
];

export const demoCircles = [
  {
    creator_email: 'alice@demo.boarding.app',
    airport_iata: 'SEA',
    circle_type: 'scheduled' as const,
    visibility: 'public' as const,
    target_leave_time: `${tomorrowStr}T11:00:00.000Z`,
    leave_window_start: `${tomorrowStr}T10:30:00.000Z`,
    leave_window_end: `${tomorrowStr}T11:30:00.000Z`,
    max_members: 4,
    max_detour_minutes: 15,
    origin_lat: 47.6062,
    origin_lng: -122.3321,
    proximity_radius_km: 10,
    estimated_savings_cents: 1500,
  },
  {
    creator_email: 'carol@uw.edu',
    airport_iata: 'SEA',
    circle_type: 'scheduled' as const,
    visibility: 'community' as const,
    target_leave_time: `${tomorrowStr}T09:00:00.000Z`,
    leave_window_start: `${tomorrowStr}T08:30:00.000Z`,
    leave_window_end: `${tomorrowStr}T09:30:00.000Z`,
    max_members: 3,
    max_detour_minutes: 10,
    origin_lat: 47.6553,
    origin_lng: -122.3035,
    proximity_radius_km: 5,
    estimated_savings_cents: 1200,
    community_slug: 'uw',
  },
];

export const demoWaitTimeReports = [
  { airport_iata: 'SEA', value_minutes: 18, source_name: 'Community Report', source_type: 'crowdsourced' as const, confidence_level: 'medium' as const, notes: 'Reported by traveler 30 min ago' },
  { airport_iata: 'LAX', value_minutes: 35, source_name: 'Community Report', source_type: 'crowdsourced' as const, confidence_level: 'medium' as const, notes: 'Tom Bradley terminal' },
  { airport_iata: 'JFK', value_minutes: 28, source_name: 'Community Report', source_type: 'crowdsourced' as const, confidence_level: 'low' as const, notes: 'Terminal 4, reported 2 hours ago' },
];
