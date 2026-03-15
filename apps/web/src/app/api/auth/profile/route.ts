import { NextResponse } from 'next/server';
import { getSession } from '@/lib/server/demo-session';
import { getProfileById, saveProfile } from '@/lib/server/demo-file-store';
import type { StoredProfile } from '@/lib/repositories/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ profile: null });
  }

  const profile = getProfileById(session.user_id);
  return NextResponse.json({ profile: profile ?? null });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const updates = (await request.json()) as Partial<StoredProfile>;
    const existing = getProfileById(session.user_id);
    if (!existing) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const updated: StoredProfile = {
      ...existing,
      display_name: updates.display_name ?? existing.display_name,
      phone: updates.phone ?? existing.phone,
      has_tsa_precheck: updates.has_tsa_precheck ?? existing.has_tsa_precheck,
      has_clear: updates.has_clear ?? existing.has_clear,
      default_risk_profile: updates.default_risk_profile ?? existing.default_risk_profile,
      default_ride_mode: updates.default_ride_mode ?? existing.default_ride_mode,
    };

    saveProfile(updated);
    return NextResponse.json({ profile: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Profile update failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
