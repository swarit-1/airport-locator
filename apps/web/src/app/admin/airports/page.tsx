'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Save, Building2 } from 'lucide-react';
import { airports, airportProfiles } from '@/lib/demo-data';

export default function AdminAirportsPage() {
  const [editingAirport, setEditingAirport] = useState<string | null>(null);
  const [profiles, setProfiles] = useState(airportProfiles);

  const updateProfile = (iata: string, flightType: string, field: string, value: number) => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.airport_iata === iata && p.flight_type === flightType
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
          <h1 className="text-lg font-bold text-ink-900">Airport Rules</h1>
        </div>
      </header>

      <div className="gs-container py-6">
        <div className="space-y-4">
          {airports.map((airport) => {
            const isOpen = editingAirport === airport.iata_code;
            const domesticProfile = profiles.find(
              (p) => p.airport_iata === airport.iata_code && p.flight_type === 'domestic',
            );
            const intlProfile = profiles.find(
              (p) => p.airport_iata === airport.iata_code && p.flight_type === 'international',
            );

            return (
              <div key={airport.iata_code} className="rounded-xl border border-ink-200 bg-surface-primary overflow-hidden">
                <button
                  onClick={() => setEditingAirport(isOpen ? null : airport.iata_code)}
                  className="flex w-full items-center gap-3 p-4 text-left hover:bg-surface-secondary transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 font-bold text-sm">
                    {airport.iata_code}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-ink-900">{airport.name}</div>
                    <div className="text-xs text-ink-500">{airport.city}, {airport.state}</div>
                  </div>
                  <span className="text-xs text-ink-400">{isOpen ? 'Close' : 'Edit'}</span>
                </button>

                {isOpen && (
                  <div className="border-t border-ink-100 p-4 space-y-6">
                    {[
                      { profile: domesticProfile, type: 'domestic', label: 'Domestic' },
                      { profile: intlProfile, type: 'international', label: 'International' },
                    ].map(({ profile: prof, type, label }) =>
                      prof ? (
                        <div key={type}>
                          <h3 className="text-sm font-semibold text-ink-700 mb-3">{label}</h3>
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                              { field: 'curb_to_bag_drop_minutes', label: 'Curb → Bag drop (min)' },
                              { field: 'bag_drop_to_security_minutes', label: 'Bag drop → Security (min)' },
                              { field: 'security_to_gate_minutes', label: 'Security → Gate (min)' },
                              { field: 'avg_security_wait_minutes', label: 'Avg security wait (min)' },
                              { field: 'peak_security_wait_minutes', label: 'Peak security wait (min)' },
                              { field: 'min_arrival_before_departure', label: 'Min arrival before departure (min)' },
                            ].map(({ field, label: fieldLabel }) => (
                              <div key={field}>
                                <label className="text-xs text-ink-500 block mb-1">{fieldLabel}</label>
                                <input
                                  type="number"
                                  value={(prof as unknown as Record<string, number>)[field]}
                                  onChange={(e) =>
                                    updateProfile(airport.iata_code, type, field, parseInt(e.target.value) || 0)
                                  }
                                  className="gs-input !py-2 !text-sm"
                                />
                              </div>
                            ))}
                          </div>
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
