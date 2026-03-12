import {
  MockTrafficProvider,
  MockFlightProvider,
  MockWaitTimeProvider,
  MockRideLinkProvider,
  MockCostEstimateProvider,
  MockNotificationProvider,
  RecommendationEngine,
  CircleMatcher,
} from '@gateshare/providers';

// For MVP, all providers are mocks. Feature flags will switch to real adapters.
export const trafficProvider = new MockTrafficProvider();
export const flightProvider = new MockFlightProvider();
export const waitTimeProvider = new MockWaitTimeProvider();
export const rideLinkProvider = new MockRideLinkProvider();
export const costEstimateProvider = new MockCostEstimateProvider();
export const notificationProvider = new MockNotificationProvider();

export const recommendationEngine = new RecommendationEngine(
  trafficProvider,
  flightProvider,
  waitTimeProvider,
);

export const circleMatcher = new CircleMatcher();
