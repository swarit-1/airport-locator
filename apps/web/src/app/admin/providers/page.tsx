import Link from 'next/link';
import { ChevronLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getProviderModeSummary } from '@/lib/server/provider-registry';

type ProviderStatus = 'live' | 'mock' | 'historical' | 'fallback-chain';

interface ProviderInfo {
  name: string;
  adapter: string;
  status: ProviderStatus;
  notes: string;
  envVars?: string[];
}

function getProviderList(): ProviderInfo[] {
  const modes = getProviderModeSummary();
  const isTrafficLive = modes.traffic === 'live';
  const isFlightLive = modes.flight !== 'mock';

  return [
    {
      name: 'Traffic',
      adapter: isTrafficLive ? 'GoogleRoutesTrafficProvider' : 'MockTrafficProvider',
      status: isTrafficLive ? 'live' : 'mock',
      notes: isTrafficLive
        ? 'Live traffic data from Google Routes API.'
        : 'Haversine + time-of-day heuristic. Set GOOGLE_MAPS_API_KEY to go live.',
      envVars: ['GOOGLE_MAPS_API_KEY'],
    },
    {
      name: 'Flight Status',
      adapter: isFlightLive ? modes.flight : 'MockFlightProvider',
      status: isFlightLive ? 'live' : 'mock',
      notes: isFlightLive
        ? `Live flight data via ${modes.flight}.`
        : 'Set FLIGHTAWARE_API_KEY or AVIATIONSTACK_API_KEY for live flight lookup.',
      envVars: ['FLIGHTAWARE_API_KEY', 'AVIATIONSTACK_API_KEY'],
    },
    {
      name: 'Wait Times',
      adapter: 'HistoricalWaitTimeProvider',
      status: 'historical',
      notes: 'Curated per-airport, per-terminal historical TSA wait time estimates with peak/off-peak modeling.',
    },
    {
      name: 'Geocoding',
      adapter: modes.geocoding === 'live' ? 'GoogleGeocodingProvider' : 'Fallback',
      status: modes.geocoding === 'live' ? 'live' : 'mock',
      notes: modes.geocoding === 'live'
        ? 'Google Geocoding API for address-to-coordinates resolution.'
        : 'Using deterministic fallback. Set GOOGLE_MAPS_API_KEY for real geocoding.',
      envVars: ['GOOGLE_MAPS_API_KEY'],
    },
    {
      name: 'Ride Links',
      adapter: 'MockRideLinkProvider',
      status: 'live',
      notes: 'Deep links to Uber/Lyft apps. Links work without API keys.',
    },
    {
      name: 'Cost Estimates',
      adapter: 'MockCostEstimateProvider',
      status: 'mock',
      notes: 'Distance-based heuristic. Real pricing requires Uber/Lyft partner API access.',
    },
    {
      name: 'Notifications',
      adapter: 'MockNotificationProvider',
      status: 'mock',
      notes: 'Console-only logging. Connect email/push provider for production.',
    },
  ];
}

const defaultStatus = { icon: AlertTriangle, color: 'text-warning-500', bg: 'bg-warning-50', label: 'Mock' };

const statusConfig: Record<string, { icon: typeof CheckCircle2 | typeof AlertTriangle; color: string; bg: string; label: string }> = {
  live: { icon: CheckCircle2, color: 'text-success-500', bg: 'bg-success-50', label: 'Live' },
  mock: { icon: AlertTriangle, color: 'text-warning-500', bg: 'bg-warning-50', label: 'Mock' },
  historical: { icon: CheckCircle2, color: 'text-brand-500', bg: 'bg-brand-50', label: 'Historical Data' },
  'fallback-chain': { icon: CheckCircle2, color: 'text-brand-500', bg: 'bg-brand-50', label: 'Fallback Chain' },
};

export default function AdminProvidersPage() {
  const providers = getProviderList();

  return (
    <div className="min-h-dvh bg-surface-secondary">
      <header className="border-b border-ink-100 bg-surface-primary">
        <div className="gs-container flex items-center gap-3 py-3">
          <Link href="/admin" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors -ml-2">
            <ChevronLeft className="h-5 w-5 text-ink-600" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-ink-900">Provider Status</h1>
            <p className="text-sm text-ink-500">Live status from the server runtime.</p>
          </div>
        </div>
      </header>

      <div className="gs-container py-6">
        <div className="space-y-4">
          {providers.map((provider) => {
            const sc = statusConfig[provider.status] ?? defaultStatus;
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
                    {provider.envVars && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {provider.envVars.map((v) => (
                          <code key={v} className="rounded bg-surface-secondary px-1.5 py-0.5 text-2xs font-mono text-ink-500">
                            {v}
                          </code>
                        ))}
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
