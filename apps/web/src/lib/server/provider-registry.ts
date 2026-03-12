import { config } from '@gateshare/config';
import {
  FlightAwareCompatibleFlightProvider,
  GoogleRoutesTrafficProvider,
  MockFlightProvider,
  MockRideLinkProvider,
  MockTrafficProvider,
  MockWaitTimeProvider,
  RecommendationEngine,
  type FlightProvider,
  type RideLinkProvider,
  type TrafficProvider,
  type WaitTimeProvider,
} from '@gateshare/providers';

type TripProviderSet = {
  trafficProvider: TrafficProvider;
  flightProvider: FlightProvider;
  waitTimeProvider: WaitTimeProvider;
  rideLinkProvider: RideLinkProvider;
  recommendationEngine: RecommendationEngine;
};

export function getServerTripProviders(): TripProviderSet {
  const trafficProvider = getServerTrafficProvider();
  const flightProvider = getServerFlightProvider();
  const waitTimeProvider = new MockWaitTimeProvider();
  const rideLinkProvider = new MockRideLinkProvider();

  return {
    trafficProvider,
    flightProvider,
    waitTimeProvider,
    rideLinkProvider,
    recommendationEngine: new RecommendationEngine(
      trafficProvider,
      flightProvider,
      waitTimeProvider,
    ),
  };
}

export function getServerTrafficProvider(): TrafficProvider {
  if (config.features.liveTraffic && config.providers.googleMapsApiKey) {
    return new GoogleRoutesTrafficProvider({
      apiKey: config.providers.googleMapsApiKey,
    });
  }

  return new MockTrafficProvider();
}

export function getServerFlightProvider(): FlightProvider {
  if (config.features.liveFlight && config.providers.flightAwareApiKey) {
    return new FlightAwareCompatibleFlightProvider({
      apiKey: config.providers.flightAwareApiKey,
    });
  }

  return new MockFlightProvider();
}

export function getProviderModeSummary() {
  return {
    traffic: config.features.liveTraffic && config.providers.googleMapsApiKey ? 'live' : 'mock',
    flight: config.features.liveFlight && config.providers.flightAwareApiKey ? 'live' : 'mock',
    waitTimes: config.features.liveWaitTimes ? 'fallback-chain' : 'mock',
    rideLinks: 'live',
  } as const;
}
