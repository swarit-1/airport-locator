'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown, ChevronUp, AlertTriangle,
  Car, Shield, MapPin, Users, Share2, ExternalLink, Copy,
} from 'lucide-react';
import type { Recommendation } from '@gateshare/domain';
import Link from 'next/link';

export interface RideLink {
  provider: string;
  web_link: string;
  estimated_price_cents: number;
}

interface RecommendationResultProps {
  recommendation: Recommendation;
  form: {
    airline_name: string;
    flight_number: string;
    departure_date: string;
    departure_time: string;
    airport_iata: string;
    origin_label: string;
    origin_lat: number;
    origin_lng: number;
    ride_mode: string;
    risk_profile: string;
  };
  rideLinks?: RideLink[];
  onBack: () => void;
}

const confidenceColors = {
  high: { bg: 'bg-success-50', border: 'border-success-500', text: 'text-success-500', label: 'High confidence' },
  medium: { bg: 'bg-warning-50', border: 'border-warning-500', text: 'text-warning-500', label: 'Medium confidence' },
  low: { bg: 'bg-error-50', border: 'border-error-500', text: 'text-error-500', label: 'Low confidence' },
};

function formatTimeDisplay(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatWindowDisplay(start: string, end: string): string {
  return `${formatTimeDisplay(start)} – ${formatTimeDisplay(end)}`;
}

export function RecommendationResult({ recommendation, form, rideLinks, onBack }: RecommendationResultProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const conf = confidenceColors[recommendation.confidence];

  return (
    <div className="min-h-dvh bg-[#f7f5f1]">
      <div className="bg-brand-500 text-white">
        <div className="gs-container py-8 sm:py-12">
          <button
            onClick={onBack}
            className="mb-6 text-sm text-white/70 hover:text-white transition-colors"
          >
            &larr; Edit trip details
          </button>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-white/70">Leave by</p>
            <h1 className="mt-1 text-5xl sm:text-6xl font-extrabold tracking-tight">
              {formatTimeDisplay(recommendation.recommended_leave_time)}
            </h1>
            <p className="mt-3 text-lg text-white/80">
              Window: {formatWindowDisplay(recommendation.leave_window_start, recommendation.leave_window_end)}
            </p>
          </motion.div>

          <motion.div
            className="mt-6 flex flex-wrap gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
              {form.airline_name} {form.flight_number}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
              {form.airport_iata} · {form.departure_time}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
              recommendation.confidence === 'high' ? 'bg-green-400/20 text-green-100' :
              recommendation.confidence === 'medium' ? 'bg-yellow-400/20 text-yellow-100' :
              'bg-red-400/20 text-red-100'
            }`}>
              {conf.label}
            </span>
          </motion.div>
        </div>
      </div>

      <div className="gs-container py-8 space-y-6">
        <motion.div
          className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Recommendation</p>
            <p className="mt-3 text-lg leading-relaxed text-ink-700">{recommendation.summary}</p>
            {recommendation.warnings.length > 0 && (
              <div className="mt-4 space-y-2">
                {recommendation.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-warning-500">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 space-y-3">
              {([
                ['Leave home', recommendation.recommended_leave_time],
                ['Reach the curb', recommendation.recommended_curb_arrival],
                ['Enter security by', recommendation.latest_safe_security_entry],
                ['Arrive at gate by', recommendation.latest_safe_gate_arrival],
              ] as Array<[string, string]>).map(([label, time], index) => (
                <div key={label} className="grid grid-cols-[auto_1fr] gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">{index + 1}</div>
                    {index < 3 && <div className="mt-2 h-full min-h-5 w-px bg-ink-200" />}
                  </div>
                  <div className="pb-5">
                    <div className="text-sm font-semibold text-ink-900">{label}</div>
                    <div className="mt-1 text-sm text-ink-500">{formatTimeDisplay(time)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[2rem] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-ink-900">Confidence</div>
                  <div className="mt-1 text-sm text-ink-500">This reflects data freshness and fallback use, not mystery math.</div>
                </div>
                <div className={`rounded-full px-3 py-1 text-sm font-semibold ${conf.bg} ${conf.text}`}>
                  {recommendation.confidence_score}/100
                </div>
              </div>
              <p className="mt-4 text-xs text-ink-400">
                Computed at {new Date(recommendation.computed_at).toLocaleTimeString()}
                {recommendation.breakdown.some((item) => item.source_type === 'mock') && ' · Some sources are simulated in demo mode'}
              </p>
            </div>

            <div className="rounded-[2rem] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-ink-900">Actions</div>
                <button
                  onClick={async () => {
                    const url = `${window.location.origin}/share/${recommendation.id}`;
                    await navigator.clipboard.writeText(url);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1500);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-ink-500 hover:text-ink-700"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? 'Copied' : 'Copy share link'}
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/circles" className="gs-btn-primary gap-2">
                  <Users className="h-5 w-5" />
                  Find ride circles
                </Link>
                <Link href={`/share/${recommendation.id}`} className="gs-btn-secondary gap-2">
                  <Share2 className="h-5 w-5" />
                  Open share page
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="grid gap-4 sm:grid-cols-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-ink-500">
              <Car className="h-4 w-4" />
              Curb arrival
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">
              {formatTimeDisplay(recommendation.recommended_curb_arrival)}
            </div>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-ink-500">
              <Shield className="h-4 w-4" />
              Security entry
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">
              {formatTimeDisplay(recommendation.latest_safe_security_entry)}
            </div>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-ink-500">
              <MapPin className="h-4 w-4" />
              Gate arrival
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">
              {formatTimeDisplay(recommendation.latest_safe_gate_arrival)}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex w-full items-center justify-between rounded-[1.5rem] bg-white p-5 text-left shadow-sm transition-colors hover:bg-surface-secondary"
          >
            <span className="text-base font-semibold text-ink-900">Why this time</span>
            <span className="flex items-center gap-2 text-sm text-ink-500">
              {recommendation.total_minutes} min total
              {showBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </span>
          </button>

          {showBreakdown && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 overflow-hidden rounded-[1.5rem] bg-white shadow-sm"
            >
              <div className="divide-y divide-ink-100">
                {recommendation.breakdown.map((item, i) => (
                  <div key={i} className="grid gap-4 px-5 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-start">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-sm font-bold text-brand-600">
                      {item.minutes}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-ink-900">{item.label}</div>
                      <div className="mt-1 text-sm text-ink-500">{item.description}</div>
                      {item.source && (
                        <div className="mt-1 text-xs text-ink-400">
                          {item.source}
                          {item.freshness ? ` · updated ${new Date(item.freshness).toLocaleTimeString()}` : ''}
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-ink-500">{item.minutes} min</div>
                  </div>
                ))}
                <div className="flex items-center justify-between bg-surface-secondary px-5 py-4">
                  <span className="text-sm font-bold text-ink-900">Total planning buffer</span>
                  <span className="text-sm font-bold text-brand-600">{recommendation.total_minutes} min</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="rounded-[2rem] bg-white p-5 shadow-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.3 }}
        >
          <h3 className="text-base font-semibold text-ink-900 mb-4">Book your ride</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {(rideLinks ?? []).map((link) => {
              const isUber = link.provider === 'uber';
              return (
                <a
                  key={link.provider}
                  href={link.web_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-ink-200 p-4 hover:border-ink-300 hover:shadow-sm transition-all"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-white text-sm font-bold ${isUber ? 'bg-black' : 'bg-[#FF00BF]'}`}>
                    {isUber ? 'U' : 'L'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-ink-900 capitalize">{link.provider}</div>
                    <div className="text-xs text-ink-500">
                      ~${(link.estimated_price_cents / 100).toFixed(0)} estimated
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-ink-400" />
                </a>
              );
            })}
            {(!rideLinks || rideLinks.length === 0) && (
              <p className="text-sm text-ink-400 col-span-2">Ride links unavailable</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
