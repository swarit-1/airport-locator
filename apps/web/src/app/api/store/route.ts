/**
 * Store API route.
 *
 * GET  — returns the full demo store (for client initial sync).
 * POST — applies a mutation to the file store.
 *
 * All mutations that the client demo-adapter performs go through here
 * so the server-side JSON file stays in sync.
 */

import { NextResponse } from 'next/server';
import {
  readStore,
  writeStore,
  saveTrip,
  saveRecommendation,
  createCircle,
  joinCircle,
  leaveCircle,
  sendMessage,
  createReport,
  updateReportStatus,
  updateAirportProfile,
  updateAirlinePolicy,
  saveProfile,
} from '@/lib/server/demo-file-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const store = readStore();
  return NextResponse.json(store);
}

interface MutationRequest {
  op: string;
  data: Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MutationRequest;
    const { op, data } = body;

    switch (op) {
      case 'saveTrip':
        saveTrip(data.trip as Parameters<typeof saveTrip>[0]);
        break;

      case 'saveRecommendation':
        saveRecommendation(data.rec as Parameters<typeof saveRecommendation>[0]);
        break;

      case 'createCircle':
        createCircle(data.circle as Parameters<typeof createCircle>[0]);
        break;

      case 'joinCircle':
        joinCircle(data.circleId as string, data.member as Parameters<typeof joinCircle>[1]);
        break;

      case 'leaveCircle':
        leaveCircle(data.circleId as string, data.userName as string);
        break;

      case 'sendMessage':
        sendMessage(data.msg as Parameters<typeof sendMessage>[0]);
        break;

      case 'createReport':
        createReport(data.report as Parameters<typeof createReport>[0]);
        break;

      case 'updateReportStatus':
        updateReportStatus(data.id as string, data.status as Parameters<typeof updateReportStatus>[1]);
        break;

      case 'updateAirportProfile':
        updateAirportProfile(
          data.iata as string,
          data.flightType as string,
          data.updates as Parameters<typeof updateAirportProfile>[2],
        );
        break;

      case 'updateAirlinePolicy':
        updateAirlinePolicy(
          data.iata as string,
          data.flightType as string,
          data.updates as Parameters<typeof updateAirlinePolicy>[2],
        );
        break;

      case 'saveProfile':
        saveProfile(data.profile as Parameters<typeof saveProfile>[0]);
        break;

      case 'replaceStore':
        writeStore(data.store as Parameters<typeof writeStore>[0]);
        break;

      default:
        return NextResponse.json({ error: `Unknown op: ${op}` }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Store mutation failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
