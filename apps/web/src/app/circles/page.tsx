'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, Clock, MapPin, Plus, Zap, Globe, Lock, GraduationCap, DollarSign, ArrowUpRight } from 'lucide-react';
import { getCircleRepo } from '@/lib/repositories';
import { useHydrated } from '@/hooks/use-hydrated';

type Filter = 'all' | 'scheduled' | 'leaving_now';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatSavings(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

const visibilityIcons = {
  public: Globe,
  private: Lock,
  community: GraduationCap,
};

export default function CirclesPage() {
  const hydrated = useHydrated();
  const circleRepo = getCircleRepo();
  const [filter, setFilter] = useState<Filter>('all');
  const [circles, setCircles] = useState<ReturnType<typeof circleRepo.getAll>>([]);

  useEffect(() => {
    if (!hydrated) return;
    setCircles(circleRepo.getAll().sort((a, b) => new Date(a.target_leave_time).getTime() - new Date(b.target_leave_time).getTime()));
  }, [circleRepo, hydrated]);

  const filtered = useMemo(
    () => circles.filter((circle) => filter === 'all' || circle.circle_type === filter),
    [circles, filter],
  );

  if (!hydrated) {
    return <div className="min-h-dvh bg-surface-primary" />;
  }

  return (
    <div className="min-h-dvh bg-surface-primary">
      <header className="border-b border-ink-100 bg-surface-primary/90 backdrop-blur-md sticky top-0 z-10">
        <div className="gs-container flex items-end justify-between gap-4 py-4">
          <div>
            <Link href="/" className="text-sm text-ink-400 hover:text-ink-600 transition-colors">
              GateShare
            </Link>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">Ride circles</h1>
            <p className="mt-1 text-sm text-ink-500">Find coordinated rides that still protect everyone’s airport timing.</p>
          </div>
          <Link href="/circles/new" className="gs-btn-primary gap-2 text-sm !px-4 !py-2">
            <Plus className="h-4 w-4" />
            Create a circle
          </Link>
        </div>
      </header>

      <div className="gs-container py-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {([
            { value: 'all', label: 'All circles' },
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'leaving_now', label: 'Leaving now' },
          ] as const).map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`gs-chip ${filter === item.value ? 'gs-chip-active' : ''}`}
            >
              {item.value === 'leaving_now' && <Zap className="h-3.5 w-3.5" />}
              {item.label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-3xl border border-ink-200 bg-white">
          <div className="hidden grid-cols-[1.2fr_1fr_0.9fr_0.8fr_0.7fr] gap-4 border-b border-ink-100 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-400 md:grid">
            <span>Circle</span>
            <span>Leave window</span>
            <span>Pickup area</span>
            <span>Savings</span>
            <span>Members</span>
          </div>

          {filtered.map((circle, index) => {
            const VisibilityIcon = visibilityIcons[circle.visibility];
            return (
              <motion.div
                key={circle.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: index * 0.03 }}
              >
                <Link
                  href={`/circles/${circle.id}`}
                  className="grid gap-3 border-b border-ink-100 px-5 py-4 transition-colors last:border-b-0 hover:bg-surface-secondary md:grid-cols-[1.2fr_1fr_0.9fr_0.8fr_0.7fr]"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-ink-900">{circle.airport_iata}</span>
                      <span className="text-sm text-ink-400">{circle.airport_name}</span>
                      {circle.circle_type === 'leaving_now' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">
                          <Zap className="h-3 w-3" />
                          Leaving now
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-500">
                      <span className="inline-flex items-center gap-1">
                        <VisibilityIcon className="h-3.5 w-3.5" />
                        {circle.visibility === 'community' ? circle.community_name ?? 'Community' : circle.visibility}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        Created by {circle.creator_name}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-ink-700">
                    <div className="inline-flex items-center gap-1.5 font-semibold text-ink-900">
                      <Clock className="h-4 w-4 text-ink-400" />
                      {formatTime(circle.target_leave_time)}
                    </div>
                    <div className="mt-1 text-xs text-ink-500">
                      {formatTime(circle.leave_window_start)} to {formatTime(circle.leave_window_end)}
                    </div>
                  </div>

                  <div className="text-sm text-ink-700">
                    <div className="inline-flex items-center gap-1.5 font-medium">
                      <MapPin className="h-4 w-4 text-ink-400" />
                      {circle.neighborhood}
                    </div>
                    <div className="mt-1 text-xs text-ink-500">Detour cap +{circle.estimated_extra_minutes} min</div>
                  </div>

                  <div className="text-sm">
                    <div className="inline-flex items-center gap-1.5 font-semibold text-success-500">
                      <DollarSign className="h-4 w-4" />
                      {formatSavings(circle.estimated_savings_cents)}
                    </div>
                    <div className="mt-1 text-xs text-ink-500">Estimated per rider</div>
                  </div>

                  <div className="text-sm text-ink-700">
                    <div className="inline-flex items-center gap-1.5 font-semibold text-ink-900">
                      <Users className="h-4 w-4 text-ink-400" />
                      {circle.current_members}/{circle.max_members}
                    </div>
                    <div className="mt-1 text-xs text-ink-500 capitalize">{circle.status}</div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <Users className="mx-auto h-12 w-12 text-ink-200" />
            <h3 className="mt-4 text-xl font-semibold text-ink-900">No circles yet for this view</h3>
            <p className="mt-2 text-sm text-ink-500">Start one and set the tone for everyone heading to the airport.</p>
            <Link href="/circles/new" className="gs-btn-primary mt-6 gap-2">
              <Plus className="h-4 w-4" />
              Create a circle
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
