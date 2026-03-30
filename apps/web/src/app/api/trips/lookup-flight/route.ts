import { NextResponse } from 'next/server';
import { z } from 'zod';
import { normalizeFlightAutofill } from '@/lib/server/flight-lookup';
import { getFlightLookupProvider, getServerFlightProvider } from '@/lib/server/provider-registry';

const LookupFlightSchema = z.object({
  flight_iata: z.string().min(3).max(10),
  departure_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

/**
 * POST /api/trips/lookup-flight
 *
 * Look up a flight by IATA flight number (e.g. "AA1234").
 * If departure_date is omitted, returns the next upcoming flight.
 * Auto-fills departure date, time, airport, terminal, gate.
 */
export async function POST(request: Request) {
  try {
    const parsed = LookupFlightSchema.parse(await request.json());
    const flightIata = parsed.flight_iata.toUpperCase().replace(/\s+/g, '');

    // Extract airline code and flight number
    const match = flightIata.match(/^([A-Z]{2})(\d+)$/);
    if (!match) {
      return NextResponse.json(
        { error: 'Invalid flight number format. Use airline code + number (e.g., AA1234)' },
        { status: 400 },
      );
    }
    const airlineIata = match[1]!;
    const flightNumber = match[2]!;

    // If date provided, use the standard flight provider
    if (parsed.departure_date) {
      const provider = getServerFlightProvider();
      const flight = await provider.getFlightInfo(airlineIata, flightNumber, parsed.departure_date);
      if (!flight) {
        return NextResponse.json({ found: false });
      }
      return NextResponse.json({ found: true, flight: normalizeFlightAutofill(flight) });
    }

    // No date: try AviationStack's dateless lookup
    const lookupProvider = getFlightLookupProvider();
    if (lookupProvider) {
      const flight = await lookupProvider.lookupByFlightNumber(flightIata);
      if (!flight) {
        return NextResponse.json({ found: false });
      }
      return NextResponse.json({ found: true, flight: normalizeFlightAutofill(flight) });
    }

    // No lookup provider available — try standard provider with today's date
    const today = new Date().toISOString().slice(0, 10);
    const provider = getServerFlightProvider();
    const flight = await provider.getFlightInfo(airlineIata, flightNumber, today);
    if (!flight) {
      return NextResponse.json({ found: false });
    }
    return NextResponse.json({ found: true, flight: normalizeFlightAutofill(flight) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Flight lookup failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
