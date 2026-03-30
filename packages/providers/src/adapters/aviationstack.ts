import type { FlightInfo } from '@boarding/domain';
import type { FlightProvider } from '../interfaces';

/**
 * AviationStack flight lookup provider.
 * Free tier: 100 requests/month at http://api.aviationstack.com/v1/flights
 * Docs: https://aviationstack.com/documentation
 */

type AviationStackOptions = {
  apiKey: string;
};

type AviationStackFlight = {
  flight_date: string;
  flight_status: string;
  departure: {
    airport: string;
    timezone: string;
    iata: string;
    terminal: string | null;
    gate: string | null;
    delay: number | null;
    scheduled: string;
    estimated: string | null;
    actual: string | null;
  };
  arrival: {
    airport: string;
    iata: string;
    terminal: string | null;
    gate: string | null;
    scheduled: string;
    estimated: string | null;
    actual: string | null;
  };
  airline: {
    name: string;
    iata: string;
  };
  flight: {
    number: string;
    iata: string;
  };
};

export class AviationStackFlightProvider implements FlightProvider {
  constructor(private options: AviationStackOptions) {}

  async getFlightInfo(
    airlineIata: string,
    flightNumber: string,
    date: string,
  ): Promise<FlightInfo | null> {
    const iataFlight = `${airlineIata}${flightNumber}`;
    const url = new URL('http://api.aviationstack.com/v1/flights');
    url.searchParams.set('access_key', this.options.apiKey);
    url.searchParams.set('flight_iata', iataFlight);
    url.searchParams.set('flight_date', date);
    url.searchParams.set('limit', '1');

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`AviationStack request failed: ${response.status}`);
    }

    const payload = await response.json() as {
      data?: AviationStackFlight[];
      error?: { message: string };
    };

    if (payload.error) {
      throw new Error(`AviationStack error: ${payload.error.message}`);
    }

    const flight = payload.data?.[0];
    if (!flight) return null;

    const scheduledDeparture = flight.departure.scheduled;
    const estimatedDeparture = flight.departure.estimated ?? flight.departure.actual ?? null;
    const delayMinutes = flight.departure.delay ?? 0;

    return {
      airline_iata: flight.airline.iata || airlineIata,
      flight_number: flight.flight.number || flightNumber,
      departure_airport: flight.departure.iata,
      departure_airport_name: flight.departure.airport,
      departure_timezone: flight.departure.timezone,
      arrival_airport: flight.arrival.iata,
      scheduled_departure: scheduledDeparture,
      estimated_departure: estimatedDeparture !== scheduledDeparture ? estimatedDeparture : null,
      status: normalizeStatus(flight.flight_status),
      terminal: flight.departure.terminal,
      gate: flight.departure.gate,
      flight_type: 'domestic', // AviationStack doesn't distinguish; caller can override
      delay_minutes: delayMinutes,
      source: 'aviationstack',
      source_name: 'AviationStack',
      source_type: 'live_api',
      notes: null,
      fetched_at: new Date().toISOString(),
    };
  }

  /**
   * Look up a flight by flight number only (no date required).
   * Returns the next upcoming flight matching the flight number.
   */
  async lookupByFlightNumber(flightIata: string): Promise<FlightInfo | null> {
    const url = new URL('http://api.aviationstack.com/v1/flights');
    url.searchParams.set('access_key', this.options.apiKey);
    url.searchParams.set('flight_iata', flightIata);
    url.searchParams.set('limit', '1');

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`AviationStack request failed: ${response.status}`);
    }

    const payload = await response.json() as {
      data?: AviationStackFlight[];
      error?: { message: string };
    };

    if (payload.error) {
      throw new Error(`AviationStack error: ${payload.error.message}`);
    }

    const flight = payload.data?.[0];
    if (!flight) return null;

    const scheduledDeparture = flight.departure.scheduled;
    const estimatedDeparture = flight.departure.estimated ?? flight.departure.actual ?? null;
    const delayMinutes = flight.departure.delay ?? 0;

    return {
      airline_iata: flight.airline.iata,
      flight_number: flight.flight.number,
      departure_airport: flight.departure.iata,
      departure_airport_name: flight.departure.airport,
      departure_timezone: flight.departure.timezone,
      arrival_airport: flight.arrival.iata,
      scheduled_departure: scheduledDeparture,
      estimated_departure: estimatedDeparture !== scheduledDeparture ? estimatedDeparture : null,
      status: normalizeStatus(flight.flight_status),
      terminal: flight.departure.terminal,
      gate: flight.departure.gate,
      flight_type: 'domestic',
      delay_minutes: delayMinutes,
      source: 'aviationstack',
      source_name: 'AviationStack',
      source_type: 'live_api',
      notes: null,
      fetched_at: new Date().toISOString(),
    };
  }
}

function normalizeStatus(status: string | null | undefined): FlightInfo['status'] {
  const s = (status ?? '').toLowerCase();
  if (s.includes('cancel')) return 'cancelled';
  if (s.includes('active') || s.includes('en-route')) return 'departed';
  if (s.includes('landed') || s.includes('arrived')) return 'arrived';
  if (s.includes('delay')) return 'delayed';
  if (s.includes('board')) return 'boarding';
  return 'scheduled';
}
