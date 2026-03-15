/**
 * Demo session management using cookies.
 *
 * In demo mode, "auth" is a simple JSON cookie containing the user's
 * ID, display name, and email. No real authentication — just enough
 * to persist identity across navigation and SSR.
 *
 * Server-only module (uses next/headers).
 */

import { cookies } from 'next/headers';
import type { DemoSession, StoredProfile } from '../repositories/types';
import { getProfileByEmail, saveProfile } from './demo-file-store';

const SESSION_COOKIE = 'boarding-session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function getSession(): Promise<DemoSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as DemoSession;
  } catch {
    return null;
  }
}

export async function createSession(email: string): Promise<{ session: DemoSession; profile: StoredProfile }> {
  const existing = getProfileByEmail(email);
  const displayName = existing?.display_name ?? email.split('@')[0] ?? 'Demo User';
  const userId = existing?.id ?? `user-${Date.now()}`;

  const profile: StoredProfile = existing ?? {
    id: userId,
    display_name: displayName,
    email,
    phone: '',
    has_tsa_precheck: false,
    has_clear: false,
    default_risk_profile: 'balanced',
    default_ride_mode: 'rideshare',
    completed_trips: 0,
    email_verified: true,
    created_at: new Date().toISOString(),
  };

  if (!existing) {
    saveProfile(profile);
  }

  const session: DemoSession = {
    user_id: profile.id,
    display_name: profile.display_name,
    email: profile.email,
  };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });

  return { session, profile };
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
