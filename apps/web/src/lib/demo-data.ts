// In-memory demo data for running without Supabase
// This allows the app to run fully locally without any external dependencies

import { airportSeeds, airportProfileSeeds, airlineSeeds, airlinePolicySeeds } from '@gateshare/db';

export interface DemoAirport {
  id: string;
  iata_code: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  timezone: string;
}

export interface DemoAirportProfile {
  airport_iata: string;
  flight_type: 'domestic' | 'international';
  curb_to_bag_drop_minutes: number;
  bag_drop_to_security_minutes: number;
  security_to_gate_minutes: number;
  avg_security_wait_minutes: number;
  peak_security_wait_minutes: number;
  min_arrival_before_departure: number;
}

export interface DemoAirline {
  id: string;
  iata_code: string;
  name: string;
}

export interface DemoAirlinePolicy {
  airline_iata: string;
  flight_type: 'domestic' | 'international';
  bag_drop_cutoff_minutes: number;
  boarding_begins_minutes: number;
  gate_close_minutes: number;
  recommended_checkin_minutes: number;
  notes?: string;
}

// Transform seeds into app-ready format
export const airports: DemoAirport[] = airportSeeds.map((a, i) => ({
  id: `airport-${i}`,
  ...a,
}));

export const airportProfiles: DemoAirportProfile[] = airportProfileSeeds.map((p) => ({
  airport_iata: p.iata_code,
  flight_type: p.flight_type,
  curb_to_bag_drop_minutes: p.curb_to_bag_drop_minutes,
  bag_drop_to_security_minutes: p.bag_drop_to_security_minutes,
  security_to_gate_minutes: p.security_to_gate_minutes,
  avg_security_wait_minutes: p.avg_security_wait_minutes,
  peak_security_wait_minutes: p.peak_security_wait_minutes,
  min_arrival_before_departure: p.min_arrival_before_departure,
}));

export const airlines: DemoAirline[] = airlineSeeds.map((a, i) => ({
  id: `airline-${i}`,
  ...a,
}));

export const airlinePolicies: DemoAirlinePolicy[] = airlinePolicySeeds.map((p) => ({
  airline_iata: p.iata_code,
  flight_type: p.flight_type,
  bag_drop_cutoff_minutes: p.bag_drop_cutoff_minutes,
  boarding_begins_minutes: p.boarding_begins_minutes,
  gate_close_minutes: p.gate_close_minutes,
  recommended_checkin_minutes: p.recommended_checkin_minutes,
  notes: (p as Record<string, unknown>).notes as string | undefined,
}));

export function getAirportByIata(iata: string) {
  return airports.find((a) => a.iata_code === iata);
}

export function getAirportProfile(iata: string, flightType: 'domestic' | 'international') {
  return airportProfiles.find((p) => p.airport_iata === iata && p.flight_type === flightType);
}

export function getAirlineByIata(iata: string) {
  return airlines.find((a) => a.iata_code === iata);
}

export function getAirlinePolicy(iata: string, flightType: 'domestic' | 'international') {
  return airlinePolicies.find((p) => p.airline_iata === iata && p.flight_type === flightType);
}

// Demo circles for display
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split('T')[0];

export const demoCircles = [
  {
    id: 'circle-1',
    creator_name: 'Alice C.',
    airport_iata: 'SEA',
    airport_name: 'Seattle-Tacoma',
    circle_type: 'scheduled' as const,
    visibility: 'public' as const,
    status: 'open' as const,
    target_leave_time: `${tomorrowStr}T11:00:00.000Z`,
    leave_window_start: `${tomorrowStr}T10:30:00.000Z`,
    leave_window_end: `${tomorrowStr}T11:30:00.000Z`,
    max_members: 4,
    current_members: 1,
    estimated_savings_cents: 1500,
    estimated_extra_minutes: 8,
    neighborhood: 'Downtown Seattle',
  },
  {
    id: 'circle-2',
    creator_name: 'Carol K.',
    airport_iata: 'SEA',
    airport_name: 'Seattle-Tacoma',
    circle_type: 'scheduled' as const,
    visibility: 'community' as const,
    status: 'open' as const,
    target_leave_time: `${tomorrowStr}T09:00:00.000Z`,
    leave_window_start: `${tomorrowStr}T08:30:00.000Z`,
    leave_window_end: `${tomorrowStr}T09:30:00.000Z`,
    max_members: 3,
    current_members: 2,
    estimated_savings_cents: 1200,
    estimated_extra_minutes: 5,
    neighborhood: 'U-District',
    community_name: 'UW Huskies',
  },
  {
    id: 'circle-3',
    creator_name: 'Bob M.',
    airport_iata: 'LAX',
    airport_name: 'Los Angeles Intl',
    circle_type: 'leaving_now' as const,
    visibility: 'public' as const,
    status: 'open' as const,
    target_leave_time: new Date(Date.now() + 30 * 60000).toISOString(),
    leave_window_start: new Date(Date.now() + 15 * 60000).toISOString(),
    leave_window_end: new Date(Date.now() + 45 * 60000).toISOString(),
    max_members: 3,
    current_members: 1,
    estimated_savings_cents: 2200,
    estimated_extra_minutes: 12,
    neighborhood: 'Santa Monica',
  },
];
