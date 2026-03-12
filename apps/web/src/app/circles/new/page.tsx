'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Zap, Calendar, Globe, Lock, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { airports } from '@/lib/demo-data';

export default function NewCirclePage() {
  const router = useRouter();
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

  const handleCreate = () => {
    // In production this would create via API
    router.push('/circles/circle-1');
  };

  return (
    <div className="min-h-dvh bg-surface-primary">
      <header className="border-b border-ink-100 bg-surface-primary/80 backdrop-blur-md sticky top-0 z-10">
        <div className="gs-container flex items-center gap-3 py-3">
          <Link href="/circles" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors -ml-2">
            <ChevronLeft className="h-5 w-5 text-ink-600" />
          </Link>
          <h1 className="text-lg font-bold text-ink-900">New Ride Circle</h1>
        </div>
      </header>

      <div className="gs-container py-8">
        <div className="max-w-lg space-y-8">
          {/* Type */}
          <div>
            <h2 className="text-base font-semibold text-ink-900 mb-3">What kind of circle?</h2>
            <div className="grid gap-3 grid-cols-2">
              <button
                onClick={() => setCircleType('scheduled')}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  circleType === 'scheduled' ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20' : 'border-ink-100 hover:border-ink-200'
                }`}
              >
                <Calendar className={`h-6 w-6 ${circleType === 'scheduled' ? 'text-brand-600' : 'text-ink-400'}`} />
                <span className="text-sm font-semibold">Scheduled</span>
                <span className="text-xs text-ink-500 text-center">Plan ahead for a future trip</span>
              </button>
              <button
                onClick={() => setCircleType('leaving_now')}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  circleType === 'leaving_now' ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20' : 'border-ink-100 hover:border-ink-200'
                }`}
              >
                <Zap className={`h-6 w-6 ${circleType === 'leaving_now' ? 'text-brand-600' : 'text-ink-400'}`} />
                <span className="text-sm font-semibold">Leaving now</span>
                <span className="text-xs text-ink-500 text-center">Find someone heading out soon</span>
              </button>
            </div>
          </div>

          {/* Visibility */}
          <div>
            <h2 className="text-base font-semibold text-ink-900 mb-3">Who can see this?</h2>
            <div className="space-y-2">
              {[
                { value: 'public' as const, label: 'Public', desc: 'Anyone nearby can find and join', icon: Globe },
                { value: 'private' as const, label: 'Invite only', desc: 'Share a link to invite people', icon: Lock },
                { value: 'community' as const, label: 'Community', desc: 'Visible to your community members', icon: GraduationCap },
              ].map((v) => (
                <button
                  key={v.value}
                  onClick={() => setVisibility(v.value)}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    visibility === v.value ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20' : 'border-ink-100 hover:border-ink-200'
                  }`}
                >
                  <v.icon className={`h-5 w-5 ${visibility === v.value ? 'text-brand-600' : 'text-ink-400'}`} />
                  <div>
                    <div className="text-sm font-semibold text-ink-900">{v.label}</div>
                    <div className="text-xs text-ink-500">{v.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Airport */}
          <div>
            <label htmlFor="airport" className="gs-label">Airport</label>
            <select
              id="airport"
              value={airportIata}
              onChange={(e) => setAirportIata(e.target.value)}
              className="gs-input"
            >
              {airports.map((a) => (
                <option key={a.iata_code} value={a.iata_code}>
                  {a.iata_code} — {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Timing */}
          {circleType === 'scheduled' && (
            <div className="grid gap-4 grid-cols-2">
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
                <label htmlFor="leave_time" className="gs-label">Leave around</label>
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

          {/* Max members */}
          <div>
            <label className="gs-label">Max riders</label>
            <div className="flex items-center gap-3">
              {[2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => setMaxMembers(n)}
                  className={`h-11 w-11 rounded-lg border-2 text-sm font-semibold transition-all ${
                    maxMembers === n ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-ink-200 text-ink-600 hover:border-ink-300'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Create */}
          <button onClick={handleCreate} className="gs-btn-primary w-full">
            Create circle
          </button>
        </div>
      </div>
    </div>
  );
}
