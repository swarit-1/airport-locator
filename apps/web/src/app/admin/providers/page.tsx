'use client';

import Link from 'next/link';
import { ChevronLeft, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';

const providers = [
  {
    name: 'Traffic',
    adapter: 'MockTrafficProvider',
    status: 'mock' as const,
    lastFetch: null,
    notes: 'Haversine + time-of-day heuristic. Switch to Google Routes API with GOOGLE_MAPS_API_KEY.',
  },
  {
    name: 'Flight Status',
    adapter: 'MockFlightProvider',
    status: 'mock' as const,
    lastFetch: null,
    notes: 'Deterministic mock flights. Switch to FlightAware with FLIGHTAWARE_API_KEY.',
  },
  {
    name: 'Wait Times',
    adapter: 'MockWaitTimeProvider',
    status: 'mock' as const,
    lastFetch: null,
    notes: 'Historical airport averages. Chain: Airport config → MyTSA → Crowdsourced → Historical fallback.',
    priority: ['Airport-specific source', 'MyTSA API', 'Crowdsourced reports', 'Historical model'],
  },
  {
    name: 'Ride Links',
    adapter: 'MockRideLinkProvider',
    status: 'live' as const,
    lastFetch: new Date().toISOString(),
    notes: 'Deep links to Uber/Lyft apps. Links work without API keys.',
  },
  {
    name: 'Cost Estimates',
    adapter: 'MockCostEstimateProvider',
    status: 'mock' as const,
    lastFetch: null,
    notes: 'Distance-based heuristic. Real pricing requires Uber/Lyft partner API access.',
  },
  {
    name: 'Notifications',
    adapter: 'MockNotificationProvider',
    status: 'mock' as const,
    lastFetch: null,
    notes: 'Console-only logging. Connect email/push provider for production.',
  },
];

const statusConfig = {
  live: { icon: CheckCircle2, color: 'text-success-500', bg: 'bg-success-50', label: 'Live' },
  mock: { icon: AlertTriangle, color: 'text-warning-500', bg: 'bg-warning-50', label: 'Mock' },
  error: { icon: XCircle, color: 'text-error-500', bg: 'bg-error-50', label: 'Error' },
};

export default function AdminProvidersPage() {
  return (
    <div className="min-h-dvh bg-surface-secondary">
      <header className="border-b border-ink-100 bg-surface-primary">
        <div className="gs-container flex items-center gap-3 py-3">
          <Link href="/admin" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors -ml-2">
            <ChevronLeft className="h-5 w-5 text-ink-600" />
          </Link>
          <h1 className="text-lg font-bold text-ink-900">Provider Status</h1>
        </div>
      </header>

      <div className="gs-container py-6">
        <div className="space-y-4">
          {providers.map((provider) => {
            const sc = statusConfig[provider.status];
            const StatusIcon = sc.icon;
            return (
              <div key={provider.name} className="rounded-xl border border-ink-200 bg-surface-primary p-5">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${sc.bg}`}>
                    <StatusIcon className={`h-5 w-5 ${sc.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-ink-900">{provider.name}</h3>
                      <span className={`gs-badge ${sc.bg} ${sc.color}`}>{sc.label}</span>
                    </div>
                    <p className="text-sm text-ink-500 mt-0.5 font-mono text-xs">{provider.adapter}</p>
                    <p className="text-sm text-ink-600 mt-2">{provider.notes}</p>
                    {provider.lastFetch && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-ink-400">
                        <Clock className="h-3 w-3" />
                        Last fetch: {new Date(provider.lastFetch).toLocaleString()}
                      </div>
                    )}
                    {(provider as { priority?: string[] }).priority && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-ink-600 mb-1">Priority chain:</p>
                        <ol className="list-decimal list-inside text-xs text-ink-500 space-y-0.5">
                          {(provider as { priority: string[] }).priority.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
