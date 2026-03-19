// Interfaces
export type {
  TrafficProvider,
  FlightProvider,
  WaitTimeProvider,
  RideLinkProvider,
  CostEstimateProvider,
  NotificationProvider,
  AirportDiningProvider,
  CheckInProvider,
  TravelManagementProvider,
} from './interfaces';

// Mock implementations
export { MockTrafficProvider } from './mock/traffic';
export { MockFlightProvider } from './mock/flight';
export { MockWaitTimeProvider } from './mock/wait-time';
export { MockRideLinkProvider } from './mock/ride-link';
export { MockCostEstimateProvider } from './mock/cost-estimate';
export { MockNotificationProvider } from './mock/notification';
export { MockDiningProvider } from './mock/dining';
export { MockCheckInProvider } from './mock/checkin';

// Live/scaffolded adapters
export { GoogleRoutesTrafficProvider } from './adapters/google-routes-traffic';
export { FlightAwareCompatibleFlightProvider } from './adapters/flightaware-compatible';

// Recommendation engine
export { RecommendationEngine } from './engine/recommendation';
export { CircleMatcher } from './engine/circle-matcher';
