// Repository interfaces for all persisted data access.
// Two adapters: DemoAdapter (in-memory, localStorage) and SupabaseAdapter.

import type { Recommendation, TimeBreakdownItem, ConfidenceLevel } from '@boarding/domain';

// ─── Airport & Airline Rules ──────────────────────────────────────────

export interface AirportRule {
  iata_code: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  timezone: string;
}

export interface AirportProfile {
  airport_iata: string;
  flight_type: 'domestic' | 'international';
  curb_to_bag_drop_minutes: number;
  bag_drop_to_security_minutes: number;
  security_to_gate_minutes: number;
  avg_security_wait_minutes: number;
  peak_security_wait_minutes: number;
  min_arrival_before_departure: number;
}

export interface AirlineRule {
  iata_code: string;
  name: string;
}

export interface AirlinePolicy {
  airline_iata: string;
  flight_type: 'domestic' | 'international';
  bag_drop_cutoff_minutes: number;
  boarding_begins_minutes: number;
  gate_close_minutes: number;
  recommended_checkin_minutes: number;
  notes?: string;
}

// ─── Trips & Recommendations ──────────────────────────────────────────

export interface StoredTrip {
  id: string;
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
  created_at: string;
}

export interface StoredRecommendation {
  id: string;
  trip_id: string;
  recommended_leave_time: string;
  leave_window_start: string;
  leave_window_end: string;
  recommended_curb_arrival: string;
  latest_safe_bag_drop: string | null;
  latest_safe_security_entry: string;
  latest_safe_gate_arrival: string;
  confidence: ConfidenceLevel;
  confidence_score: number;
  breakdown: TimeBreakdownItem[];
  total_minutes: number;
  summary: string;
  warnings: string[];
  computed_at: string;
  // Denormalized trip info for share page
  airline_name: string;
  flight_number: string;
  airport_iata: string;
  departure_time: string;
  departure_date: string;
}

// ─── Circles ──────────────────────────────────────────────────────────

export interface StoredCircle {
  id: string;
  creator_name: string;
  airport_iata: string;
  airport_name: string;
  circle_type: 'scheduled' | 'leaving_now';
  visibility: 'public' | 'private' | 'community';
  status: 'open' | 'full' | 'departed' | 'expired' | 'cancelled';
  target_leave_time: string;
  leave_window_start: string;
  leave_window_end: string;
  max_members: number;
  current_members: number;
  estimated_savings_cents: number;
  estimated_extra_minutes: number;
  neighborhood: string;
  community_name?: string;
  origin_lat: number;
  origin_lng: number;
  created_at: string;
}

export interface StoredMessage {
  id: string;
  circle_id: string;
  sender: string;
  content: string;
  time: string;
  type: 'text' | 'system';
  created_at: string;
}

export interface StoredCircleMember {
  circle_id: string;
  user_name: string;
  role: 'creator' | 'member';
  status: 'active' | 'pending' | 'left';
  joined_at: string;
}

// ─── Reports ──────────────────────────────────────────────────────────

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface StoredReport {
  id: string;
  reporter: string;
  reported_user: string | null;
  circle_id: string | null;
  reason: string;
  details: string;
  status: ReportStatus;
  created_at: string;
}

// ─── Repository Interfaces ────────────────────────────────────────────

export interface AdminRulesRepository {
  getAirports(): AirportRule[];
  getAirport(iata: string): AirportRule | undefined;
  getAirportProfile(iata: string, flightType: 'domestic' | 'international'): AirportProfile | undefined;
  getAirportProfiles(): AirportProfile[];
  updateAirportProfile(iata: string, flightType: string, updates: Partial<AirportProfile>): void;

  getAirlines(): AirlineRule[];
  getAirline(iata: string): AirlineRule | undefined;
  getAirlinePolicy(iata: string, flightType: 'domestic' | 'international'): AirlinePolicy | undefined;
  getAirlinePolicies(): AirlinePolicy[];
  updateAirlinePolicy(iata: string, flightType: string, updates: Partial<AirlinePolicy>): void;
}

export interface RecommendationRepository {
  save(rec: StoredRecommendation): void;
  getById(id: string): StoredRecommendation | undefined;
  getByTripId(tripId: string): StoredRecommendation | undefined;
  getAll(): StoredRecommendation[];
}

export interface TripRepository {
  save(trip: StoredTrip): void;
  getById(id: string): StoredTrip | undefined;
}

export interface CircleRepository {
  getAll(): StoredCircle[];
  getById(id: string): StoredCircle | undefined;
  create(circle: StoredCircle): void;
  join(circleId: string, member: StoredCircleMember): void;
  leave(circleId: string, userName: string): void;
  getMembers(circleId: string): StoredCircleMember[];
}

export interface MessageRepository {
  getByCircleId(circleId: string): StoredMessage[];
  send(msg: StoredMessage): void;
}

export interface ReportRepository {
  getAll(): StoredReport[];
  create(report: StoredReport): void;
  updateStatus(id: string, status: ReportStatus): void;
}

export interface ShareRepository {
  getRecommendation(id: string): StoredRecommendation | undefined;
}

// ─── Profiles & Sessions ─────────────────────────────────────────────

export interface StoredProfile {
  id: string;
  display_name: string;
  email: string;
  phone: string;
  has_tsa_precheck: boolean;
  has_clear: boolean;
  default_risk_profile: 'conservative' | 'balanced' | 'aggressive';
  default_ride_mode: 'rideshare' | 'friend_dropoff' | 'self_drive' | 'transit';
  completed_trips: number;
  email_verified: boolean;
  created_at: string;
}

export interface DemoSession {
  user_id: string;
  display_name: string;
  email: string;
}

export interface ProfileRepository {
  getById(id: string): StoredProfile | undefined;
  getByEmail(email: string): StoredProfile | undefined;
  save(profile: StoredProfile): void;
}
