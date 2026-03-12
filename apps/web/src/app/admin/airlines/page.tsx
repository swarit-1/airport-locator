'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Save, CheckCircle2 } from 'lucide-react';
import { getAdminRulesRepo, type AirlinePolicy } from '@/lib/repositories';
import { useHydrated } from '@/hooks/use-hydrated';

type SaveState = 'idle' | 'dirty' | 'saved';

const fields: Array<{ field: keyof AirlinePolicy; label: string }> = [
  { field: 'bag_drop_cutoff_minutes', label: 'Bag drop cutoff' },
  { field: 'boarding_begins_minutes', label: 'Boarding begins' },
  { field: 'gate_close_minutes', label: 'Gate closes' },
  { field: 'recommended_checkin_minutes', label: 'Recommended check-in' },
];

export default function AdminAirlinesPage() {
  const hydrated = useHydrated();
  const [airlines, setAirlines] = useState<ReturnType<ReturnType<typeof getAdminRulesRepo>['getAirlines']>>([]);
  const [editingAirline, setEditingAirline] = useState<string | null>(null);
  const [policies, setPolicies] = useState<AirlinePolicy[]>([]);
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({});

  useEffect(() => {
    if (!hydrated) return;

    const repo = getAdminRulesRepo();
    const nextAirlines = repo.getAirlines();
    setAirlines(nextAirlines);
    setPolicies(repo.getAirlinePolicies());
    setEditingAirline((previous) => previous ?? nextAirlines[0]?.iata_code ?? null);
  }, [hydrated]);

  const grouped = useMemo(() => {
    return airlines.map((airline) => ({
      airline,
      domestic: policies.find((policy) => policy.airline_iata === airline.iata_code && policy.flight_type === 'domestic'),
      international: policies.find((policy) => policy.airline_iata === airline.iata_code && policy.flight_type === 'international'),
    }));
  }, [airlines, policies]);

  const updatePolicy = (iata: string, flightType: AirlinePolicy['flight_type'], field: keyof AirlinePolicy, value: number) => {
    setPolicies((previous) =>
      previous.map((policy) =>
        policy.airline_iata === iata && policy.flight_type === flightType
          ? { ...policy, [field]: value }
          : policy,
      ),
    );
    setSaveState((previous) => ({ ...previous, [`${iata}-${flightType}`]: 'dirty' }));
  };

  const savePolicy = (iata: string, flightType: AirlinePolicy['flight_type']) => {
    const repo = getAdminRulesRepo();
    const policy = policies.find((item) => item.airline_iata === iata && item.flight_type === flightType);
    if (!policy) return;

    const valid = fields.every(({ field }) => Number.isFinite(policy[field] as number) && (policy[field] as number) >= 0);
    if (!valid) return;

    repo.updateAirlinePolicy(iata, flightType, policy);
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
            <h1 className="text-lg font-bold text-ink-900">Airline policies</h1>
            <p className="text-sm text-ink-500">Edit the timing rules the recommendation engine actually uses.</p>
          </div>
        </div>
      </header>

      <div className="gs-container py-6">
        <div className="space-y-4">
          {grouped.map(({ airline, domestic, international }) => {
            const open = editingAirline === airline.iata_code;

            return (
              <section key={airline.iata_code} className="overflow-hidden rounded-3xl border border-ink-200 bg-white">
                <button
                  onClick={() => setEditingAirline(open ? null : airline.iata_code)}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-secondary"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-secondary text-sm font-bold text-ink-700">
                    {airline.iata_code}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-ink-900">{airline.name}</div>
                    <div className="text-xs text-ink-500">Editable policy snapshots for domestic and international trips</div>
                  </div>
                  <span className="text-xs text-ink-400">{open ? 'Collapse' : 'Edit policy'}</span>
                </button>

                {open && (
                  <div className="border-t border-ink-100 px-5 py-5">
                    {[{ policy: domestic, type: 'domestic' as const, label: 'Domestic' }, { policy: international, type: 'international' as const, label: 'International' }].map(({ policy, type, label }) => (
                      policy ? (
                        <div key={type} className="mb-6 rounded-2xl bg-surface-secondary p-4 last:mb-0">
                          <div className="mb-4 flex items-center justify-between gap-4">
                            <div>
                              <h2 className="text-sm font-semibold text-ink-900">{label}</h2>
                              <p className="text-xs text-ink-500">{policy.notes ?? 'No notes for this policy snapshot.'}</p>
                            </div>
                            <div className="text-xs font-medium text-ink-500">
                              {saveState[`${airline.iata_code}-${type}`] === 'dirty' && 'Unsaved changes'}
                              {saveState[`${airline.iata_code}-${type}`] === 'saved' && (
                                <span className="inline-flex items-center gap-1 text-success-500">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Saved
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            {fields.map(({ field, label: fieldLabel }) => (
                              <label key={field} className="block">
                                <span className="mb-1 block text-xs text-ink-500">{fieldLabel}</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={policy[field] as number}
                                  onChange={(event) => updatePolicy(airline.iata_code, type, field, Math.max(0, Number(event.target.value) || 0))}
                                  className="gs-input !py-2 !text-sm"
                                />
                              </label>
                            ))}
                          </div>

                          <button onClick={() => savePolicy(airline.iata_code, type)} className="gs-btn-primary mt-4 gap-2 text-sm !px-4 !py-2">
                            <Save className="h-4 w-4" />
                            Save {label.toLowerCase()} policy
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
