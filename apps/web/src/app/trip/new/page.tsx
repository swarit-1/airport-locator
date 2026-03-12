'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IntroScreen } from '@/components/intro/IntroScreen';
import { AirlineStep } from '@/components/trip/AirlineStep';
import { FlightStep } from '@/components/trip/FlightStep';
import { DetailsStep } from '@/components/trip/DetailsStep';
import { PreferencesStep } from '@/components/trip/PreferencesStep';
import { RecommendationResult } from '@/components/recommendation/RecommendationResult';
import type { Recommendation } from '@gateshare/domain';
import { airlines, airports, getAirportProfile, getAirlinePolicy } from '@/lib/demo-data';
import { recommendationEngine } from '@/lib/providers';

type Step = 'intro' | 'airline' | 'flight' | 'details' | 'preferences' | 'result';

interface TripFormData {
  airline_iata: string;
  airline_name: string;
  flight_number: string;
  departure_date: string;
  departure_time: string;
  airport_iata: string;
  flight_type: 'domestic' | 'international';
  origin_label: string;
  origin_lat: number;
  origin_lng: number;
  has_checked_bags: boolean;
  bag_count: number;
  party_size: number;
  has_tsa_precheck: boolean;
  has_clear: boolean;
  traveling_with_kids: boolean;
  accessibility_needs: boolean;
  ride_mode: 'rideshare' | 'friend_dropoff' | 'self_drive' | 'transit';
  risk_profile: 'conservative' | 'balanced' | 'aggressive';
}

const defaultForm: TripFormData = {
  airline_iata: '',
  airline_name: '',
  flight_number: '',
  departure_date: '',
  departure_time: '',
  airport_iata: 'SEA',
  flight_type: 'domestic',
  origin_label: '',
  origin_lat: 47.6062,
  origin_lng: -122.3321,
  has_checked_bags: false,
  bag_count: 0,
  party_size: 1,
  has_tsa_precheck: false,
  has_clear: false,
  traveling_with_kids: false,
  accessibility_needs: false,
  ride_mode: 'rideshare',
  risk_profile: 'balanced',
};

const prefersReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

export default function NewTripPage() {
  const [step, setStep] = useState<Step>('intro');
  const [form, setForm] = useState<TripFormData>(defaultForm);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [computing, setComputing] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((nextStep: Step, dir: number = 1) => {
    setDirection(dir);
    setStep(nextStep);
  }, []);

  const updateForm = useCallback((updates: Partial<TripFormData>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  }, []);

  const computeRecommendation = useCallback(async () => {
    setComputing(true);
    try {
      const airport = airports.find((a) => a.iata_code === form.airport_iata);
      const airportProfile = getAirportProfile(form.airport_iata, form.flight_type);
      const airlinePolicy = getAirlinePolicy(form.airline_iata, form.flight_type);

      if (!airport || !airportProfile || !airlinePolicy) {
        throw new Error('Missing airport or airline data');
      }

      const result = await recommendationEngine.compute({
        tripId: `demo-${Date.now()}`,
        origin: { lat: form.origin_lat, lng: form.origin_lng },
        airportLocation: { lat: airport.lat, lng: airport.lng },
        airportIata: form.airport_iata,
        airlineIata: form.airline_iata,
        flightNumber: form.flight_number,
        departureDate: form.departure_date,
        departureTime: form.departure_time,
        flightType: form.flight_type,
        hasCheckedBags: form.has_checked_bags,
        bagCount: form.bag_count,
        partySize: form.party_size,
        hasTsaPrecheck: form.has_tsa_precheck,
        hasClear: form.has_clear,
        travelingWithKids: form.traveling_with_kids,
        accessibilityNeeds: form.accessibility_needs,
        rideMode: form.ride_mode,
        riskProfile: form.risk_profile,
        airportRules: {
          curb_to_bag_drop_minutes: airportProfile.curb_to_bag_drop_minutes,
          bag_drop_to_security_minutes: airportProfile.bag_drop_to_security_minutes,
          security_to_gate_minutes: airportProfile.security_to_gate_minutes,
          avg_security_wait_minutes: airportProfile.avg_security_wait_minutes,
          peak_security_wait_minutes: airportProfile.peak_security_wait_minutes,
          min_arrival_before_departure: airportProfile.min_arrival_before_departure,
        },
        airlineRules: {
          bag_drop_cutoff_minutes: airlinePolicy.bag_drop_cutoff_minutes,
          boarding_begins_minutes: airlinePolicy.boarding_begins_minutes,
          gate_close_minutes: airlinePolicy.gate_close_minutes,
        },
      });

      setRecommendation(result);
      goTo('result');
    } catch (err) {
      console.error('Recommendation computation failed:', err);
    } finally {
      setComputing(false);
    }
  }, [form, goTo]);

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

  return (
    <div ref={containerRef} className="min-h-dvh overflow-hidden">
      <AnimatePresence mode="wait" custom={direction}>
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { x: '-100%', opacity: 0 }
            }
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <IntroScreen onComplete={() => goTo('airline')} />
          </motion.div>
        )}

        {step === 'airline' && (
          <motion.div
            key="airline"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.35, ease: [0.4, 0, 0.2, 1] }}
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
        )}

        {step === 'flight' && (
          <motion.div
            key="flight"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="min-h-dvh"
          >
            <FlightStep
              form={form}
              airports={airports}
              onUpdate={updateForm}
              onNext={() => goTo('details')}
              onBack={() => goTo('airline', -1)}
            />
          </motion.div>
        )}

        {step === 'details' && (
          <motion.div
            key="details"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="min-h-dvh"
          >
            <DetailsStep
              form={form}
              onUpdate={updateForm}
              onNext={() => goTo('preferences')}
              onBack={() => goTo('flight', -1)}
            />
          </motion.div>
        )}

        {step === 'preferences' && (
          <motion.div
            key="preferences"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.35, ease: [0.4, 0, 0.2, 1] }}
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
        )}

        {step === 'result' && recommendation && (
          <motion.div
            key="result"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="min-h-dvh"
          >
            <RecommendationResult
              recommendation={recommendation}
              form={form}
              onBack={() => goTo('preferences', -1)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
