import { NextResponse } from 'next/server';
import { z } from 'zod';
import { normalizeFlightAutofill } from '@/lib/server/flight-lookup';
import { getServerTripProviders } from '@/lib/server/provider-registry';

const ResolveFlightRequestSchema = z.object({
  airline_iata: z.string().min(2).max(3),
  flight_number: z.string().min(1),
  departure_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(request: Request) {
  try {
    const parsed = ResolveFlightRequestSchema.parse(await request.json());
    const { flightProvider } = getServerTripProviders();
    const flight = await flightProvider.getFlightInfo(
      parsed.airline_iata,
      parsed.flight_number,
      parsed.departure_date,
    );

    if (!flight) {
      return NextResponse.json({
        found: false,
      });
    }

    return NextResponse.json({
      found: true,
      flight: normalizeFlightAutofill(flight),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Flight lookup failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
