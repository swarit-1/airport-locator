export const airlineSeeds = [
  { iata_code: 'AA', name: 'American Airlines' },
  { iata_code: 'DL', name: 'Delta Air Lines' },
  { iata_code: 'UA', name: 'United Airlines' },
  { iata_code: 'WN', name: 'Southwest Airlines' },
];

export const airlinePolicySeeds = [
  // American Airlines
  { iata_code: 'AA', flight_type: 'domestic' as const, bag_drop_cutoff_minutes: 45, boarding_begins_minutes: 30, gate_close_minutes: 15, recommended_checkin_minutes: 120 },
  { iata_code: 'AA', flight_type: 'international' as const, bag_drop_cutoff_minutes: 60, boarding_begins_minutes: 45, gate_close_minutes: 20, recommended_checkin_minutes: 180 },
  // Delta
  { iata_code: 'DL', flight_type: 'domestic' as const, bag_drop_cutoff_minutes: 40, boarding_begins_minutes: 30, gate_close_minutes: 15, recommended_checkin_minutes: 120 },
  { iata_code: 'DL', flight_type: 'international' as const, bag_drop_cutoff_minutes: 60, boarding_begins_minutes: 45, gate_close_minutes: 20, recommended_checkin_minutes: 180 },
  // United
  { iata_code: 'UA', flight_type: 'domestic' as const, bag_drop_cutoff_minutes: 45, boarding_begins_minutes: 30, gate_close_minutes: 15, recommended_checkin_minutes: 120 },
  { iata_code: 'UA', flight_type: 'international' as const, bag_drop_cutoff_minutes: 60, boarding_begins_minutes: 45, gate_close_minutes: 20, recommended_checkin_minutes: 180 },
  // Southwest
  { iata_code: 'WN', flight_type: 'domestic' as const, bag_drop_cutoff_minutes: 45, boarding_begins_minutes: 30, gate_close_minutes: 10, recommended_checkin_minutes: 120, notes: 'Open seating - earlier boarding is advantageous' },
  { iata_code: 'WN', flight_type: 'international' as const, bag_drop_cutoff_minutes: 60, boarding_begins_minutes: 45, gate_close_minutes: 15, recommended_checkin_minutes: 180 },
];
