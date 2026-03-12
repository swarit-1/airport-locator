export const airportSeeds = [
  { iata_code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', state: 'WA', lat: 47.4502, lng: -122.3088, timezone: 'America/Los_Angeles' },
  { iata_code: 'MCO', name: 'Orlando International Airport', city: 'Orlando', state: 'FL', lat: 28.4312, lng: -81.3081, timezone: 'America/New_York' },
  { iata_code: 'DEN', name: 'Denver International Airport', city: 'Denver', state: 'CO', lat: 39.8561, lng: -104.6737, timezone: 'America/Denver' },
  { iata_code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', state: 'TX', lat: 32.8998, lng: -97.0403, timezone: 'America/Chicago' },
  { iata_code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', state: 'CA', lat: 33.9416, lng: -118.4085, timezone: 'America/Los_Angeles' },
  { iata_code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', state: 'CA', lat: 37.6213, lng: -122.3790, timezone: 'America/Los_Angeles' },
  { iata_code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', state: 'GA', lat: 33.6407, lng: -84.4277, timezone: 'America/New_York' },
  { iata_code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', state: 'NY', lat: 40.6413, lng: -73.7781, timezone: 'America/New_York' },
  { iata_code: 'LGA', name: 'LaGuardia Airport', city: 'New York', state: 'NY', lat: 40.7769, lng: -73.8740, timezone: 'America/New_York' },
  { iata_code: 'ORD', name: "O'Hare International Airport", city: 'Chicago', state: 'IL', lat: 41.9742, lng: -87.9073, timezone: 'America/Chicago' },
];

// Airport profiles (domestic + international for each)
export const airportProfileSeeds = airportSeeds.map((airport) => [
  {
    iata_code: airport.iata_code,
    flight_type: 'domestic' as const,
    curb_to_bag_drop_minutes: airport.iata_code === 'ATL' ? 12 : airport.iata_code === 'DEN' ? 15 : 10,
    bag_drop_to_security_minutes: airport.iata_code === 'DEN' ? 8 : 5,
    security_to_gate_minutes:
      airport.iata_code === 'ATL' ? 20 :
      airport.iata_code === 'DEN' ? 18 :
      airport.iata_code === 'DFW' ? 18 :
      airport.iata_code === 'ORD' ? 17 : 15,
    avg_security_wait_minutes:
      airport.iata_code === 'LAX' ? 25 :
      airport.iata_code === 'JFK' ? 25 :
      airport.iata_code === 'ATL' ? 22 : 18,
    peak_security_wait_minutes:
      airport.iata_code === 'LAX' ? 55 :
      airport.iata_code === 'JFK' ? 55 :
      airport.iata_code === 'ATL' ? 50 : 40,
    min_arrival_before_departure: 60,
  },
  {
    iata_code: airport.iata_code,
    flight_type: 'international' as const,
    curb_to_bag_drop_minutes: airport.iata_code === 'ATL' ? 15 : 12,
    bag_drop_to_security_minutes: 7,
    security_to_gate_minutes:
      airport.iata_code === 'ATL' ? 25 :
      airport.iata_code === 'JFK' ? 22 : 18,
    avg_security_wait_minutes:
      airport.iata_code === 'LAX' ? 30 :
      airport.iata_code === 'JFK' ? 30 : 22,
    peak_security_wait_minutes:
      airport.iata_code === 'LAX' ? 60 :
      airport.iata_code === 'JFK' ? 60 : 50,
    min_arrival_before_departure: 120,
  },
]).flat();
