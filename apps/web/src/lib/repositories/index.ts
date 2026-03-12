/**
 * Repository factory.
 * Returns demo adapters by default.
 * Supabase mode is an explicit opt-in so local demo persistence does not
 * accidentally switch to the not-yet-wired adapter just because env vars exist.
 */

import {
  DemoAdminRulesRepository,
  DemoTripRepository,
  DemoRecommendationRepository,
  DemoCircleRepository,
  DemoMessageRepository,
  DemoReportRepository,
  DemoShareRepository,
} from './demo-adapter';
import {
  SupabaseAdminRulesRepository,
  SupabaseTripRepository,
  SupabaseRecommendationRepository,
  SupabaseCircleRepository,
  SupabaseMessageRepository,
  SupabaseReportRepository,
  SupabaseShareRepository,
} from './supabase-adapter';
import type {
  AdminRulesRepository,
  TripRepository,
  RecommendationRepository,
  CircleRepository,
  MessageRepository,
  ReportRepository,
  ShareRepository,
} from './types';

export type {
  AdminRulesRepository,
  TripRepository,
  RecommendationRepository,
  CircleRepository,
  MessageRepository,
  ReportRepository,
  ShareRepository,
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
  ReportStatus,
} from './types';

// Singletons — survive across navigation
let _adminRules: AdminRulesRepository | null = null;
let _trips: TripRepository | null = null;
let _recommendations: RecommendationRepository | null = null;
let _circles: CircleRepository | null = null;
let _messages: MessageRepository | null = null;
let _reports: ReportRepository | null = null;
let _share: ShareRepository | null = null;

function isSupabaseModeEnabled() {
  return process.env.NEXT_PUBLIC_USE_SUPABASE === 'true';
}

export function getAdminRulesRepo(): AdminRulesRepository {
  if (!_adminRules) _adminRules = isSupabaseModeEnabled() ? new SupabaseAdminRulesRepository() : new DemoAdminRulesRepository();
  return _adminRules;
}

export function getTripRepo(): TripRepository {
  if (!_trips) _trips = isSupabaseModeEnabled() ? new SupabaseTripRepository() : new DemoTripRepository();
  return _trips;
}

export function getRecommendationRepo(): RecommendationRepository {
  if (!_recommendations) _recommendations = isSupabaseModeEnabled() ? new SupabaseRecommendationRepository() : new DemoRecommendationRepository();
  return _recommendations;
}

export function getCircleRepo(): CircleRepository {
  if (!_circles) _circles = isSupabaseModeEnabled() ? new SupabaseCircleRepository() : new DemoCircleRepository();
  return _circles;
}

export function getMessageRepo(): MessageRepository {
  if (!_messages) _messages = isSupabaseModeEnabled() ? new SupabaseMessageRepository() : new DemoMessageRepository();
  return _messages;
}

export function getReportRepo(): ReportRepository {
  if (!_reports) _reports = isSupabaseModeEnabled() ? new SupabaseReportRepository() : new DemoReportRepository();
  return _reports;
}

export function getShareRepo(): ShareRepository {
  if (!_share) _share = isSupabaseModeEnabled() ? new SupabaseShareRepository() : new DemoShareRepository();
  return _share;
}

export function __resetRepositoriesForTests() {
  _adminRules = null;
  _trips = null;
  _recommendations = null;
  _circles = null;
  _messages = null;
  _reports = null;
  _share = null;
}
