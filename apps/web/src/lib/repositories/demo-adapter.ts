/**
 * Demo adapter: deterministic seed data with browser-local persistence.
 * Persists across navigation and refresh in local development.
 */

import { airportSeeds, airportProfileSeeds, airlineSeeds, airlinePolicySeeds } from '@gateshare/db';
import type {
  AdminRulesRepository,
  AirportRule,
  AirportProfile,
  AirlineRule,
  AirlinePolicy,
  RecommendationRepository,
  StoredRecommendation,
  TripRepository,
  StoredTrip,
  CircleRepository,
  StoredCircle,
  StoredCircleMember,
  MessageRepository,
  StoredMessage,
  ReportRepository,
  StoredReport,
  ReportStatus,
  ShareRepository,
} from './types';

// ─── Seed Helpers ─────────────────────────────────────────────────────

function seedAirports(): AirportRule[] {
  return airportSeeds.map((a) => ({ ...a }));
}

function seedAirportProfiles(): AirportProfile[] {
  return airportProfileSeeds.map((p) => ({
    airport_iata: p.iata_code,
    flight_type: p.flight_type,
    curb_to_bag_drop_minutes: p.curb_to_bag_drop_minutes,
    bag_drop_to_security_minutes: p.bag_drop_to_security_minutes,
    security_to_gate_minutes: p.security_to_gate_minutes,
    avg_security_wait_minutes: p.avg_security_wait_minutes,
    peak_security_wait_minutes: p.peak_security_wait_minutes,
    min_arrival_before_departure: p.min_arrival_before_departure,
  }));
}

function seedAirlines(): AirlineRule[] {
  return airlineSeeds.map((a) => ({ ...a }));
}

function seedAirlinePolicies(): AirlinePolicy[] {
  return airlinePolicySeeds.map((p) => ({
    airline_iata: p.iata_code,
    flight_type: p.flight_type,
    bag_drop_cutoff_minutes: p.bag_drop_cutoff_minutes,
    boarding_begins_minutes: p.boarding_begins_minutes,
    gate_close_minutes: p.gate_close_minutes,
    recommended_checkin_minutes: p.recommended_checkin_minutes,
    notes: (p as Record<string, unknown>).notes as string | undefined,
  }));
}

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tStr = tomorrow.toISOString().split('T')[0]!;
const FIXED_NOW = '2026-03-12T18:00:00.000Z';
const FIXED_ONE_HOUR_AGO = '2026-03-12T17:00:00.000Z';
const FIXED_TWO_HOURS_AGO = '2026-03-12T16:00:00.000Z';
const FIXED_LEAVING_NOW_TARGET = '2026-03-13T18:30:00.000Z';
const FIXED_LEAVING_NOW_START = '2026-03-13T18:15:00.000Z';
const FIXED_LEAVING_NOW_END = '2026-03-13T18:45:00.000Z';

