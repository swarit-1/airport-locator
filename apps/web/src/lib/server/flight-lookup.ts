import type { FlightInfo } from '@gateshare/domain';

export type FlightAutofill = {
  airline_iata: string;
  flight_number: string;
  airport_iata: string;
  airport_name: string | null;
  airport_timezone: string | null;
  departure_date: string;
  departure_time: string;
  terminal: string | null;
  gate: string | null;
  flight_type: FlightInfo['flight_type'];
  status: FlightInfo['status'];
  delay_minutes: number;
  source_name: string;
  source_type: FlightInfo['source_type'];
  notes: string | null;
};

export function normalizeFlightAutofill(flight: FlightInfo): FlightAutofill {
  const timezone = flight.departure_timezone ?? 'UTC';
  const actualDeparture = flight.estimated_departure ?? flight.scheduled_departure;
  const localized = formatIsoForAirport(actualDeparture, timezone);

  return {
    airline_iata: flight.airline_iata,
    flight_number: flight.flight_number,
    airport_iata: flight.departure_airport,
    airport_name: flight.departure_airport_name ?? null,
    airport_timezone: flight.departure_timezone ?? null,
    departure_date: localized.date,
    departure_time: localized.time,
    terminal: flight.terminal ?? null,
    gate: flight.gate ?? null,
    flight_type: flight.flight_type,
    status: flight.status,
    delay_minutes: flight.delay_minutes,
    source_name: flight.source_name,
    source_type: flight.source_type,
    notes: flight.notes ?? null,
  };
}

export function formatIsoForAirport(
  isoString: string,
  timezone: string,
): { date: string; time: string } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date(isoString));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '00';

  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}`,
  };
}
