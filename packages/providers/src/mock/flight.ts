import type { FlightInfo } from '@boarding/domain';
import type { FlightProvider } from '../interfaces';

type MockFlightSeed = {
  departure_airport: string;
  departure_airport_name: string;
  departure_timezone: string;
  arrival_airport: string;
  terminal: string | null;
  gate: string | null;
  delay_minutes: number;
  flight_type: FlightInfo['flight_type'];
  notes?: string;
};

const AIRPORT_META: Record<
  string,
  { name: string; timezone: string }
> = {
  SEA: { name: 'Seattle-Tacoma International Airport', timezone: 'America/Los_Angeles' },
  MCO: { name: 'Orlando International Airport', timezone: 'America/New_York' },
  DEN: { name: 'Denver International Airport', timezone: 'America/Denver' },
  DFW: { name: 'Dallas/Fort Worth International Airport', timezone: 'America/Chicago' },
  LAX: { name: 'Los Angeles International Airport', timezone: 'America/Los_Angeles' },
  SFO: { name: 'San Francisco International Airport', timezone: 'America/Los_Angeles' },
  ATL: { name: 'Hartsfield-Jackson Atlanta International Airport', timezone: 'America/New_York' },
  JFK: { name: 'John F. Kennedy International Airport', timezone: 'America/New_York' },
  LGA: { name: 'LaGuardia Airport', timezone: 'America/New_York' },
  ORD: { name: "O'Hare International Airport", timezone: 'America/Chicago' },
};

const MOCK_FLIGHTS: Record<string, MockFlightSeed> = {
  'AA-1234': {
    departure_airport: 'DFW',
    departure_airport_name: AIRPORT_META.DFW!.name,
    departure_timezone: AIRPORT_META.DFW!.timezone,
    arrival_airport: 'LAX',
    terminal: 'B',
    gate: 'B22',
    delay_minutes: 0,
    flight_type: 'domestic',
  },
  'DL-567': {
    departure_airport: 'SEA',
    departure_airport_name: AIRPORT_META.SEA!.name,
    departure_timezone: AIRPORT_META.SEA!.timezone,
    arrival_airport: 'ATL',
    terminal: 'S',
    gate: 'S8',
    delay_minutes: 15,
    flight_type: 'domestic',
  },
  'UA-890': {
    departure_airport: 'ORD',
    departure_airport_name: AIRPORT_META.ORD!.name,
    departure_timezone: AIRPORT_META.ORD!.timezone,
    arrival_airport: 'SFO',
    terminal: '1',
    gate: 'C18',
    delay_minutes: 0,
    flight_type: 'domestic',
  },
  'WN-456': {
    departure_airport: 'DEN',
    departure_airport_name: AIRPORT_META.DEN!.name,
    departure_timezone: AIRPORT_META.DEN!.timezone,
    arrival_airport: 'MCO',
    terminal: null,
    gate: 'A35',
    delay_minutes: 0,
    flight_type: 'domestic',
  },
  'DL-1286': {
    departure_airport: 'SEA',
    departure_airport_name: AIRPORT_META.SEA!.name,
    departure_timezone: AIRPORT_META.SEA!.timezone,
    arrival_airport: 'LAX',
    terminal: 'A',
    gate: 'A7',
    delay_minutes: 5,
    flight_type: 'domestic',
    notes: 'Demo flight used in landing page copy.',
  },
};

const DEPARTURE_AIRPORTS = Object.keys(AIRPORT_META);

export class MockFlightProvider implements FlightProvider {
  async getFlightInfo(
    airlineIata: string,
    flightNumber: string,
    date: string,
  ): Promise<FlightInfo | null> {
    const key = `${airlineIata}-${flightNumber}`;
    const seeded = MOCK_FLIGHTS[key] ?? createSeededFlight(key);

    const scheduledHour = 6 + (hashCode(`${key}-hour`) % 13);
    const scheduledMinutes = (hashCode(`${key}-minute`) % 4) * 15;
    const scheduledDeparture = createUtcIsoForLocalTime(
      date,
      scheduledHour,
      scheduledMinutes,
      seeded.departure_timezone,
    );

    const estimatedDeparture = seeded.delay_minutes > 0
      ? new Date(new Date(scheduledDeparture).getTime() + seeded.delay_minutes * 60_000).toISOString()
      : null;

    return {
      airline_iata: airlineIata,
      flight_number: flightNumber,
      departure_airport: seeded.departure_airport,
      departure_airport_name: seeded.departure_airport_name,
      departure_timezone: seeded.departure_timezone,
      arrival_airport: seeded.arrival_airport,
      scheduled_departure: scheduledDeparture,
      estimated_departure: estimatedDeparture,
      status: seeded.delay_minutes > 0 ? 'delayed' : 'scheduled',
      terminal: seeded.terminal,
      gate: seeded.gate,
      flight_type: seeded.flight_type,
      delay_minutes: seeded.delay_minutes,
      source: 'mock',
      source_name: 'Deterministic flight schedule',
      source_type: 'mock',
      notes: seeded.notes ?? null,
      fetched_at: new Date().toISOString(),
    };
  }
}

function createSeededFlight(key: string): MockFlightSeed {
  const departure_airport = DEPARTURE_AIRPORTS[hashCode(`${key}-departure`) % DEPARTURE_AIRPORTS.length] ?? 'SEA';
  const arrival_airport = DEPARTURE_AIRPORTS[hashCode(`${key}-arrival`) % DEPARTURE_AIRPORTS.length] ?? 'LAX';
  const meta = AIRPORT_META[departure_airport] ?? AIRPORT_META.SEA!;

  return {
    departure_airport,
    departure_airport_name: meta.name,
    departure_timezone: meta.timezone,
    arrival_airport: arrival_airport === departure_airport ? 'LAX' : arrival_airport,
    terminal: `${1 + (hashCode(`${key}-terminal`) % 4)}`,
    gate: `${String.fromCharCode(65 + (hashCode(`${key}-concourse`) % 4))}${1 + (hashCode(`${key}-gate`) % 34)}`,
    delay_minutes: hashCode(`${key}-delay`) % 3 === 0 ? 10 : 0,
    flight_type: 'domestic',
    notes: 'Fallback flight metadata generated from a deterministic seed.',
  };
}

function createUtcIsoForLocalTime(
  date: string,
  hour: number,
  minute: number,
  timezone: string,
): string {
  const naive = `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const assumedUtc = new Date(`${naive}Z`);
    const parts = formatter.formatToParts(assumedUtc);
    const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '00';
    const localAsUtc = new Date(
      `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}Z`,
    );
    const offsetMs = localAsUtc.getTime() - assumedUtc.getTime();
    return new Date(assumedUtc.getTime() - offsetMs).toISOString();
  } catch {
    return new Date(`${naive}Z`).toISOString();
  }
}

function hashCode(str: string): number {
  let hash = 0;
  for (let index = 0; index < str.length; index += 1) {
    const char = str.charCodeAt(index);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}