function seedCircles(): StoredCircle[] {
  return [
    {
      id: 'circle-demo-1',
      creator_name: 'Alice C.',
      airport_iata: 'SEA',
      airport_name: 'Seattle-Tacoma',
      circle_type: 'scheduled',
      visibility: 'public',
      status: 'open',
      target_leave_time: `${tStr}T19:00:00.000Z`,
      leave_window_start: `${tStr}T18:30:00.000Z`,
      leave_window_end: `${tStr}T19:30:00.000Z`,
      max_members: 4,
      current_members: 1,
      estimated_savings_cents: 1500,
      estimated_extra_minutes: 8,
      neighborhood: 'Downtown Seattle',
      origin_lat: 47.6062,
      origin_lng: -122.3321,
      created_at: FIXED_NOW,
    },
    {
      id: 'circle-demo-2',
      creator_name: 'Carol K.',
      airport_iata: 'SEA',
      airport_name: 'Seattle-Tacoma',
      circle_type: 'scheduled',
      visibility: 'community',
      status: 'open',
      target_leave_time: `${tStr}T17:00:00.000Z`,
      leave_window_start: `${tStr}T16:30:00.000Z`,
      leave_window_end: `${tStr}T17:30:00.000Z`,
      max_members: 3,
      current_members: 2,
      estimated_savings_cents: 1200,
      estimated_extra_minutes: 5,
      neighborhood: 'U-District',
      community_name: 'UW Huskies',
      origin_lat: 47.6553,
      origin_lng: -122.3035,
      created_at: FIXED_NOW,
    },
    {
      id: 'circle-demo-3',
      creator_name: 'Bob M.',
      airport_iata: 'LAX',
      airport_name: 'Los Angeles Intl',
      circle_type: 'leaving_now',
      visibility: 'public',
      status: 'open',
      target_leave_time: FIXED_LEAVING_NOW_TARGET,
      leave_window_start: FIXED_LEAVING_NOW_START,
      leave_window_end: FIXED_LEAVING_NOW_END,
      max_members: 3,
      current_members: 1,
      estimated_savings_cents: 2200,
      estimated_extra_minutes: 12,
      neighborhood: 'Santa Monica',
      origin_lat: 34.0195,
      origin_lng: -118.4912,
      created_at: FIXED_NOW,
    },
  ];
}

function seedMessages(): StoredMessage[] {
  return [
    { id: 'msg-1', circle_id: 'circle-demo-1', sender: 'System', content: 'Alice C. created this circle', time: '10:00 AM', type: 'system', created_at: FIXED_ONE_HOUR_AGO },
    { id: 'msg-2', circle_id: 'circle-demo-1', sender: 'Alice C.', content: "Heading to SEA tomorrow around 11am from downtown. Anyone want to share a ride?", time: '10:02 AM', type: 'text', created_at: FIXED_ONE_HOUR_AGO },
    { id: 'msg-3', circle_id: 'circle-demo-2', sender: 'System', content: 'Carol K. created this circle', time: '9:00 AM', type: 'system', created_at: FIXED_TWO_HOURS_AGO },
    { id: 'msg-4', circle_id: 'circle-demo-2', sender: 'Carol K.', content: 'UW folks heading to SEA — happy to split an Uber from campus!', time: '9:05 AM', type: 'text', created_at: FIXED_TWO_HOURS_AGO },
  ];
}

function seedReports(): StoredReport[] {
  return [
    { id: 'report-1', reporter: 'alice@demo.gateshare.app', reported_user: 'suspicious@example.com', circle_id: null, reason: 'spam', details: 'Spam messages in circle chat.', status: 'pending', created_at: FIXED_ONE_HOUR_AGO },
    { id: 'report-2', reporter: 'bob@demo.gateshare.app', reported_user: null, circle_id: 'circle-demo-3', reason: 'inappropriate', details: 'Circle description contains inappropriate language.', status: 'pending', created_at: FIXED_TWO_HOURS_AGO },
  ];
}

function seedMembers(): StoredCircleMember[] {
  return [
    { circle_id: 'circle-demo-1', user_name: 'Alice C.', role: 'creator', status: 'active', joined_at: FIXED_NOW },
    { circle_id: 'circle-demo-2', user_name: 'Carol K.', role: 'creator', status: 'active', joined_at: FIXED_NOW },
    { circle_id: 'circle-demo-2', user_name: 'David L.', role: 'member', status: 'active', joined_at: FIXED_NOW },
    { circle_id: 'circle-demo-3', user_name: 'Bob M.', role: 'creator', status: 'active', joined_at: FIXED_NOW },
  ];
}

// ─── In-Memory Store (Singleton) ──────────────────────────────────────

class Store {
  airports: AirportRule[];
  airportProfiles: AirportProfile[];
  airlines: AirlineRule[];
  airlinePolicies: AirlinePolicy[];
  trips: Map<string, StoredTrip> = new Map();
  recommendations: Map<string, StoredRecommendation> = new Map();
  circles: Map<string, StoredCircle>;
  members: StoredCircleMember[];
  messages: StoredMessage[];
  reports: StoredReport[];

