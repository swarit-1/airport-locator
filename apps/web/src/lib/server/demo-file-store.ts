/**
 * Server-side file-backed demo store.
 *
 * Reads and writes a JSON file so that server components, API routes,
 * and SSR can access demo data without localStorage.
 *
 * This module uses `fs` and MUST only be imported in server contexts
 * (API routes, server components, server actions).
 */

import fs from 'node:fs';
import path from 'node:path';
import { airportSeeds, airportProfileSeeds, airlineSeeds, airlinePolicySeeds } from '@boarding/db';
import type {
  AirportRule,
  AirportProfile,
  AirlineRule,
  AirlinePolicy,
  StoredTrip,
  StoredRecommendation,
  StoredCircle,
  StoredCircleMember,
  StoredMessage,
  StoredReport,
  StoredProfile,
  ReportStatus,
} from '../repositories/types';

// ─── Types ───────────────────────────────────────────────────────────

export interface SerializableStore {
  airports: AirportRule[];
  airportProfiles: AirportProfile[];
  airlines: AirlineRule[];
  airlinePolicies: AirlinePolicy[];
  trips: Array<[string, StoredTrip]>;
  recommendations: Array<[string, StoredRecommendation]>;
  circles: Array<[string, StoredCircle]>;
  members: StoredCircleMember[];
  messages: StoredMessage[];
  reports: StoredReport[];
  profiles: Array<[string, StoredProfile]>;
}

// ─── Seed helpers ────────────────────────────────────────────────────

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

