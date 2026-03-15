import Link from 'next/link';
import { Clock, MapPin, Shield, ArrowRight } from 'lucide-react';
import { getRecommendationById } from '@/lib/server/demo-file-store';
import { CopyShareButton } from './copy-button';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recommendation = getRecommendationById(id);

  if (!recommendation) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-surface-primary">
        <div className="text-center">
          <h1 className="text-xl font-bold text-ink-900">Recommendation not found</h1>
          <p className="mt-2 text-sm text-ink-500">Open a trip in Boarding first, then share that recommendation.</p>
          <Link href="/trip/new" className="gs-btn-primary mt-5">Plan a trip</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-surface-primary">
      <div className="bg-brand-500 text-white">
        <div className="gs-container py-12 sm:py-16">
          <p className="text-sm font-medium text-white/70">Shared from Boarding</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-6xl">
            Leave by {formatTime(recommendation.recommended_leave_time)}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80">
            {recommendation.summary}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm">
              {recommendation.airline_name} {recommendation.flight_number}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm">
              {recommendation.airport_iata} · {recommendation.departure_date} · {recommendation.departure_time}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold capitalize">
              {recommendation.confidence} confidence
            </span>
          </div>
        </div>
      </div>

      <div className="gs-container py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-surface-secondary p-5">
            <Clock className="h-5 w-5 text-ink-400" />
            <div className="mt-4 text-2xl font-semibold text-ink-900">{formatTime(recommendation.recommended_curb_arrival)}</div>
            <div className="mt-1 text-sm text-ink-500">Arrive at the curb</div>
          </div>
          <div className="rounded-2xl bg-surface-secondary p-5">
            <Shield className="h-5 w-5 text-ink-400" />
            <div className="mt-4 text-2xl font-semibold text-ink-900">{formatTime(recommendation.latest_safe_security_entry)}</div>
            <div className="mt-1 text-sm text-ink-500">Be entering security by</div>
          </div>
          <div className="rounded-2xl bg-surface-secondary p-5">
            <MapPin className="h-5 w-5 text-ink-400" />
            <div className="mt-4 text-2xl font-semibold text-ink-900">{formatTime(recommendation.latest_safe_gate_arrival)}</div>
            <div className="mt-1 text-sm text-ink-500">Reach your gate by</div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-ink-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-ink-900">Why this timing works</h2>
              <p className="mt-1 text-sm text-ink-500">Built from traffic, wait times, bag rules, and your risk profile.</p>
            </div>
            <CopyShareButton />
          </div>

          <div className="mt-6 space-y-3">
            {recommendation.breakdown.map((item) => (
              <div key={`${item.label}-${item.minutes}`} className="grid gap-2 rounded-2xl bg-surface-secondary px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <div className="text-sm font-semibold text-ink-900">{item.label}</div>
                  <div className="text-xs text-ink-500">{item.description}</div>
                </div>
                <div className="text-sm font-semibold text-brand-600">{item.minutes} min</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-ink-500">Want your own personalized leave time and ride circles?</p>
          <Link href="/trip/new" className="gs-btn-primary mt-4 gap-2">
            Plan your trip
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
