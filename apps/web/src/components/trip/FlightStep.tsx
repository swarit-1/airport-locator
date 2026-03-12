'use client';

import { StepShell } from './StepShell';
import type { DemoAirport } from '@/lib/demo-data';

interface FlightStepProps {
  form: {
    airline_name: string;
    flight_number: string;
    departure_date: string;
    departure_time: string;
    airport_iata: string;
    flight_type: 'domestic' | 'international';
    origin_label: string;
  };
  airports: DemoAirport[];
  onUpdate: (updates: Record<string, unknown>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Default origins near each airport for demo
const DEFAULT_ORIGINS: Record<string, { label: string; lat: number; lng: number }> = {
  SEA: { label: 'Downtown Seattle', lat: 47.6062, lng: -122.3321 },
  LAX: { label: 'Santa Monica', lat: 34.0195, lng: -118.4912 },
  SFO: { label: 'Downtown San Francisco', lat: 37.7749, lng: -122.4194 },
  DEN: { label: 'Downtown Denver', lat: 39.7392, lng: -104.9903 },
  DFW: { label: 'Downtown Dallas', lat: 32.7767, lng: -96.7970 },
  ORD: { label: 'Downtown Chicago', lat: 41.8781, lng: -87.6298 },
  ATL: { label: 'Midtown Atlanta', lat: 33.7490, lng: -84.3880 },
  JFK: { label: 'Manhattan', lat: 40.7580, lng: -73.9855 },
  LGA: { label: 'Manhattan', lat: 40.7580, lng: -73.9855 },
  MCO: { label: 'Downtown Orlando', lat: 28.5383, lng: -81.3792 },
};

// Tomorrow's date
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split('T')[0]!;

export function FlightStep({ form, airports, onUpdate, onNext, onBack }: FlightStepProps) {
  const canProceed = form.flight_number && form.departure_date && form.departure_time && form.airport_iata;

  const handleAirportChange = (iata: string) => {
    const origin = DEFAULT_ORIGINS[iata];
    onUpdate({
      airport_iata: iata,
      ...(origin ? { origin_label: origin.label, origin_lat: origin.lat, origin_lng: origin.lng } : {}),
    });
  };

  return (
    <StepShell
      title="Tell us about your flight"
      subtitle={`Flying ${form.airline_name || 'with your airline'}. We'll look up your departure details.`}
      step={2}
      onBack={onBack}
      footer={
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="gs-btn-primary w-full sm:w-auto"
        >
          Next: Travel details
        </button>
      }
    >
      <div className="space-y-6 max-w-lg">
        {/* Flight number */}
        <div>
          <label htmlFor="flight_number" className="gs-label">
            Flight number
          </label>
          <div className="flex items-center gap-2">
            <span className="flex h-12 items-center rounded-lg border border-ink-200 bg-surface-secondary px-3 text-sm font-semibold text-ink-600">
              {form.airline_name?.split(' ')[0] ?? 'AA'}
            </span>
            <input
              id="flight_number"
              type="text"
              placeholder="1234"
              value={form.flight_number}
              onChange={(e) => onUpdate({ flight_number: e.target.value.replace(/\D/g, '') })}
              className="gs-input flex-1"
              inputMode="numeric"
              autoFocus
            />
          </div>
        </div>

        {/* Departure date */}
        <div>
          <label htmlFor="departure_date" className="gs-label">
            Departure date
          </label>
          <input
            id="departure_date"
            type="date"
            value={form.departure_date || tomorrowStr}
            onChange={(e) => onUpdate({ departure_date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="gs-input"
          />
        </div>

        {/* Departure time */}
        <div>
          <label htmlFor="departure_time" className="gs-label">
            Scheduled departure time
          </label>
          <input
            id="departure_time"
            type="time"
            value={form.departure_time || '14:30'}
            onChange={(e) => onUpdate({ departure_time: e.target.value })}
            className="gs-input"
          />
        </div>

        {/* Airport */}
        <div>
          <label htmlFor="airport" className="gs-label">
            Departing from
          </label>
          <select
            id="airport"
            value={form.airport_iata}
            onChange={(e) => handleAirportChange(e.target.value)}
            className="gs-input"
          >
            {airports.map((a) => (
              <option key={a.iata_code} value={a.iata_code}>
                {a.iata_code} — {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Flight type */}
        <div>
          <label className="gs-label">Flight type</label>
          <div className="flex gap-3">
            {(['domestic', 'international'] as const).map((type) => (
              <button
                key={type}
                onClick={() => onUpdate({ flight_type: type })}
                className={`gs-chip flex-1 justify-center ${
                  form.flight_type === type ? 'gs-chip-active' : ''
                }`}
              >
                {type === 'domestic' ? 'Domestic' : 'International'}
              </button>
            ))}
          </div>
        </div>

        {/* Origin */}
        <div>
          <label htmlFor="origin" className="gs-label">
            Where are you coming from?
          </label>
          <input
            id="origin"
            type="text"
            placeholder="Downtown Seattle"
            value={form.origin_label || DEFAULT_ORIGINS[form.airport_iata]?.label || ''}
            onChange={(e) => onUpdate({ origin_label: e.target.value })}
            className="gs-input"
          />
          <p className="mt-1 text-xs text-ink-400">
            In the MVP, we use a preset location for your area. Real geocoding coming soon.
          </p>
        </div>
      </div>
    </StepShell>
  );
}
