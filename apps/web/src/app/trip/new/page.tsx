'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Recommendation } from '@gateshare/domain';
import { IntroScreen } from '@/components/intro/IntroScreen';
import { AirlineStep } from '@/components/trip/AirlineStep';
import { FlightStep } from '@/components/trip/FlightStep';
import { DetailsStep } from '@/components/trip/DetailsStep';
import { PreferencesStep } from '@/components/trip/PreferencesStep';
import { RecommendationResult } from '@/components/recommendation/RecommendationResult';
import type { RideLink } from '@/components/recommendation/RecommendationResult';
import {
  getAdminRulesRepo,
  getRecommendationRepo,
  getTripRepo,
  type AirlineRule,
  type AirportRule,
} from '@/lib/repositories';
import { rideLinkProvider } from '@/lib/providers';
import { useHydrated } from '@/hooks/use-hydrated';
import {
  DEFAULT_DEPARTURE_TIME,
  getDefaultDepartureDate,
  getDefaultOrigin,
} from '@/lib/trip-defaults';

type Step = 'intro' | 'airline' | 'flight' | 'details' | 'preferences' | 'result';

type ResolveState = {
  status: 'idle' | 'loading' | 'resolved' | 'error';
  message?: string;
  sourceLabel?: string;
};

interface TripFormData {
  airline_iata: string;
  airline_name: string;
  flight_number: string;
  departure_date: string;
  departure_time: string;
  airport_iata: string;
  airport_timezone: string;
  flight_type: 'domestic' | 'international';
  flight_status: string | null;
  terminal: string | null;
  gate: string | null;
  origin_label: string;
  origin_lat: number;
  origin_lng: number;
  origin_mode: 'typed_address' | 'device_location';
  has_checked_bags: boolean;
  bag_count: number;
  party_size: number;
  has_tsa_precheck: boolean;
  has_clear: boolean;
  traveling_with_kids: boolean;
  accessibility_needs: boolean;
  ride_mode: 'rideshare' | 'friend_dropoff' | 'self_drive' | 'transit';
  risk_profile: 'conservative' | 'balanced' | 'aggressive';
  resolved_flight_source_name: string | null;
  resolved_flight_source_type: string | null;
  resolved_flight_notes: string | null;
  resolved_location_source_name: string | null;
  resolved_location_source_type: string | null;
  resolved_location_notes: string | null;
}

const defaultOrigin = getDefaultOrigin('SEA');

const defaultForm: TripFormData = {
  airline_iata: '',
  airline_name: '',
  flight_number: '',
  departure_date: getDefaultDepartureDate(),
  departure_time: DEFAULT_DEPARTURE_TIME,
  airport_iata: 'SEA',
  airport_timezone: 'America/Los_Angeles',
  flight_type: 'domestic',
  flight_status: null,
  terminal: null,
  gate: null,
  origin_label: defaultOrigin.label,
  origin_lat: defaultOrigin.lat,
  origin_lng: defaultOrigin.lng,
  origin_mode: 'typed_address',
  has_checked_bags: false,
  bag_count: 0,
  party_size: 1,
  has_tsa_precheck: false,
  has_clear: false,
  traveling_with_kids: false,
  accessibility_needs: false,
  ride_mode: 'rideshare',
  risk_profile: 'balanced',
  resolved_flight_source_name: null,
  resolved_flight_source_type: null,
  resolved_flight_notes: null,
  resolved_location_source_name: null,
  resolved_location_source_type: null,
  resolved_location_notes: null,
};

