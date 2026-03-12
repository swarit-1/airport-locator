'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Save, CheckCircle2 } from 'lucide-react';
import { getAdminRulesRepo, type AirportProfile } from '@/lib/repositories';
import { useHydrated } from '@/hooks/use-hydrated';

type SaveState = 'idle' | 'dirty' | 'saved';

const fields: Array<{ field: keyof AirportProfile; label: string }> = [
  { field: 'curb_to_bag_drop_minutes', label: 'Curb to bag drop' },
  { field: 'bag_drop_to_security_minutes', label: 'Bag drop to security' },
  { field: 'security_to_gate_minutes', label: 'Security to gate' },
  { field: 'avg_security_wait_minutes', label: 'Average security wait' },
  { field: 'peak_security_wait_minutes', label: 'Peak security wait' },
  { field: 'min_arrival_before_departure', label: 'Minimum arrival before departure' },
];

export default function AdminAirportsPage() {
  const hydrated = useHydrated();
  const [airports, setAirports] = useState<ReturnType<ReturnType<typeof getAdminRulesRepo>['getAirports']>>([]);
  const [editingAirport, setEditingAirport] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<AirportProfile[]>([]);
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({});

  useEffect(() => {
    if (!hydrated) return;

    const repo = getAdminRulesRepo();
    const nextAirports = repo.getAirports();
    setAirports(nextAirports);
    setProfiles(repo.getAirportProfiles());
    setEditingAirport((previous) => previous ?? nextAirports[0]?.iata_code ?? null);
  }, [hydrated]);

  const grouped = useMemo(() => {
    return airports.map((airport) => ({
      airport,
      domestic: profiles.find((profile) => profile.airport_iata === airport.iata_code && profile.flight_type === 'domestic'),
      international: profiles.find((profile) => profile.airport_iata === airport.iata_code && profile.flight_type === 'international'),
    }));
  }, [airports, profiles]);

  const updateProfile = (iata: string, flightType: AirportProfile['flight_type'], field: keyof AirportProfile, value: number) => {
    setProfiles((previous) =>
      previous.map((profile) =>
        profile.airport_iata === iata && profile.flight_type === flightType
          ? { ...profile, [field]: value }
          : profile,
      ),
    );
    setSaveState((previous) => ({ ...previous, [`${iata}-${flightType}`]: 'dirty' }));
  };

  const saveProfile = (iata: string, flightType: AirportProfile['flight_type']) => {
    const repo = getAdminRulesRepo();
    const profile = profiles.find((item) => item.airport_iata === iata && item.flight_type === flightType);
    if (!profile) return;

    const valid = fields.every(({ field }) => Number.isFinite(profile[field] as number) && (profile[field] as number) >= 0);
    if (!valid) return;

    repo.updateAirportProfile(iata, flightType, profile);
    setSaveState((previous) => ({ ...previous, [`${iata}-${flightType}`]: 'saved' }));
    window.setTimeout(() => {
      setSaveState((previous) => ({ ...previous, [`${iata}-${flightType}`]: 'idle' }));
    }, 1400);
  };

  if (!hydrated) {
    return <div className="min-h-dvh bg-surface-secondary" />;
  }

  return (
    <div className="min-h-dvh bg-surface-secondary">
      <header className="border-b border-ink-100 bg-surface-primary">
        <div className="gs-container flex items-center gap-3 py-3">
          <Link href="/admin" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors -ml-2">
            <ChevronLeft className="h-5 w-5 text-ink-600" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-ink-900">Airport rules</h1>
            <p className="text-sm text-ink-500">Persisted locally in demo mode, ready for Supabase-backed rules.</p>
          </div>
        </div>
      </header>

      <div className="gs-container py-6">
        <div className="space-y-4">
          {grouped.map(({ airport, domestic, international }) => {
            const open = editingAirport === airport.iata_code;

            return (
              <section key={airport.iata_code} className="overflow-hidden rounded-3xl border border-ink-200 bg-white">
                <button
                  onClick={() => setEditingAirport(open ? null : airport.iata_code)}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-secondary"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-sm font-bold text-brand-600">
                    {airport.iata_code}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-ink-900">{airport.name}</div>
                    <div className="text-xs text-ink-500">{airport.city}, {airport.state}</div>
                  </div>
                  <span className="text-xs text-ink-400">{open ? 'Collapse' : 'Edit rules'}</span>
                </button>

                {open && (
                  <div className="border-t border-ink-100 px-5 py-5">
                    {[{ profile: domestic, type: 'domestic' as const, label: 'Domestic' }, { profile: international, type: 'international' as const, label: 'International' }].map(({ profile, type, label }) => (
                      profile ? (
                        <div key={type} className="mb-6 rounded-2xl bg-surface-secondary p-4 last:mb-0">
                          <div className="mb-4 flex items-center justify-between gap-4">
                            <div>
                              <h2 className="text-sm font-semibold text-ink-900">{label}</h2>
                              <p className="text-xs text-ink-500">All values are minutes and must be non-negative.</p>
                            </div>
                            <div className="text-xs font-medium text-ink-500">
                              {saveState[`${airport.iata_code}-${type}`] === 'dirty' && 'Unsaved changes'}
                              {saveState[`${airport.iata_code}-${type}`] === 'saved' && (
                                <span className="inline-flex items-center gap-1 text-success-500">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Saved
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {fields.map(({ field, label: fieldLabel }) => (
                              <label key={field} className="block">
                                <span className="mb-1 block text-xs text-ink-500">{fieldLabel}</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={profile[field] as number}
                                  onChange={(event) => updateProfile(airport.iata_code, type, field, Math.max(0, Number(event.target.value) || 0))}
                                  className="gs-input !py-2 !text-sm"
                                />
                              </label>
                            ))}
                          </div>

                          <button onClick={() => saveProfile(airport.iata_code, type)} className="gs-btn-primary mt-4 gap-2 text-sm !px-4 !py-2">
                            <Save className="h-4 w-4" />
                            Save {label.toLowerCase()} rules
                          </button>
                        </div>
                      ) : null
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
