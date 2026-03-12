import type { FlightInfo } from '@gateshare/domain';
import type { FlightProvider } from '../interfaces';

const MOCK_FLIGHTS: Record<string, Partial<FlightInfo>> = {
  'AA-1234': {
    arrival_airport: 'LAX',
    terminal: 'B',
    gate: 'B22',
    delay_minutes: 0,
  },
  'DL-567': {
    arrival_airport: 'ATL',
    terminal: 'S',
    gate: 'S8',
    delay_minutes: 15,
  },
  'UA-890': {
    arrival_airport: 'ORD',
    terminal: '1',
    gate: 'C18',
    delay_minutes: 0,
  },
  'WN-456': {
    arrival_airport: 'DEN',
    terminal: null,
    gate: 'A35',
    delay_minutes: 0,
  },
};

export class MockFlightProvider implements FlightProvider {
  async getFlightInfo(
    airlineIata: string,
    flightNumber: string,
    date: string,
  ): Promise<FlightInfo | null> {
    const key = `${airlineIata}-${flightNumber}`;
    const mock = MOCK_FLIGHTS[key];

    // Generate a plausible flight even without a predefined mock
    const scheduledHour = 8 + (hashCode(key) % 12); // 8am-8pm
    const scheduledMinutes = (hashCode(key + 'min') % 4) * 15; // :00, :15, :30, :45
    const scheduledDeparture = `${date}T${String(scheduledHour).padStart(2, '0')}:${String(scheduledMinutes).padStart(2, '0')}:00.000Z`;

    const delayMinutes = mock?.delay_minutes ?? 0;
    const estimatedDeparture = delayMinutes > 0
      ? new Date(new Date(scheduledDeparture).getTime() + delayMinutes * 60000).toISOString()
      : null;

    return {
      airline_iata: airlineIata,
      flight_number: flightNumber,
      departure_airport: 'SEA', // Default, will be overridden by trip context
      arrival_airport: mock?.arrival_airport ?? 'LAX',
      scheduled_departure: scheduledDeparture,
      estimated_departure: estimatedDeparture,
      status: delayMinutes > 0 ? 'delayed' : 'scheduled',
      terminal: mock?.terminal ?? 'A',
      gate: mock?.gate ?? `A${1 + (hashCode(key) % 40)}`,
      delay_minutes: delayMinutes,
      source: 'mock',
      fetched_at: new Date().toISOString(),
    };
  }
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
