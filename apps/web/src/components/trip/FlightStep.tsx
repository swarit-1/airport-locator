'use client';

import { useEffect } from 'react';
import { CheckCircle2, Crosshair, Loader2, LocateFixed, Sparkles } from 'lucide-react';
import { StepShell } from './StepShell';
import { AirlineLogo } from './AirlineLogo';
import type { AirportRule } from '@/lib/repositories';
import {
  DEFAULT_DEPARTURE_TIME,
  getDefaultDepartureDate,
  getDefaultOrigin,
} from '@/lib/trip-defaults';

type ResolveStatus = {
  status: 'idle' | 'loading' | 'resolved' | 'error';
  message?: string;
  sourceLabel?: string;
};

interface FlightStepProps {
  form: {
    airline_iata: string;
    airline_name: string;
    flight_number: string;
    departure_date: string;
    departure_time: string;
    airport_iata: string;
    airport_timezone?: string;
    flight_type: 'domestic' | 'international';
    origin_label: string;
    origin_mode?: 'typed_address' | 'device_location';
    terminal?: string | null;
    gate?: string | null;
    resolved_flight_source_name?: string | null;
    resolved_flight_source_type?: string | null;
    resolved_flight_notes?: string | null;
    resolved_location_source_name?: string | null;
    resolved_location_notes?: string | null;
  };
  airports: AirportRule[];
  onUpdate: (updates: Record<string, unknown>) => void;
  onResolveFlight: () => void;
  onResolveOrigin: () => void;
  onUseCurrentLocation: () => void;
  flightLookup: ResolveStatus;
  locationLookup: ResolveStatus;
  onNext: () => void;
  onBack: () => void;
}