  constructor() {
    this.airports = seedAirports();
    this.airportProfiles = seedAirportProfiles();
    this.airlines = seedAirlines();
    this.airlinePolicies = seedAirlinePolicies();
    const circles = seedCircles();
    this.circles = new Map(circles.map((c) => [c.id, c]));
    this.members = seedMembers();
    this.messages = seedMessages();
    this.reports = seedReports();
  }
}

const STORAGE_KEY = 'gateshare-demo-store-v1';

function toSerializable(store: Store) {
  return {
    airports: store.airports,
    airportProfiles: store.airportProfiles,
    airlines: store.airlines,
    airlinePolicies: store.airlinePolicies,
    trips: Array.from(store.trips.entries()),
    recommendations: Array.from(store.recommendations.entries()),
    circles: Array.from(store.circles.entries()),
    members: store.members,
    messages: store.messages,
    reports: store.reports,
  };
}

function hydrateStore(raw: ReturnType<typeof toSerializable>) {
  const store = new Store();
  store.airports = raw.airports;
  store.airportProfiles = raw.airportProfiles;
  store.airlines = raw.airlines;
  store.airlinePolicies = raw.airlinePolicies;
  store.trips = new Map(raw.trips);
  store.recommendations = new Map(raw.recommendations);
  store.circles = new Map(raw.circles);
  store.members = raw.members;
  store.messages = raw.messages;
  store.reports = raw.reports;
  return store;
}

function loadPersistedStore(): Store | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return hydrateStore(JSON.parse(raw));
  } catch {
    return null;
  }
}

function persistStore(store: Store) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSerializable(store)));
}

let _store: Store | null = null;
function getStore(): Store {
  if (!_store) {
    _store = loadPersistedStore() ?? new Store();
    persistStore(_store);
  }
  return _store;
}

function updateStore(mutator: (store: Store) => void) {
  const store = getStore();
  mutator(store);
  persistStore(store);
}

// ─── Admin Rules Repository ───────────────────────────────────────────

export class DemoAdminRulesRepository implements AdminRulesRepository {
  getAirports() { return getStore().airports; }
  getAirport(iata: string) { return getStore().airports.find((a) => a.iata_code === iata); }
  getAirportProfile(iata: string, flightType: 'domestic' | 'international') {
    return getStore().airportProfiles.find((p) => p.airport_iata === iata && p.flight_type === flightType);
  }
  getAirportProfiles() { return getStore().airportProfiles; }
  updateAirportProfile(iata: string, flightType: string, updates: Partial<AirportProfile>) {
    updateStore((store) => {
      store.airportProfiles = store.airportProfiles.map((p) =>
        p.airport_iata === iata && p.flight_type === flightType ? { ...p, ...updates } : p,
      );
    });
  }

  getAirlines() { return getStore().airlines; }
  getAirline(iata: string) { return getStore().airlines.find((a) => a.iata_code === iata); }
  getAirlinePolicy(iata: string, flightType: 'domestic' | 'international') {
    return getStore().airlinePolicies.find((p) => p.airline_iata === iata && p.flight_type === flightType);
  }
  getAirlinePolicies() { return getStore().airlinePolicies; }
  updateAirlinePolicy(iata: string, flightType: string, updates: Partial<AirlinePolicy>) {
    updateStore((store) => {
      store.airlinePolicies = store.airlinePolicies.map((p) =>
        p.airline_iata === iata && p.flight_type === flightType ? { ...p, ...updates } : p,
      );
    });
  }
}

// ─── Trip Repository ──────────────────────────────────────────────────

export class DemoTripRepository implements TripRepository {
  save(trip: StoredTrip) {
    updateStore((store) => {
      store.trips.set(trip.id, trip);
    });
  }
  getById(id: string) { return getStore().trips.get(id); }
}

// ─── Recommendation Repository ────────────────────────────────────────

