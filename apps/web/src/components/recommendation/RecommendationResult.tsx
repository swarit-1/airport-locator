'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2,
  Car, Shield, MapPin, Users, Share2, ExternalLink,
} from 'lucide-react';
import type { Recommendation } from '@gateshare/domain';
import Link from 'next/link';

interface RecommendationResultProps {
  recommendation: Recommendation;
  form: {
    airline_name: string;
    flight_number: string;
    departure_date: string;
    departure_time: string;
    airport_iata: string;
    origin_label: string;
    ride_mode: string;
    risk_profile: string;
  };
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

export function RecommendationResult({ recommendation, form, onBack }: RecommendationResultProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const conf = confidenceColors[recommendation.confidence];

  return (
    <div className="min-h-dvh bg-surface-primary">
      {/* Hero section with leave time */}
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
            <p className="text-sm font-medium text-white/70 uppercase tracking-wider">
              Leave by
            </p>
            <h1 className="mt-1 text-5xl sm:text-6xl font-extrabold tracking-tight">
              {formatTimeDisplay(recommendation.recommended_leave_time)}
            </h1>
            <p className="mt-3 text-lg text-white/80">
              Window: {formatWindowDisplay(recommendation.leave_window_start, recommendation.leave_window_end)}
            </p>
          </motion.div>

          {/* Flight info bar */}
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

      {/* Content */}
      <div className="gs-container py-8 space-y-6">
        {/* Summary */}
        <motion.div
          className="rounded-xl border border-ink-200 p-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <p className="text-base text-ink-700 leading-relaxed">{recommendation.summary}</p>
          {recommendation.warnings.length > 0 && (
            <div className="mt-4 space-y-2">
              {recommendation.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-warning-500">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Key times */}
        <motion.div
          className="grid gap-4 sm:grid-cols-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <div className="rounded-xl bg-surface-secondary p-4">
            <div className="flex items-center gap-2 text-sm text-ink-500">
              <Car className="h-4 w-4" />
              Curb arrival
            </div>
            <div className="mt-1 text-xl font-bold text-ink-900">
              {formatTimeDisplay(recommendation.recommended_curb_arrival)}
            </div>
          </div>
          <div className="rounded-xl bg-surface-secondary p-4">
            <div className="flex items-center gap-2 text-sm text-ink-500">
              <Shield className="h-4 w-4" />
              Through security by
            </div>
            <div className="mt-1 text-xl font-bold text-ink-900">
              {formatTimeDisplay(recommendation.latest_safe_security_entry)}
            </div>
          </div>
          <div className="rounded-xl bg-surface-secondary p-4">
            <div className="flex items-center gap-2 text-sm text-ink-500">
              <MapPin className="h-4 w-4" />
              At gate by
            </div>
            <div className="mt-1 text-xl font-bold text-ink-900">
              {formatTimeDisplay(recommendation.latest_safe_gate_arrival)}
            </div>
          </div>
        </motion.div>

        {/* Breakdown toggle */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex w-full items-center justify-between rounded-xl border border-ink-200 p-4 text-left hover:bg-surface-secondary transition-colors"
          >
            <span className="text-base font-semibold text-ink-900">
              Why this time?
            </span>
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
              className="mt-1 rounded-xl border border-ink-200 overflow-hidden"
            >
              <div className="divide-y divide-ink-100">
                {recommendation.breakdown.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-600">
                      {item.minutes}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-ink-900">{item.label}</div>
                      <div className="text-xs text-ink-500 mt-0.5">{item.description}</div>
                      {item.source && (
                        <div className="mt-1 flex items-center gap-1 text-2xs text-ink-400">
                          <span>Source: {item.source}</span>
                          {item.freshness && (
                            <span>· Updated {new Date(item.freshness).toLocaleTimeString()}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-medium text-ink-400 tabular-nums">
                      {item.minutes} min
                    </div>
                  </div>
                ))}
                {/* Total */}
                <div className="flex items-center justify-between bg-surface-secondary p-4">
                  <span className="text-sm font-bold text-ink-900">Total</span>
                  <span className="text-sm font-bold text-brand-600">{recommendation.total_minutes} min</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-wrap gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <Link href="/circles" className="gs-btn-primary gap-2">
            <Users className="h-5 w-5" />
            Find ride companions
          </Link>
          <button className="gs-btn-secondary gap-2">
            <Share2 className="h-5 w-5" />
            Share
          </button>
        </motion.div>

        {/* Ride links */}
        <motion.div
          className="rounded-xl border border-ink-200 p-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.3 }}
        >
          <h3 className="text-base font-semibold text-ink-900 mb-4">Book your ride</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href={`https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${form.origin_label ? '47.6062' : '47.6062'}&pickup[longitude]=-122.3321`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-ink-200 p-4 hover:border-ink-300 hover:shadow-sm transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white text-sm font-bold">
                U
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-ink-900">Uber</div>
                <div className="text-xs text-ink-500">Open in Uber app</div>
              </div>
              <ExternalLink className="h-4 w-4 text-ink-400" />
            </a>
            <a
              href={`https://ride.lyft.com/ridetype?id=lyft&pickup[latitude]=47.6062&pickup[longitude]=-122.3321`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-ink-200 p-4 hover:border-ink-300 hover:shadow-sm transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF00BF] text-white text-sm font-bold">
                L
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-ink-900">Lyft</div>
                <div className="text-xs text-ink-500">Open in Lyft app</div>
              </div>
              <ExternalLink className="h-4 w-4 text-ink-400" />
            </a>
          </div>
        </motion.div>

        {/* Confidence and freshness */}
        <motion.div
          className={`rounded-xl border p-4 ${conf.bg} ${conf.border}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`h-5 w-5 ${conf.text}`} />
            <span className={`text-sm font-semibold ${conf.text}`}>
              {conf.label} · Score: {recommendation.confidence_score}/100
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-500">
            Computed at {new Date(recommendation.computed_at).toLocaleTimeString()}
            {recommendation.breakdown.some(b => b.source_type === 'mock') && (
              <span> · Some data sources are simulated for the demo</span>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
