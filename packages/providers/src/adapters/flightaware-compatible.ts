import type { FlightInfo } from '@gateshare/domain';
import type { FlightProvider } from '../interfaces';

type FlightAwareCompatibleFlightProviderOptions = {
  apiKey: string;
  baseUrl?: string;
};

export class FlightAwareCompatibleFlightProvider implements FlightProvider {
  private readonly baseUrl: string;

  constructor(private options: FlightAwareCompatibleFlightProviderOptions) {
    this.baseUrl = options.baseUrl ?? 'https://aeroapi.flightaware.com/aeroapi';
  }

  async getFlightInfo(
    airlineIata: string,
    flightNumber: string,
    date: string,
  ): Promise<FlightInfo | null> {
    const start = `${date}T00:00:00Z`;
    const end = `${date}T23:59:59Z`;
    const ident = `${airlineIata}${flightNumber}`;

    const response = await fetch(
      `${this.baseUrl}/flights/${encodeURIComponent(ident)}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&max_pages=1`,
      {
        headers: {
          'x-apikey': this.options.apiKey,
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Flight lookup failed: ${response.status}`);
    }

    const payload = await response.json() as {
      flights?: Array<{
        ident_iata?: string | null;
        operator_iata?: string | null;
        flight_number?: string | null;
        origin?: {
          code_iata?: string | null;
          name?: string | null;
          timezone?: string | null;
        } | null;
        destination?: {
          code_iata?: string | null;
        } | null;
        scheduled_out?: string | null;
        estimated_out?: string | null;
        terminal_origin?: string | null;
        gate_origin?: string | null;
        status?: string | null;
      }>;
    };

    const flight = payload.flights?.[0];
    if (!flight?.scheduled_out || !flight.origin?.code_iata) {
      return null;
    }

    const normalizedStatus = normalizeStatus(flight.status);
    const estimatedDeparture = flight.estimated_out && flight.estimated_out !== flight.scheduled_out
      ? flight.estimated_out
      : null;

    return {
      airline_iata: flight.operator_iata ?? airlineIata,
      flight_number: flight.flight_number ?? flightNumber,
      departure_airport: flight.origin.code_iata,
      departure_airport_name: flight.origin.name ?? null,
      departure_timezone: flight.origin.timezone ?? null,
      arrival_airport: flight.destination?.code_iata ?? null,
      scheduled_departure: flight.scheduled_out,
      estimated_departure: estimatedDeparture,
      status: normalizedStatus,
      terminal: flight.terminal_origin ?? null,
      gate: flight.gate_origin ?? null,
      flight_type: 'domestic',
      delay_minutes: estimatedDeparture
        ? Math.max(
            0,
            Math.round(
              (new Date(estimatedDeparture).getTime() - new Date(flight.scheduled_out).getTime()) / 60_000,
            ),
          )
        : 0,
      source: 'flightaware-compatible',
      source_name: 'FlightAware-compatible lookup',
      source_type: 'live_api',
      notes: null,
      fetched_at: new Date().toISOString(),
    };
  }
}

function normalizeStatus(status: string | null | undefined): FlightInfo['status'] {
  const normalized = status?.toLowerCase() ?? 'scheduled';

  if (normalized.includes('cancel')) return 'cancelled';
  if (normalized.includes('board')) return 'boarding';
  if (normalized.includes('depart')) return 'departed';
  if (normalized.includes('arriv')) return 'arrived';
  if (normalized.includes('delay')) return 'delayed';

  return 'scheduled';
}
