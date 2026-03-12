import Link from 'next/link';
import { Clock, MapPin, Shield, ArrowRight } from 'lucide-react';

// In production, this would fetch the recommendation by ID from Supabase
export default function SharePage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-dvh bg-surface-primary">
      <div className="bg-brand-500 text-white">
        <div className="gs-container py-12 text-center">
          <p className="text-sm font-medium text-white/70">GateShare Recommendation</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Leave by 11:15 AM
          </h1>
          <p className="mt-3 text-base text-white/80">
            Window: 10:55 AM – 11:25 AM
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm">
              American 1234
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm">
              SEA · 2:30 PM
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-400/20 text-green-100 px-3 py-1 text-sm font-semibold">
              High confidence
            </span>
          </div>
        </div>
      </div>

      <div className="gs-container py-8">
        <div className="grid gap-4 sm:grid-cols-3 max-w-2xl mx-auto">
          <div className="rounded-xl bg-surface-secondary p-4 text-center">
            <Clock className="mx-auto h-5 w-5 text-ink-400 mb-1" />
            <div className="text-lg font-bold text-ink-900">11:45 AM</div>
            <div className="text-xs text-ink-500">Curb arrival</div>
          </div>
          <div className="rounded-xl bg-surface-secondary p-4 text-center">
            <Shield className="mx-auto h-5 w-5 text-ink-400 mb-1" />
            <div className="text-lg font-bold text-ink-900">12:30 PM</div>
            <div className="text-xs text-ink-500">Through security</div>
          </div>
          <div className="rounded-xl bg-surface-secondary p-4 text-center">
            <MapPin className="mx-auto h-5 w-5 text-ink-400 mb-1" />
            <div className="text-lg font-bold text-ink-900">1:00 PM</div>
            <div className="text-xs text-ink-500">At gate</div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-ink-500">Want your own personalized airport timing?</p>
          <Link href="/trip/new" className="gs-btn-primary mt-4 gap-2">
            Plan your trip
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