function buildSeedStore(): SerializableStore {
  const circles: StoredCircle[] = [
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

  return {
    airports: seedAirports(),
    airportProfiles: seedAirportProfiles(),
    airlines: seedAirlines(),
    airlinePolicies: seedAirlinePolicies(),
    trips: [],
    recommendations: [],
    circles: circles.map((c) => [c.id, c]),
    members: [
      { circle_id: 'circle-demo-1', user_name: 'Alice C.', role: 'creator', status: 'active', joined_at: FIXED_NOW },
      { circle_id: 'circle-demo-2', user_name: 'Carol K.', role: 'creator', status: 'active', joined_at: FIXED_NOW },
      { circle_id: 'circle-demo-2', user_name: 'David L.', role: 'member', status: 'active', joined_at: FIXED_NOW },
      { circle_id: 'circle-demo-3', user_name: 'Bob M.', role: 'creator', status: 'active', joined_at: FIXED_NOW },
    ],
    messages: [
      { id: 'msg-1', circle_id: 'circle-demo-1', sender: 'System', content: 'Alice C. created this circle', time: '10:00 AM', type: 'system', created_at: FIXED_ONE_HOUR_AGO },
      { id: 'msg-2', circle_id: 'circle-demo-1', sender: 'Alice C.', content: 'Heading to SEA tomorrow around 11am from downtown. Anyone want to share a ride?', time: '10:02 AM', type: 'text', created_at: FIXED_ONE_HOUR_AGO },
      { id: 'msg-3', circle_id: 'circle-demo-2', sender: 'System', content: 'Carol K. created this circle', time: '9:00 AM', type: 'system', created_at: FIXED_TWO_HOURS_AGO },
      { id: 'msg-4', circle_id: 'circle-demo-2', sender: 'Carol K.', content: 'UW folks heading to SEA — happy to split an Uber from campus!', time: '9:05 AM', type: 'text', created_at: FIXED_TWO_HOURS_AGO },
    ],
    reports: [
      { id: 'report-1', reporter: 'alice@demo.boarding.app', reported_user: 'suspicious@example.com', circle_id: null, reason: 'spam', details: 'Spam messages in circle chat.', status: 'pending', created_at: FIXED_ONE_HOUR_AGO },
      { id: 'report-2', reporter: 'bob@demo.boarding.app', reported_user: null, circle_id: 'circle-demo-3', reason: 'inappropriate', details: 'Circle description contains inappropriate language.', status: 'pending', created_at: FIXED_TWO_HOURS_AGO },
    ],
    profiles: [],
  };
}

// ─── File I/O ────────────────────────────────────────────────────────

function getStorePath(): string {
  // On Vercel, process.cwd() is read-only — use /tmp instead.
  const base = process.env.VERCEL ? '/tmp' : process.cwd();
  return path.resolve(base, '.demo-data', 'store.json');
}

function ensureDir() {
  const dir = path.dirname(getStorePath());
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readStore(): SerializableStore {
  const filePath = getStorePath();
  if (!fs.existsSync(filePath)) {
    const seed = buildSeedStore();
    ensureDir();
    fs.writeFileSync(filePath, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as SerializableStore;
  } catch {
    const seed = buildSeedStore();
    ensureDir();
    fs.writeFileSync(filePath, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
}

export function writeStore(store: SerializableStore): void {
  ensureDir();
  fs.writeFileSync(getStorePath(), JSON.stringify(store, null, 2), 'utf-8');
}

export function updateStore(mutator: (store: SerializableStore) => void): SerializableStore {
  const store = readStore();
  mutator(store);
  writeStore(store);
  return store;
}

// ─── Mutation helpers ────────────────────────────────────────────────
// These mirror the DemoAdapter methods but operate on the file store.

export function saveTrip(trip: StoredTrip): void {
  updateStore((s) => {
    const existing = s.trips.findIndex(([id]) => id === trip.id);
    if (existing >= 0) {
      s.trips[existing] = [trip.id, trip];
    } else {
      s.trips.push([trip.id, trip]);
    }
  });
}

export function saveRecommendation(rec: StoredRecommendation): void {
  updateStore((s) => {
    const existing = s.recommendations.findIndex(([id]) => id === rec.id);
    if (existing >= 0) {
      s.recommendations[existing] = [rec.id, rec];
    } else {
      s.recommendations.push([rec.id, rec]);
    }
  });
}

export function createCircle(circle: StoredCircle): void {
  updateStore((s) => {
    s.circles.push([circle.id, circle]);
    s.members.push({
      circle_id: circle.id,
      user_name: circle.creator_name,
      role: 'creator',
      status: 'active',
      joined_at: circle.created_at,
    });
    s.messages.push({
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

export function joinCircle(circleId: string, member: StoredCircleMember): void {
  updateStore((s) => {
    const existing = s.members.find((m) => m.circle_id === circleId && m.user_name === member.user_name);
    if (existing) {
      existing.status = 'active';
      existing.joined_at = member.joined_at;
    } else {
      s.members.push(member);
    }

    const circleEntry = s.circles.find(([id]) => id === circleId);
    if (circleEntry) {
      const circle = circleEntry[1];
      circle.current_members = s.members.filter((m) => m.circle_id === circleId && m.status === 'active').length;
      circle.status = circle.current_members >= circle.max_members ? 'full' : 'open';
    }

    s.messages.push({
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

export function leaveCircle(circleId: string, userName: string): void {
  updateStore((s) => {
    s.members = s.members.map((m) =>
      m.circle_id === circleId && m.user_name === userName ? { ...m, status: 'left' as const } : m,
    );
    const circleEntry = s.circles.find(([id]) => id === circleId);
    if (circleEntry) {
      const circle = circleEntry[1];
      circle.current_members = s.members.filter((m) => m.circle_id === circleId && m.status === 'active').length;
      circle.status = circle.current_members >= circle.max_members ? 'full' : 'open';
    }
    s.messages.push({
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

export function sendMessage(msg: StoredMessage): void {
  updateStore((s) => {
    s.messages.push(msg);
  });
}

export function createReport(report: StoredReport): void {
  updateStore((s) => {
    s.reports.push(report);
  });
}

export function updateReportStatus(id: string, status: ReportStatus): void {
  updateStore((s) => {
    s.reports = s.reports.map((r) => (r.id === id ? { ...r, status } : r));
  });
}

export function updateAirportProfile(iata: string, flightType: string, updates: Partial<AirportProfile>): void {
  updateStore((s) => {
    s.airportProfiles = s.airportProfiles.map((p) =>
      p.airport_iata === iata && p.flight_type === flightType ? { ...p, ...updates } : p,
    );
  });
}

export function updateAirlinePolicy(iata: string, flightType: string, updates: Partial<AirlinePolicy>): void {
  updateStore((s) => {
    s.airlinePolicies = s.airlinePolicies.map((p) =>
      p.airline_iata === iata && p.flight_type === flightType ? { ...p, ...updates } : p,
    );
  });
}

// ─── Read helpers ────────────────────────────────────────────────────

export function getCircleById(id: string): StoredCircle | undefined {
  const store = readStore();
  const entry = store.circles.find(([cid]) => cid === id);
  return entry?.[1];
}

export function getCircleMembers(circleId: string): StoredCircleMember[] {
  const store = readStore();
  return store.members.filter((m) => m.circle_id === circleId && m.status === 'active');
}

export function getCircleMessages(circleId: string): StoredMessage[] {
  const store = readStore();
  return store.messages
    .filter((m) => m.circle_id === circleId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export function getRecommendationById(id: string): StoredRecommendation | undefined {
  const store = readStore();
  const entry = store.recommendations.find(([rid]) => rid === id);
  return entry?.[1];
}

export function getAllCircles(): StoredCircle[] {
  const store = readStore();
  return store.circles.map(([, c]) => c);
}

// ─── Profile helpers ─────────────────────────────────────────────────

export function getProfileById(id: string): StoredProfile | undefined {
  const store = readStore();
  const entry = store.profiles?.find(([pid]) => pid === id);
  return entry?.[1];
}

export function getProfileByEmail(email: string): StoredProfile | undefined {
  const store = readStore();
  const entry = store.profiles?.find(([, p]) => p.email === email);
  return entry?.[1];
}

export function saveProfile(profile: StoredProfile): void {
  updateStore((s) => {
    if (!s.profiles) s.profiles = [];
    const idx = s.profiles.findIndex(([pid]) => pid === profile.id);
    if (idx >= 0) {
      s.profiles[idx] = [profile.id, profile];
    } else {
      s.profiles.push([profile.id, profile]);
    }
  });
}

export function resetStore(): void {
  const filePath = getStorePath();
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