function formatReadableTime(value: string) {
  return new Date(`2026-03-12T${value}:00`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function NewTripPage() {
  const hydrated = useHydrated();
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [airlines, setAirlines] = useState<AirlineRule[]>([]);
  const [airports, setAirports] = useState<AirportRule[]>([]);
  const [step, setStep] = useState<Step>('intro');
  const [form, setForm] = useState<TripFormData>(defaultForm);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [rideLinks, setRideLinks] = useState<RideLink[]>([]);
  const [computing, setComputing] = useState(false);
  const [direction, setDirection] = useState(1);
  const [flightLookup, setFlightLookup] = useState<ResolveState>({ status: 'idle' });
  const [locationLookup, setLocationLookup] = useState<ResolveState>({ status: 'idle' });

  useEffect(() => {
    if (!hydrated) return;

    const repo = getAdminRulesRepo();
    const nextAirlines = repo.getAirlines();
    const nextAirports = repo.getAirports();
    const currentAirport = repo.getAirport(defaultForm.airport_iata);

    setAirlines(nextAirlines);
    setAirports(nextAirports);
    if (currentAirport) {
      setForm((previous) => ({
        ...previous,
        airport_timezone: currentAirport.timezone,
      }));
    }
  }, [hydrated]);

  const currentAirport = useMemo(
    () => airports.find((airport) => airport.iata_code === form.airport_iata),
    [airports, form.airport_iata],
  );

  const goTo = useCallback((nextStep: Step, dir: number = 1) => {
    setDirection(dir);
    setStep(nextStep);
  }, []);

  const updateForm = useCallback((updates: Partial<TripFormData>) => {
    setForm((previous) => ({ ...previous, ...updates }));
  }, []);

  const resolveFlight = useCallback(async () => {
    if (!form.airline_iata || !form.flight_number.trim() || !form.departure_date) {
      setFlightLookup({
        status: 'error',
        message: 'Add an airline, flight number, and date first.',
      });
      return;
    }

    setFlightLookup({ status: 'loading' });

    try {
      const response = await fetch('/api/trips/resolve-flight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airline_iata: form.airline_iata,
          flight_number: form.flight_number,
          departure_date: form.departure_date,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? 'Flight lookup failed');
      }

      if (!payload.found) {
        setFlightLookup({
          status: 'error',
          message: 'No provider result for that flight. You can continue with manual timing.',
        });
        return;
      }

      const flight = payload.flight as {
        airport_iata: string;
        airport_name: string | null;
        airport_timezone: string | null;
        departure_date: string;
        departure_time: string;
        terminal: string | null;
        gate: string | null;
        flight_type: 'domestic' | 'international';
        status: string;
        delay_minutes: number;
        source_name: string;
        source_type: string;
        notes: string | null;
      };
      const previousAirport = form.airport_iata;
      const nextAirport = airports.find((airport) => airport.iata_code === flight.airport_iata);
      const previousDefaultOrigin = getDefaultOrigin(previousAirport).label;
      const nextDefaultOrigin = getDefaultOrigin(flight.airport_iata);
      const shouldRefreshOrigin =
        !form.origin_label.trim() ||
        form.origin_label === previousDefaultOrigin;

      updateForm({
        airport_iata: flight.airport_iata,
        airport_timezone: flight.airport_timezone ?? nextAirport?.timezone ?? form.airport_timezone,
        departure_date: flight.departure_date,
        departure_time: flight.departure_time,
        flight_type: flight.flight_type,
        flight_status: flight.status,
        terminal: flight.terminal,
        gate: flight.gate,
        ...(shouldRefreshOrigin ? {
          origin_label: nextDefaultOrigin.label,
          origin_lat: nextDefaultOrigin.lat,
          origin_lng: nextDefaultOrigin.lng,
        } : {}),
        resolved_flight_source_name: flight.source_name,
        resolved_flight_source_type: flight.source_type,
        resolved_flight_notes: flight.notes,
      });
      setFlightLookup({
        status: 'resolved',
        sourceLabel: `${flight.source_name}${flight.source_type === 'mock' ? ' · demo mode' : ''}`,
        message: `${flight.airport_iata} at ${formatReadableTime(flight.departure_time)}${flight.delay_minutes > 0 ? `, delayed ${flight.delay_minutes} min` : ''}. ${flight.source_type === 'mock' ? 'Using deterministic demo flight data.' : 'Using live flight data.'}`,
      });
    } catch (error) {
      setFlightLookup({
        status: 'error',
        message: error instanceof Error ? error.message : 'Flight lookup failed',
      });
    }
  }, [airports, form, updateForm]);

  const resolveOrigin = useCallback(async () => {
    if (!form.origin_label.trim()) {
      setLocationLookup({
        status: 'error',
        message: 'Add an origin before resolving it.',
      });
      return;
    }

    setLocationLookup({ status: 'loading' });

    try {
      const response = await fetch('/api/trips/resolve-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'typed_address',
          query: form.origin_label,
          airport_iata: form.airport_iata,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? 'Origin lookup failed');
      }

      const location = payload.location as {
        label: string;
        point: { lat: number; lng: number };
        source_name: string;
        source_type: string;
        notes?: string | null;
      };

      updateForm({
        origin_label: location.label,
        origin_lat: location.point.lat,
        origin_lng: location.point.lng,
        origin_mode: 'typed_address',
        resolved_location_source_name: location.source_name,
        resolved_location_source_type: location.source_type,
        resolved_location_notes: location.notes ?? null,
      });
      setLocationLookup({
        status: 'resolved',
        sourceLabel: location.source_name,
        message: `${location.label} resolved for timing estimates.`,
      });
    } catch (error) {
      setLocationLookup({
        status: 'error',
        message: error instanceof Error ? error.message : 'Origin lookup failed',
      });
    }
  }, [form.airport_iata, form.origin_label, updateForm]);

  const useCurrentLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationLookup({
        status: 'error',
        message: 'Browser geolocation is unavailable here. Type a neighborhood, landmark, or address instead.',
      });
      return;
    }

    setLocationLookup({ status: 'loading' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch('/api/trips/resolve-location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode: 'device_location',
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }),
          });
          const payload = await response.json();

          if (!response.ok) {
            throw new Error(payload.error ?? 'Current location lookup failed');
          }

          const location = payload.location as {
            label: string;
            point: { lat: number; lng: number };
            source_name: string;
            source_type: string;
            notes?: string | null;
          };

          updateForm({
            origin_label: location.label,
            origin_lat: location.point.lat,
            origin_lng: location.point.lng,
            origin_mode: 'device_location',
            resolved_location_source_name: location.source_name,
            resolved_location_source_type: location.source_type,
            resolved_location_notes: location.notes ?? null,
          });
          setLocationLookup({
            status: 'resolved',
            sourceLabel: location.source_name,
            message: 'Current location captured for timing estimates.',
          });
        } catch (error) {
          setLocationLookup({
            status: 'error',
            message: error instanceof Error ? error.message : 'Current location lookup failed',
          });
        }
      },
      () => {
        setLocationLookup({
          status: 'error',
          message: 'Location access was denied. Type a neighborhood, landmark, or address instead.',
        });
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }, [updateForm]);

  const computeRecommendation = useCallback(async () => {
    if (!currentAirport) {
      return;
    }

    setComputing(true);

    try {
      const rulesRepo = getAdminRulesRepo();
      const airportProfile = rulesRepo.getAirportProfile(form.airport_iata, form.flight_type);
      const airlinePolicy = rulesRepo.getAirlinePolicy(form.airline_iata, form.flight_type);

      if (!airportProfile || !airlinePolicy) {
        throw new Error('Missing airport or airline timing rules');
      }

      const tripId = crypto.randomUUID();
      getTripRepo().save({
        id: tripId,
        airline_iata: form.airline_iata,
        airline_name: form.airline_name,
        flight_number: form.flight_number,
        departure_date: form.departure_date,
        departure_time: form.departure_time,
        airport_iata: form.airport_iata,
        flight_type: form.flight_type,
        origin_label: form.origin_label,
        origin_lat: form.origin_lat,
        origin_lng: form.origin_lng,
        has_checked_bags: form.has_checked_bags,
        bag_count: form.bag_count,
        party_size: form.party_size,
        has_tsa_precheck: form.has_tsa_precheck,
        has_clear: form.has_clear,
        traveling_with_kids: form.traveling_with_kids,
        accessibility_needs: form.accessibility_needs,
        ride_mode: form.ride_mode,
        risk_profile: form.risk_profile,
        created_at: new Date().toISOString(),
      });

      const response = await fetch('/api/trips/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: tripId,
          airline_iata: form.airline_iata,
          flight_number: form.flight_number,
          departure_date: form.departure_date,
          departure_time: form.departure_time,
          airport_iata: form.airport_iata,
          flight_type: form.flight_type,
          origin_label: form.origin_label,
          origin_lat: form.origin_lat,
          origin_lng: form.origin_lng,
          has_checked_bags: form.has_checked_bags,
          bag_count: form.bag_count,
          party_size: form.party_size,
          has_tsa_precheck: form.has_tsa_precheck,
          has_clear: form.has_clear,
          traveling_with_kids: form.traveling_with_kids,
          accessibility_needs: form.accessibility_needs,
          ride_mode: form.ride_mode,
          risk_profile: form.risk_profile,
          airport_rules: {
            curb_to_bag_drop_minutes: airportProfile.curb_to_bag_drop_minutes,
            bag_drop_to_security_minutes: airportProfile.bag_drop_to_security_minutes,
            security_to_gate_minutes: airportProfile.security_to_gate_minutes,
            avg_security_wait_minutes: airportProfile.avg_security_wait_minutes,
            peak_security_wait_minutes: airportProfile.peak_security_wait_minutes,
            min_arrival_before_departure: airportProfile.min_arrival_before_departure,
          },
          airline_rules: {
            bag_drop_cutoff_minutes: airlinePolicy.bag_drop_cutoff_minutes,
            boarding_begins_minutes: airlinePolicy.boarding_begins_minutes,
            gate_close_minutes: airlinePolicy.gate_close_minutes,
          },
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? 'Recommendation failed');
      }

      const nextRecommendation = payload.recommendation as Recommendation;
      getRecommendationRepo().save({
        ...nextRecommendation,
        airline_name: form.airline_name,
        flight_number: form.flight_number,
        airport_iata: form.airport_iata,
        departure_time: form.departure_time,
        departure_date: form.departure_date,
      });

      const origin = { lat: form.origin_lat, lng: form.origin_lng };
      const destination = { lat: currentAirport.lat, lng: currentAirport.lng };
      const [uberLink, lyftLink] = await Promise.all([
        rideLinkProvider.getRideLink(origin, destination, 'uber').catch(() => null),
        rideLinkProvider.getRideLink(origin, destination, 'lyft').catch(() => null),
      ]);
      const nextRideLinks: RideLink[] = [];
      if (uberLink) {
        nextRideLinks.push({
          provider: uberLink.provider,
          web_link: uberLink.web_link,
          estimated_price_cents: uberLink.estimated_price_cents ?? 0,
        });
      }
      if (lyftLink) {
        nextRideLinks.push({
          provider: lyftLink.provider,
          web_link: lyftLink.web_link,
          estimated_price_cents: lyftLink.estimated_price_cents ?? 0,
        });
      }

      setRideLinks(nextRideLinks);
      setRecommendation(nextRecommendation);
      goTo('result');
    } catch (error) {
      console.error('Recommendation computation failed:', error);
    } finally {
      setComputing(false);
    }
  }, [currentAirport, form, goTo]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: prefersReducedMotion ? 0 : dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: prefersReducedMotion ? 0 : dir > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  if (!hydrated) {
    return (
      <div className="min-h-dvh bg-brand-500">
        <div className="flex min-h-dvh items-center justify-center px-6 text-center text-white">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              GateShare
            </div>
            <div className="mt-4 text-5xl font-semibold tracking-tight">
              Let&apos;s move
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-dvh overflow-hidden">
      <AnimatePresence mode="wait" custom={direction}>
        {step === 'intro' ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { x: '-100%', opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.42, ease: [0.4, 0, 0.2, 1] }}
          >
            <IntroScreen onComplete={() => goTo('airline')} />
          </motion.div>
        ) : null}

        {step === 'airline' ? (
          <motion.div
            key="airline"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.36, ease: [0.4, 0, 0.2, 1] }}
            className="min-h-dvh"
          >
            <AirlineStep
              airlines={airlines}
              selected={form.airline_iata}
              onSelect={(iata, name) => {
                updateForm({ airline_iata: iata, airline_name: name });
                goTo('flight');
              }}
            />
          </motion.div>
        ) : null}

        {step === 'flight' ? (
          <motion.div
            key="flight"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.36, ease: [0.4, 0, 0.2, 1] }}
            className="min-h-dvh"
          >
            <FlightStep
              form={form}
              airports={airports}
              onUpdate={updateForm}
              onResolveFlight={resolveFlight}
              onResolveOrigin={resolveOrigin}
              onUseCurrentLocation={useCurrentLocation}
              flightLookup={flightLookup}
              locationLookup={locationLookup}
              onNext={() => goTo('details')}
              onBack={() => goTo('airline', -1)}
            />
          </motion.div>
        ) : null}

        {step === 'details' ? (
          <motion.div
            key="details"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.36, ease: [0.4, 0, 0.2, 1] }}
            className="min-h-dvh"
          >
            <DetailsStep
              form={form}
              onUpdate={updateForm}
              onNext={() => goTo('preferences')}
              onBack={() => goTo('flight', -1)}
            />
          </motion.div>
        ) : null}

        {step === 'preferences' ? (
          <motion.div
            key="preferences"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.36, ease: [0.4, 0, 0.2, 1] }}
            className="min-h-dvh"
          >
            <PreferencesStep
              form={form}
              onUpdate={updateForm}
              onCompute={computeRecommendation}
              onBack={() => goTo('details', -1)}
              computing={computing}
            />
          </motion.div>
        ) : null}

        {step === 'result' && recommendation ? (
          <motion.div
            key="result"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.36, ease: [0.4, 0, 0.2, 1] }}
            className="min-h-dvh"
          >
            <RecommendationResult
              recommendation={recommendation}
              form={form}
              rideLinks={rideLinks}
              onBack={() => goTo('preferences', -1)}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