export class DemoRecommendationRepository implements RecommendationRepository {
  save(rec: StoredRecommendation) {
    updateStore((store) => {
      store.recommendations.set(rec.id, rec);
    });
  }
  getById(id: string) { return getStore().recommendations.get(id); }
  getByTripId(tripId: string) {
    for (const rec of getStore().recommendations.values()) {
      if (rec.trip_id === tripId) return rec;
    }
    return undefined;
  }
  getAll() { return Array.from(getStore().recommendations.values()); }
}

// ─── Circle Repository ────────────────────────────────────────────────

export class DemoCircleRepository implements CircleRepository {
  getAll() { return Array.from(getStore().circles.values()); }
  getById(id: string) { return getStore().circles.get(id); }
  create(circle: StoredCircle) {
    updateStore((store) => {
      store.circles.set(circle.id, circle);
      store.members.push({
        circle_id: circle.id,
        user_name: circle.creator_name,
        role: 'creator',
        status: 'active',
        joined_at: circle.created_at,
      });
      store.messages.push({
        id: `msg-${Date.now()}`,
        circle_id: circle.id,
        sender: 'System',
        content: `${circle.creator_name} created this circle`,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        type: 'system',
        created_at: new Date().toISOString(),
      });
    });
  }
  join(circleId: string, member: StoredCircleMember) {
    updateStore((store) => {
      const existing = store.members.find((m) => m.circle_id === circleId && m.user_name === member.user_name);
      if (existing) {
        existing.status = 'active';
        existing.joined_at = member.joined_at;
      } else {
        store.members.push(member);
      }

      const circle = store.circles.get(circleId);
      if (circle) {
        circle.current_members = store.members.filter((m) => m.circle_id === circleId && m.status === 'active').length;
        circle.status = circle.current_members >= circle.max_members ? 'full' : 'open';
      }

      store.messages.push({
        id: `msg-${Date.now()}`,
        circle_id: circleId,
        sender: 'System',
        content: `${member.user_name} joined the circle`,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        type: 'system',
        created_at: new Date().toISOString(),
      });
    });
  }
  leave(circleId: string, userName: string) {
    updateStore((store) => {
      store.members = store.members.map((m) =>
        m.circle_id === circleId && m.user_name === userName ? { ...m, status: 'left' as const } : m,
      );
      const circle = store.circles.get(circleId);
      if (circle) {
        circle.current_members = store.members.filter((m) => m.circle_id === circleId && m.status === 'active').length;
        circle.status = circle.current_members >= circle.max_members ? 'full' : 'open';
      }
      store.messages.push({
        id: `msg-${Date.now()}`,
        circle_id: circleId,
        sender: 'System',
        content: `${userName} left the circle`,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        type: 'system',
        created_at: new Date().toISOString(),
      });
    });
  }
  getMembers(circleId: string) {
    return getStore().members.filter((m) => m.circle_id === circleId && m.status === 'active');
  }
}

// ─── Message Repository ───────────────────────────────────────────────

export class DemoMessageRepository implements MessageRepository {
  getByCircleId(circleId: string) {
    return getStore().messages
      .filter((m) => m.circle_id === circleId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
  send(msg: StoredMessage) {
    updateStore((store) => {
      store.messages.push(msg);
    });
  }
}

// ─── Report Repository ────────────────────────────────────────────────

export class DemoReportRepository implements ReportRepository {
  getAll() { return getStore().reports; }
  create(report: StoredReport) {
    updateStore((store) => {
      store.reports.push(report);
    });
  }
  updateStatus(id: string, status: ReportStatus) {
    updateStore((store) => {
      store.reports = store.reports.map((r) => (r.id === id ? { ...r, status } : r));
    });
  }
}

// ─── Share Repository ─────────────────────────────────────────────────

export class DemoShareRepository implements ShareRepository {
  getRecommendation(id: string) {
    return getStore().recommendations.get(id);
  }
}
