import { describe, expect, it } from 'vitest';
import { formatIsoForAirport, normalizeFlightAutofill } from '../server/flight-lookup';

describe('flight lookup helpers', () => {
  it('formats an ISO departure in the airport timezone', () => {
    expect(
      formatIsoForAirport('2026-03-15T21:30:00.000Z', 'America/Los_Angeles'),
    ).toEqual({
      date: '2026-03-15',
      time: '14:30',
    });
  });

  it('prefers the estimated departure when normalizing autofill', () => {
    const normalized = normalizeFlightAutofill({
      airline_iata: 'DL',
      flight_number: '1286',
      departure_airport: 'SEA',
      departure_airport_name: 'Seattle-Tacoma International Airport',
      departure_timezone: 'America/Los_Angeles',
      arrival_airport: 'LAX',
      scheduled_departure: '2026-03-15T21:30:00.000Z',
      estimated_departure: '2026-03-15T21:45:00.000Z',
      status: 'delayed',
      terminal: 'A',
      gate: 'A7',
      flight_type: 'domestic',
      delay_minutes: 15,
      source: 'mock',
      source_name: 'Deterministic flight schedule',
      source_type: 'mock',
      notes: 'Demo delay',
      fetched_at: '2026-03-12T12:00:00.000Z',
    });

    expect(normalized.departure_time).toBe('14:45');
    expect(normalized.airport_iata).toBe('SEA');
    expect(normalized.source_name).toBe('Deterministic flight schedule');
  });
});