export function FlightStep({
  form,
  airports,
  onUpdate,
  onResolveFlight,
  onResolveOrigin,
  onUseCurrentLocation,
  flightLookup,
  locationLookup,
  onNext,
  onBack,
}: FlightStepProps) {
  const canProceed = Boolean(
    form.flight_number.trim() &&
    form.departure_date &&
    form.departure_time &&
    form.airport_iata &&
    form.origin_label.trim(),
  );

  useEffect(() => {
    const updates: Record<string, unknown> = {};
    const defaultOrigin = getDefaultOrigin(form.airport_iata);

    if (!form.departure_date) updates.departure_date = getDefaultDepartureDate();
    if (!form.departure_time) updates.departure_time = DEFAULT_DEPARTURE_TIME;
    if (!form.origin_label) {
      updates.origin_label = defaultOrigin.label;
      updates.origin_lat = defaultOrigin.lat;
      updates.origin_lng = defaultOrigin.lng;
      updates.origin_mode = 'typed_address';
    }

    if (Object.keys(updates).length > 0) onUpdate(updates);
  }, [form.airport_iata, form.departure_date, form.departure_time, form.origin_label, onUpdate]);

  const handleAirportChange = (iata: string) => {
    const airport = airports.find((item) => item.iata_code === iata);
    const origin = getDefaultOrigin(iata);
    onUpdate({
      airport_iata: iata,
      airport_timezone: airport?.timezone ?? form.airport_timezone ?? null,
      origin_label: origin.label,
      origin_lat: origin.lat,
      origin_lng: origin.lng,
      origin_mode: 'typed_address',
    });
  };

  const selectedAirport = airports.find((airport) => airport.iata_code === form.airport_iata);

  return (
    <StepShell
      title="Flight number first. Manual control stays open."
      subtitle={`Flying ${form.airline_name || 'with your airline'}. Add a flight number and date, then let Boarding try to resolve the airport and departure details before you fine-tune the origin.`}
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
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-black/6 bg-white/78 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="border-b border-black/6 px-5 py-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
              Flight lookup
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">
              If a provider is configured, we resolve the flight and prefill the airport, scheduled departure, and terminal context. If not, the form still works in manual mode.
            </p>
          </div>

          <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
            <label className="block">
              <span className="gs-label">Flight number</span>
              <div className="flex items-center gap-2">
                <span className="flex h-12 min-w-12 items-center justify-center rounded-full bg-[#edf1f7] px-3 text-sm font-semibold text-ink-700">
                  {form.airline_iata ? (
                    <AirlineLogo iata={form.airline_iata} className="h-6 w-6" />
                  ) : (
                    'Air'
                  )}
                </span>
                <input
                  id="flight_number"
                  type="text"
                  placeholder="1286"
                  value={form.flight_number}
                  onChange={(event) => onUpdate({ flight_number: event.target.value.replace(/\D/g, '') })}
                  className="gs-input flex-1 !rounded-full !border-black/8 !bg-[#fbfaf7]"
                  inputMode="numeric"
                  autoFocus
                />
              </div>
            </label>

            <label className="block">
              <span className="gs-label">Departure date</span>
              <input
                id="departure_date"
                type="date"
                value={form.departure_date}
                onChange={(event) => onUpdate({ departure_date: event.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="gs-input !rounded-full !border-black/8 !bg-[#fbfaf7]"
              />
            </label>
          </div>

          <div className="border-t border-black/6 px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-ink-500">
                {flightLookup.status === 'resolved'
                  ? `Resolved from ${flightLookup.sourceLabel ?? 'provider'}`
                  : 'Use provider-backed lookup when available, or continue with manual details below.'}
              </div>
              <button
                onClick={onResolveFlight}
                disabled={!form.flight_number.trim() || !form.departure_date || flightLookup.status === 'loading'}
                className={`w-full gap-2 !rounded-full sm:w-auto ${
                  flightLookup.status === 'resolved'
                    ? 'gs-btn-primary !bg-brand-600 hover:!bg-brand-700'
                    : 'gs-btn-secondary'
                }`}
              >
                {flightLookup.status === 'loading' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Looking up flight
                  </>
                ) : flightLookup.status === 'resolved' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Flight resolved
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Autofill from flight
                  </>
                )}
              </button>
            </div>
            {flightLookup.message ? (
              <p className={`mt-3 text-sm ${flightLookup.status === 'error' ? 'text-warning-500' : 'text-ink-500'}`}>
                {flightLookup.message}
              </p>
            ) : null}
            {flightLookup.status === 'resolved' ? (
              <div className="mt-4 rounded-[1.5rem] bg-brand-50 px-4 py-4 text-sm text-brand-800">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  Autofill applied
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600/80">Airport</div>
                    <div className="mt-1">{selectedAirport?.iata_code ?? form.airport_iata}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600/80">Departure</div>
                    <div className="mt-1">{form.departure_time}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600/80">Terminal / gate</div>
                    <div className="mt-1">{form.terminal ?? 'TBD'} · {form.gate ?? 'TBD'}</div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-6 rounded-[2rem] border border-black/6 bg-white/78 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="gs-label">Scheduled departure time</span>
                <input
                  id="departure_time"
                  type="time"
                  value={form.departure_time}
                  onChange={(event) => onUpdate({ departure_time: event.target.value })}
                  className="gs-input !rounded-full !border-black/8 !bg-[#fbfaf7]"
                />
              </label>

              <label className="block">
                <span className="gs-label">Departing from</span>
                <select
                  id="airport"
                  value={form.airport_iata}
                  onChange={(event) => handleAirportChange(event.target.value)}
                  className="gs-input !rounded-full !border-black/8 !bg-[#fbfaf7]"
                >
                  {airports.map((airport) => (
                    <option key={airport.iata_code} value={airport.iata_code}>
                      {airport.iata_code} — {airport.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <label className="gs-label">Flight type</label>
              <div className="flex flex-wrap gap-2">
                {(['domestic', 'international'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => onUpdate({ flight_type: type })}
                    className={`gs-chip ${form.flight_type === type ? 'gs-chip-active' : ''}`}
                  >
                    {type === 'domestic' ? 'Domestic' : 'International'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="origin" className="gs-label !mb-0">
                  Origin or pickup area
                </label>
                <button
                  onClick={onUseCurrentLocation}
                  disabled={locationLookup.status === 'loading'}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-600"
                >
                  <LocateFixed className="h-3.5 w-3.5" />
                  Use current location
                </button>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Crosshair className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input
                    id="origin"
                    type="text"
                    placeholder={getDefaultOrigin(form.airport_iata)?.label ?? 'Origin area'}
                    value={form.origin_label}
                    onChange={(event) => onUpdate({ origin_label: event.target.value, origin_mode: 'typed_address' })}
                    className="gs-input !rounded-full !border-black/8 !bg-[#fbfaf7] !pl-11"
                  />
                </div>
                <button
                  onClick={onResolveOrigin}
                  disabled={!form.origin_label.trim() || locationLookup.status === 'loading'}
                  className="gs-btn-secondary gap-2 !rounded-full"
                >
                  {locationLookup.status === 'loading' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Resolving
                    </>
                  ) : (
                    'Use this origin'
                  )}
                </button>
              </div>
              <p className={`text-sm ${locationLookup.status === 'error' ? 'text-warning-500' : 'text-ink-500'}`}>
                {locationLookup.message ??
                  'Use a neighborhood, landmark, or address. Exact home addresses stay private until you decide to share them.'}
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/6 bg-[#eef3ff] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
              Current trip context
            </div>
            <div className="mt-4 space-y-4 text-sm text-ink-600">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">Airport</div>
                <div className="mt-1 font-semibold text-ink-900">
                  {selectedAirport?.iata_code ?? form.airport_iata}
                  {selectedAirport ? ` — ${selectedAirport.name}` : null}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">Resolved details</div>
                <div className="mt-1 font-semibold text-ink-900">
                  {form.terminal || form.gate
                    ? `Terminal ${form.terminal ?? 'TBD'} · Gate ${form.gate ?? 'TBD'}`
                    : 'Manual timing in progress'}
                </div>
                {form.resolved_flight_source_name ? (
                  <p className="mt-1 text-sm text-ink-500">
                    {form.resolved_flight_source_name}
                    {form.resolved_flight_notes ? ` · ${form.resolved_flight_notes}` : ''}
                  </p>
                ) : null}
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">Origin</div>
                <div className="mt-1 font-semibold text-ink-900">{form.origin_label}</div>
                {form.resolved_location_source_name ? (
                  <p className="mt-1 text-sm text-ink-500">
                    {form.origin_mode === 'device_location' ? 'Device location' : 'Typed origin'} via {form.resolved_location_source_name}
                    {form.resolved_location_notes ? ` · ${form.resolved_location_notes}` : ''}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </div>
    </StepShell>
  );
}
