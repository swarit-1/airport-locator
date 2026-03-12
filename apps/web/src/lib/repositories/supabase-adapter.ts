import type {
  AdminRulesRepository,
  RecommendationRepository,
  TripRepository,
  CircleRepository,
  MessageRepository,
  ReportRepository,
  ShareRepository,
  AirportProfile,
  AirlinePolicy,
  StoredRecommendation,
  StoredTrip,
  StoredCircle,
  StoredCircleMember,
  StoredMessage,
  StoredReport,
  ReportStatus,
} from './types';

function notImplemented(method: string): never {
  throw new Error(`Supabase adapter is not wired for ${method} yet. Use demo mode locally.`);
}

export class SupabaseAdminRulesRepository implements AdminRulesRepository {
  getAirports() { return notImplemented('getAirports'); }
  getAirport() { return notImplemented('getAirport'); }
  getAirportProfile() { return notImplemented('getAirportProfile'); }
  getAirportProfiles() { return notImplemented('getAirportProfiles'); }
  updateAirportProfile(_iata: string, _flightType: string, _updates: Partial<AirportProfile>) {
    return notImplemented('updateAirportProfile');
  }
  getAirlines() { return notImplemented('getAirlines'); }
  getAirline() { return notImplemented('getAirline'); }
  getAirlinePolicy() { return notImplemented('getAirlinePolicy'); }
  getAirlinePolicies() { return notImplemented('getAirlinePolicies'); }
  updateAirlinePolicy(_iata: string, _flightType: string, _updates: Partial<AirlinePolicy>) {
    return notImplemented('updateAirlinePolicy');
  }
}

export class SupabaseTripRepository implements TripRepository {
  save(_trip: StoredTrip) { return notImplemented('saveTrip'); }
  getById() { return notImplemented('getTripById'); }
}

export class SupabaseRecommendationRepository implements RecommendationRepository {
  save(_rec: StoredRecommendation) { return notImplemented('saveRecommendation'); }
  getById() { return notImplemented('getRecommendationById'); }
  getByTripId() { return notImplemented('getRecommendationByTripId'); }
  getAll() { return notImplemented('getAllRecommendations'); }
}

export class SupabaseCircleRepository implements CircleRepository {
  getAll() { return notImplemented('getAllCircles'); }
  getById() { return notImplemented('getCircleById'); }
  create(_circle: StoredCircle) { return notImplemented('createCircle'); }
  join(_circleId: string, _member: StoredCircleMember) { return notImplemented('joinCircle'); }
  leave(_circleId: string, _userName: string) { return notImplemented('leaveCircle'); }
  getMembers() { return notImplemented('getCircleMembers'); }
}

export class SupabaseMessageRepository implements MessageRepository {
  getByCircleId() { return notImplemented('getMessagesByCircleId'); }
  send(_msg: StoredMessage) { return notImplemented('sendMessage'); }
}

export class SupabaseReportRepository implements ReportRepository {
  getAll() { return notImplemented('getReports'); }
  create(_report: StoredReport) { return notImplemented('createReport'); }
  updateStatus(_id: string, _status: ReportStatus) { return notImplemented('updateReportStatus'); }
}

export class SupabaseShareRepository implements ShareRepository {
  getRecommendation() { return notImplemented('getSharedRecommendation'); }
}
