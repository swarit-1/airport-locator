import { NextRequest, NextResponse } from 'next/server';
import { diningSeeds } from '@boarding/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ iata: string }> },
) {
  const { iata } = await params;
  const restaurants = diningSeeds.filter((r) => r.airport_iata === iata.toUpperCase());
  return NextResponse.json({ restaurants });
}
