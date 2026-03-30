/**
 * API client for the Boarding backend.
 *
 * In demo mode, points at the Next.js web app.
 * In production, can point at a dedicated API server.
 */
import { config } from '@boarding/config';

const BASE_URL = config.app.url;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }

  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────────────

export async function login(email: string) {
  return request<{ session: { user_id: string; display_name: string; email: string }; profile: any }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function logout() {
  return request('/api/auth/logout', { method: 'POST' });
}

export async function getSession() {
  return request<{ session: { user_id: string; display_name: string; email: string } | null }>('/api/auth/session');
}

export async function getProfile() {
  return request<{ profile: any }>('/api/auth/profile');
}

export async function updateProfile(updates: Record<string, unknown>) {
  return request<{ profile: any }>('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

// ─── Trips & Recommendations ────────────────────────────────────────

export interface RecommendationRequest {
  trip_id: string;
  airline_iata: string;
  airline_name: string;
  flight_number: string;
  departure_date: string;
  departure_time: string;
  airport_iata: string;
  flight_type: string;
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
  ride_mode: string;
  risk_profile: string;
  airport_rules: {
    curb_to_bag_drop_minutes: number;
    bag_drop_to_security_minutes: number;
    security_to_gate_minutes: number;
    avg_security_wait_minutes: number;
    peak_security_wait_minutes: number;
    min_arrival_before_departure: number;
  };
  airline_rules: {
    bag_drop_cutoff_minutes: number;
    boarding_begins_minutes: number;
    gate_close_minutes: number;
  };
}

export async function computeRecommendation(input: RecommendationRequest) {
  return request<{ recommendation: any }>('/api/trips/recommendation', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function resolveFlight(airlineIata: string, flightNumber: string, date: string) {
  return request<{ found: boolean; flight?: any }>('/api/trips/resolve-flight', {
    method: 'POST',
    body: JSON.stringify({ airline_iata: airlineIata, flight_number: flightNumber, departure_date: date }),
  });
}

/**
 * Look up a flight by IATA flight number (e.g. "AA1234").
 * Optionally provide a date; if omitted, returns the next upcoming flight.
 */
export async function lookupFlight(flightIata: string, departureDate?: string) {
  return request<{ found: boolean; flight?: any }>('/api/trips/lookup-flight', {
    method: 'POST',
    body: JSON.stringify({ flight_iata: flightIata, departure_date: departureDate }),
  });
}

export async function resolveLocation(params: { mode: string; query?: string; airport_iata?: string; lat?: number; lng?: number; label?: string }) {
  return request<{ location: any }>('/api/trips/resolve-location', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// ─── Store (demo persistence) ───────────────────────────────────────

export async function getStore() {
  return request<any>('/api/store');
}

// ─── Dining ─────────────────────────────────────────────────────────

export async function getAirportDining(iata: string) {
  return request<{ restaurants: any[] }>(`/api/airport/${iata}/dining`);
}

// ─── Wait Time Reports ──────────────────────────────────────────────

export async function reportWaitTime(airportIata: string, minutes: number, terminal?: string) {
  return request('/api/wait-times/report', {
    method: 'POST',
    body: JSON.stringify({ airport_iata: airportIata, minutes, terminal }),
  });
}

// ─── Boarding Pass ──────────────────────────────────────────────────

export async function parseBoardingPass(barcodeData: string) {
  return request<{ parsed: any }>('/api/boarding-pass/parse', {
    method: 'POST',
    body: JSON.stringify({ barcode_data: barcodeData }),
  });
}
