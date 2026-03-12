'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, Clock, MapPin, Plus, Zap, Globe, Lock, GraduationCap, DollarSign } from 'lucide-react';
import { demoCircles } from '@/lib/demo-data';

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
  const [filter, setFilter] = useState<Filter>('all');
  const filtered = demoCircles.filter(
    (c) => filter === 'all' || c.circle_type === filter,
  );

  return (
    <div className="min-h-dvh bg-surface-primary">
      {/* Header */}
      <header className="border-b border-ink-100 bg-surface-primary/80 backdrop-blur-md sticky top-0 z-10">
        <div className="gs-container flex items-center justify-between py-4">
          <div>
            <Link href="/" className="text-sm text-ink-400 hover:text-ink-600 transition-colors">
              GateShare
            </Link>
            <h1 className="text-xl font-bold text-ink-900">Ride Circles</h1>
          </div>
          <Link href="/circles/new" className="gs-btn-primary gap-2 text-sm !px-4 !py-2">
            <Plus className="h-4 w-4" />
            New circle
          </Link>
        </div>
      </header>

      <div className="gs-container py-6">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {([
            { value: 'all', label: 'All' },
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'leaving_now', label: 'Leaving now' },
          ] as const).map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`gs-chip ${filter === f.value ? 'gs-chip-active' : ''}`}
            >
              {f.value === 'leaving_now' && <Zap className="h-3.5 w-3.5" />}
              {f.label}
            </button>
          ))}
        </div>

        {/* Circle list */}
        <div className="space-y-4">
          {filtered.map((circle, i) => {
            const VisIcon = visibilityIcons[circle.visibility];
            return (
              <motion.div
                key={circle.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.25 }}
              >
                <Link
                  href={`/circles/${circle.id}`}
                  className="block rounded-xl border border-ink-200 p-5 hover:border-ink-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-ink-900">
                          {circle.airport_iata}
                        </span>
                        <span className="text-sm text-ink-400">·</span>
                        <span className="text-sm text-ink-600">{circle.airport_name}</span>
                        {circle.circle_type === 'leaving_now' && (
                          <span className="gs-badge bg-brand-100 text-brand-600 gap-1">
                            <Zap className="h-3 w-3" />
                            Now
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatTime(circle.target_leave_time)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {circle.neighborhood}
                        </span>
                        <span className="flex items-center gap-1">
                          <VisIcon className="h-3.5 w-3.5" />
                          {circle.visibility}
                        </span>
                      </div>
                      {circle.community_name && (
                        <div className="mt-1.5">
                          <span className="gs-badge bg-purple-50 text-purple-600">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            {circle.community_name}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-sm font-semibold text-success-500">
                        <DollarSign className="h-4 w-4" />
                        Save ~{formatSavings(circle.estimated_savings_cents)}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-sm text-ink-500">
                        <Users className="h-3.5 w-3.5" />
                        {circle.current_members}/{circle.max_members}
                      </div>
                      {circle.estimated_extra_minutes > 0 && (
                        <div className="mt-0.5 text-xs text-ink-400">
                          +{circle.estimated_extra_minutes} min detour
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-ink-400">
                    Created by {circle.creator_name}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Users className="mx-auto h-12 w-12 text-ink-200" />
            <h3 className="mt-4 text-lg font-semibold text-ink-900">No circles yet</h3>
            <p className="mt-1 text-sm text-ink-500">
              Be the first to create a ride circle for your trip.
            </p>
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
