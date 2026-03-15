'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, User, Mail, Settings, LogOut, CheckCircle2, Loader2 } from 'lucide-react';
import type { StoredProfile } from '@/lib/repositories/types';

type SaveState = 'idle' | 'saving' | 'saved';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  useEffect(() => {
    fetch('/api/auth/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async () => {
    if (!profile) return;
    setSaveState('saving');

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
      }
      setSaveState('saved');
      window.setTimeout(() => setSaveState('idle'), 1500);
    } catch {
      setSaveState('idle');
    }
  }, [profile]);

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }, [router]);

  if (loading) {
    return <div className="min-h-dvh bg-surface-primary" />;
  }

  if (!profile) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-surface-primary">
        <div className="text-center">
          <h1 className="text-xl font-bold text-ink-900">Not signed in</h1>
          <p className="mt-2 text-sm text-ink-500">Sign in to see your profile and preferences.</p>
          <Link href="/login" className="gs-btn-primary mt-5">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-surface-primary">
      <header className="border-b border-ink-100 bg-surface-primary/80 backdrop-blur-md sticky top-0 z-10">
        <div className="gs-container flex items-center gap-3 py-3">
          <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors -ml-2">
            <ChevronLeft className="h-5 w-5 text-ink-600" />
          </Link>
          <h1 className="text-lg font-bold text-ink-900">Profile &amp; Settings</h1>
        </div>
      </header>

      <div className="gs-container py-8 max-w-lg space-y-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink-900">{profile.display_name}</h2>
            <div className="flex items-center gap-2 text-sm text-ink-500">
              <Mail className="h-3.5 w-3.5" />
              {profile.email}
              {profile.email_verified && (
                <span className="gs-badge gs-badge-success text-2xs">Verified</span>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-surface-secondary p-5">
          <h3 className="text-sm font-semibold text-ink-900 mb-3">Trust signals</h3>
          <div className="flex flex-wrap gap-3">
            {profile.email_verified && <span className="gs-badge gs-badge-success">Email verified</span>}
            <span className="gs-badge gs-badge-info">{profile.completed_trips} trips completed</span>
            {profile.has_tsa_precheck && <span className="gs-badge bg-brand-100 text-brand-600">TSA PreCheck</span>}
            {profile.has_clear && <span className="gs-badge bg-brand-100 text-brand-600">CLEAR</span>}
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold text-ink-900 mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-ink-400" />
            Default preferences
          </h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="gs-label">Display name</label>
              <input
                id="name"
                type="text"
                value={profile.display_name}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                className="gs-input"
              />
            </div>
            <div>
              <label className="gs-label">Default comfort level</label>
              <div className="flex gap-2">
                {(['conservative', 'balanced', 'aggressive'] as const).map((rp) => (
                  <button
                    key={rp}
                    onClick={() => setProfile({ ...profile, default_risk_profile: rp })}
                    className={`gs-chip flex-1 justify-center text-xs ${
                      profile.default_risk_profile === rp ? 'gs-chip-active' : ''
                    }`}
                  >
                    {rp === 'conservative' ? 'Safe' : rp === 'balanced' ? 'Balanced' : 'Tight'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.has_tsa_precheck}
                  onChange={(e) => setProfile({ ...profile, has_tsa_precheck: e.target.checked })}
                  className="h-5 w-5 rounded border-ink-300 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-sm text-ink-900">I have TSA PreCheck</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.has_clear}
                  onChange={(e) => setProfile({ ...profile, has_clear: e.target.checked })}
                  className="h-5 w-5 rounded border-ink-300 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-sm text-ink-900">I have CLEAR</span>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-ink-100">
          <button onClick={handleSave} disabled={saveState === 'saving'} className="gs-btn-primary w-full gap-2">
            {saveState === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
            {saveState === 'saved' && <CheckCircle2 className="h-4 w-4" />}
            {saveState === 'idle' ? 'Save changes' : saveState === 'saving' ? 'Saving...' : 'Saved'}
          </button>
          <button onClick={handleLogout} className="gs-btn-secondary w-full gap-2 text-error-500 border-error-200 hover:bg-error-50">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
