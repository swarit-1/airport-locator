import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  resolveDeviceLocation,
  resolveTypedAddress,
} from '@/lib/server/location-resolver';

const ResolveLocationRequestSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('typed_address'),
    query: z.string().min(2),
    airport_iata: z.string().min(3).max(3),
  }),
  z.object({
    mode: z.literal('device_location'),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    label: z.string().optional(),
  }),
]);

export async function POST(request: Request) {
  try {
    const parsed = ResolveLocationRequestSchema.parse(await request.json());

    if (parsed.mode === 'typed_address') {
      const location = await resolveTypedAddress(parsed);
      return NextResponse.json({ location });
    }

    const location = await resolveDeviceLocation(parsed);
    return NextResponse.json({ location });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Location lookup failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
