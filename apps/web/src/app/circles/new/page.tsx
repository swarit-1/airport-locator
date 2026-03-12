'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Zap, Calendar, Globe, Lock, GraduationCap, MapPin } from 'lucide-react';
import Link from 'next/link';
import { getAdminRulesRepo, getCircleRepo } from '@/lib/repositories';
import { getDefaultOrigin } from '@/lib/trip-defaults';

export default function NewCirclePage() {
  const router = useRouter();
  const rulesRepo = getAdminRulesRepo();
  const circleRepo = getCircleRepo();
  const airports = rulesRepo.getAirports();

  const [circleType, setCircleType] = useState<'scheduled' | 'leaving_now'>('scheduled');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'community'>('public');
  const [airportIata, setAirportIata] = useState('SEA');
  const [leaveTime, setLeaveTime] = useState('11:00');
  const [leaveDate, setLeaveDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0]!;
  });
  const [maxMembers, setMaxMembers] = useState(4);
  const [neighborhood, setNeighborhood] = useState(getDefaultOrigin('SEA').label);
  const [submitting, setSubmitting] = useState(false);

  const airport = useMemo(
    () => rulesRepo.getAirport(airportIata),
    [airportIata, rulesRepo],
  );

  const handleCreate = () => {
    if (!airport || !neighborhood.trim()) return;

    setSubmitting(true);
    const id = `circle-${Date.now()}`;
    const origin = getDefaultOrigin(airportIata);
    const now = new Date();
    const targetLeave =
      circleType === 'leaving_now'
        ? new Date(now.getTime() + 15 * 60_000)
        : new Date(`${leaveDate}T${leaveTime}:00`);
    const leaveWindowStart = new Date(targetLeave.getTime() - 15 * 60_000);
    const leaveWindowEnd = new Date(targetLeave.getTime() + 15 * 60_000);

    circleRepo.create({
      id,
      creator_name: 'You',
      airport_iata: airport.iata_code,
      airport_name: airport.name,
      circle_type: circleType,
      visibility,
      status: 'open',
      target_leave_time: targetLeave.toISOString(),
      leave_window_start: leaveWindowStart.toISOString(),
      leave_window_end: leaveWindowEnd.toISOString(),
      max_members: maxMembers,
      current_members: 1,
      estimated_savings_cents: circleType === 'leaving_now' ? 1800 : 1400,
      estimated_extra_minutes: circleType === 'leaving_now' ? 6 : 9,
      neighborhood: neighborhood.trim(),
      community_name: visibility === 'community' ? 'UW Huskies' : undefined,
      origin_lat: origin.lat,
      origin_lng: origin.lng,
      created_at: new Date().toISOString(),
    });

    router.push(`/circles/${id}`);
  };

  return (
    <div className="min-h-dvh bg-surface-primary">
      <header className="border-b border-ink-100 bg-surface-primary/90 backdrop-blur-md sticky top-0 z-10">
        <div className="gs-container flex items-center gap-3 py-3">
          <Link href="/circles" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors -ml-2">
            <ChevronLeft className="h-5 w-5 text-ink-600" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-ink-900">Create a ride circle</h1>
            <p className="text-sm text-ink-500">Open a real circle and route directly into coordination.</p>
          </div>
        </div>
      </header>

      <div className="gs-container py-8">
        <div className="max-w-2xl space-y-8">
          <section className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Timing</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink-900">What kind of circle is this?</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setCircleType('scheduled')}
                className={`rounded-2xl border p-5 text-left transition-all ${circleType === 'scheduled' ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-ink-200 bg-white hover:border-ink-300'}`}
              >
                <Calendar className="h-5 w-5 text-brand-600" />
                <div className="mt-4 text-lg font-semibold text-ink-900">Scheduled</div>
                <p className="mt-1 text-sm text-ink-500">Plan ahead around a leave window you already know.</p>
              </button>
              <button
                onClick={() => setCircleType('leaving_now')}
                className={`rounded-2xl border p-5 text-left transition-all ${circleType === 'leaving_now' ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-ink-200 bg-white hover:border-ink-300'}`}
              >
                <Zap className="h-5 w-5 text-brand-600" />
                <div className="mt-4 text-lg font-semibold text-ink-900">Leaving now</div>
                <p className="mt-1 text-sm text-ink-500">Short-lived circle for people already about to head out.</p>
              </button>
            </div>
          </section>

          <section className="grid gap-6 sm:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <div>
                <label htmlFor="airport" className="gs-label">Airport</label>
                <select
                  id="airport"
                  value={airportIata}
                  onChange={(e) => {
                    setAirportIata(e.target.value);
                    setNeighborhood(getDefaultOrigin(e.target.value).label);
                  }}
                  className="gs-input"
                >
                  {airports.map((item) => (
                    <option key={item.iata_code} value={item.iata_code}>
                      {item.iata_code} — {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {circleType === 'scheduled' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="leave_date" className="gs-label">Date</label>
                    <input
                      id="leave_date"
                      type="date"
                      value={leaveDate}
                      onChange={(e) => setLeaveDate(e.target.value)}
                      className="gs-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="leave_time" className="gs-label">Target leave time</label>
                    <input
                      id="leave_time"
                      type="time"
                      value={leaveTime}
                      onChange={(e) => setLeaveTime(e.target.value)}
                      className="gs-input"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="pickup_area" className="gs-label">Pickup area</label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input
                    id="pickup_area"
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="gs-input pl-10"
                    placeholder="Downtown, campus, or a landmark"
                  />
                </div>
                <p className="mt-1 text-xs text-ink-400">Keep it general. Exact addresses stay private until you decide to share them.</p>
              </div>
            </div>

            <div className="space-y-5 rounded-2xl bg-[color:var(--surface-secondary)] p-5">
              <div>
                <label className="gs-label">Visibility</label>
                <div className="space-y-2">
                  {[
                    { value: 'public' as const, label: 'Public', desc: 'Visible to nearby travelers', icon: Globe },
                    { value: 'private' as const, label: 'Invite only', desc: 'Create and share a private link', icon: Lock },
                    { value: 'community' as const, label: 'Community', desc: 'Visible inside your campus or group', icon: GraduationCap },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setVisibility(item.value)}
                      className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all ${visibility === item.value ? 'border-brand-500 bg-white' : 'border-transparent bg-white/70 hover:border-ink-200'}`}
                    >
                      <item.icon className="mt-0.5 h-4 w-4 text-brand-600" />
                      <div>
                        <div className="text-sm font-semibold text-ink-900">{item.label}</div>
                        <div className="text-xs text-ink-500">{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="gs-label">Max riders</label>
                <div className="flex flex-wrap gap-2">
                  {[2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      onClick={() => setMaxMembers(n)}
                      className={`h-11 min-w-11 rounded-full px-4 text-sm font-semibold transition-all ${maxMembers === n ? 'bg-brand-500 text-white' : 'bg-white text-ink-700 hover:bg-ink-50'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-white px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">Preview</div>
                <div className="mt-2 text-base font-semibold text-ink-900">{airport?.iata_code} from {neighborhood}</div>
                <div className="mt-1 text-sm text-ink-500">
                  {circleType === 'leaving_now' ? 'Leaves in about 15 minutes' : `${leaveDate} around ${leaveTime}`}
                </div>
              </div>
            </div>
          </section>

          <div className="sticky bottom-3 z-10">
            <div className="rounded-2xl border border-ink-200 bg-white/90 p-3 shadow-sm backdrop-blur">
              <button
                onClick={handleCreate}
                disabled={submitting || !neighborhood.trim()}
                className="gs-btn-primary w-full"
              >
                {submitting ? 'Creating circle...' : 'Create circle and open chat'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
