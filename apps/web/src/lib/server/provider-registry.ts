import { config } from '@boarding/config';
import {
  AviationStackFlightProvider,
  FlightAwareCompatibleFlightProvider,
  GoogleGeocodingProvider,
  GoogleRoutesTrafficProvider,
  HistoricalWaitTimeProvider,
  MockFlightProvider,
  MockRideLinkProvider,
  MockTrafficProvider,
  RecommendationEngine,
  type FlightProvider,
  type RideLinkProvider,
  type TrafficProvider,
  type WaitTimeProvider,
} from '@boarding/providers';

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
  const waitTimeProvider = getServerWaitTimeProvider();
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
  if (config.providers.googleMapsApiKey) {
    return new GoogleRoutesTrafficProvider({
      apiKey: config.providers.googleMapsApiKey,
    });
  }
  return new MockTrafficProvider();
}

export function getServerFlightProvider(): FlightProvider {
  // Prefer FlightAware if key exists (more reliable)
  if (config.providers.flightAwareApiKey) {
    return new FlightAwareCompatibleFlightProvider({
      apiKey: config.providers.flightAwareApiKey,
    });
  }
  // Fall back to AviationStack
  if (config.providers.aviationStackApiKey) {
    return new AviationStackFlightProvider({
      apiKey: config.providers.aviationStackApiKey,
    });
  }
  return new MockFlightProvider();
}

/**
 * Returns a flight provider capable of looking up flights by number only
 * (without a date). Returns null if no suitable provider is configured.
 */
export function getFlightLookupProvider(): AviationStackFlightProvider | null {
  if (config.providers.aviationStackApiKey) {
    return new AviationStackFlightProvider({
      apiKey: config.providers.aviationStackApiKey,
    });
  }
  return null;
}

export function getServerWaitTimeProvider(): WaitTimeProvider {
  // Always use historical TSA data — no mock
  return new HistoricalWaitTimeProvider();
}

export function getGeocodingProvider(): GoogleGeocodingProvider | null {
  if (config.providers.googleMapsApiKey) {
    return new GoogleGeocodingProvider({
      apiKey: config.providers.googleMapsApiKey,
    });
  }
  return null;
}

export function getProviderModeSummary() {
  const hasGoogleKey = !!config.providers.googleMapsApiKey;
  const hasFlightKey = !!(config.providers.flightAwareApiKey || config.providers.aviationStackApiKey);

  return {
    traffic: hasGoogleKey ? 'live' : 'mock',
    flight: config.providers.flightAwareApiKey
      ? 'live (FlightAware)'
      : config.providers.aviationStackApiKey
        ? 'live (AviationStack)'
        : 'mock',
    waitTimes: 'historical',
    rideLinks: 'live',
    geocoding: hasGoogleKey ? 'live' : 'none',
  } as const;
}
