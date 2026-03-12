'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Save } from 'lucide-react';
import { airlines, airlinePolicies } from '@/lib/demo-data';

export default function AdminAirlinesPage() {
  const [editingAirline, setEditingAirline] = useState<string | null>(null);
  const [policies, setPolicies] = useState(airlinePolicies);

  const updatePolicy = (iata: string, flightType: string, field: string, value: number) => {
    setPolicies((prev) =>
      prev.map((p) =>
        p.airline_iata === iata && p.flight_type === flightType
          ? { ...p, [field]: value }
          : p,
      ),
    );
  };

  return (
    <div className="min-h-dvh bg-surface-secondary">
      <header className="border-b border-ink-100 bg-surface-primary">
        <div className="gs-container flex items-center gap-3 py-3">
          <Link href="/admin" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors -ml-2">
            <ChevronLeft className="h-5 w-5 text-ink-600" />
          </Link>
          <h1 className="text-lg font-bold text-ink-900">Airline Policies</h1>
        </div>
      </header>

      <div className="gs-container py-6">
        <div className="space-y-4">
          {airlines.map((airline) => {
            const isOpen = editingAirline === airline.iata_code;
            const domesticPolicy = policies.find(
              (p) => p.airline_iata === airline.iata_code && p.flight_type === 'domestic',
            );
            const intlPolicy = policies.find(
              (p) => p.airline_iata === airline.iata_code && p.flight_type === 'international',
            );

            return (
              <div key={airline.iata_code} className="rounded-xl border border-ink-200 bg-surface-primary overflow-hidden">
                <button
                  onClick={() => setEditingAirline(isOpen ? null : airline.iata_code)}
                  className="flex w-full items-center gap-3 p-4 text-left hover:bg-surface-secondary transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-secondary font-bold text-sm text-ink-700">
                    {airline.iata_code}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-ink-900">{airline.name}</div>
                  </div>
                  <span className="text-xs text-ink-400">{isOpen ? 'Close' : 'Edit'}</span>
                </button>

                {isOpen && (
                  <div className="border-t border-ink-100 p-4 space-y-6">
                    {[
                      { policy: domesticPolicy, type: 'domestic', label: 'Domestic' },
                      { policy: intlPolicy, type: 'international', label: 'International' },
                    ].map(({ policy, type, label }) =>
                      policy ? (
                        <div key={type}>
                          <h3 className="text-sm font-semibold text-ink-700 mb-3">{label}</h3>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {[
                              { field: 'bag_drop_cutoff_minutes', label: 'Bag drop cutoff (min before departure)' },
                              { field: 'boarding_begins_minutes', label: 'Boarding begins (min before departure)' },
                              { field: 'gate_close_minutes', label: 'Gate closes (min before departure)' },
                              { field: 'recommended_checkin_minutes', label: 'Recommended check-in (min before)' },
                            ].map(({ field, label: fieldLabel }) => (
                              <div key={field}>
                                <label className="text-xs text-ink-500 block mb-1">{fieldLabel}</label>
                                <input
                                  type="number"
                                  value={(policy as unknown as Record<string, number>)[field]}
                                  onChange={(e) =>
                                    updatePolicy(airline.iata_code, type, field, parseInt(e.target.value) || 0)
                                  }
                                  className="gs-input !py-2 !text-sm"
                                />
                              </div>
                            ))}
                          </div>
                          {policy.notes && (
                            <p className="mt-2 text-xs text-ink-400 italic">{policy.notes}</p>
                          )}
                        </div>
                      ) : null,
                    )}
                    <button className="gs-btn-primary gap-2 text-sm !px-4 !py-2">
                      <Save className="h-4 w-4" />
                      Save changes
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
