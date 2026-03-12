import type { AirportRule } from '@/lib/repositories';

export const DEFAULT_DEPARTURE_TIME = '14:30';

export const DEFAULT_ORIGINS: Record<string, { label: string; lat: number; lng: number }> = {
  SEA: { label: 'Downtown Seattle', lat: 47.6062, lng: -122.3321 },
  LAX: { label: 'Santa Monica', lat: 34.0195, lng: -118.4912 },
  SFO: { label: 'Downtown San Francisco', lat: 37.7749, lng: -122.4194 },
  DEN: { label: 'Downtown Denver', lat: 39.7392, lng: -104.9903 },
  DFW: { label: 'Downtown Dallas', lat: 32.7767, lng: -96.797 },
  ORD: { label: 'Downtown Chicago', lat: 41.8781, lng: -87.6298 },
  ATL: { label: 'Midtown Atlanta', lat: 33.749, lng: -84.388 },
  JFK: { label: 'Manhattan', lat: 40.758, lng: -73.9855 },
  LGA: { label: 'Manhattan', lat: 40.758, lng: -73.9855 },
  MCO: { label: 'Downtown Orlando', lat: 28.5383, lng: -81.3792 },
};

const SEA_DEFAULT_ORIGIN = DEFAULT_ORIGINS.SEA as { label: string; lat: number; lng: number };

export function getDefaultDepartureDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0]!;
}

export function getDefaultOrigin(iataCode: string): { label: string; lat: number; lng: number } {
  return DEFAULT_ORIGINS[iataCode] ?? SEA_DEFAULT_ORIGIN;
}

export function buildDefaultTripState(airport: AirportRule) {
  const origin = getDefaultOrigin(airport.iata_code);

  return {
    departure_date: getDefaultDepartureDate(),
    departure_time: DEFAULT_DEPARTURE_TIME,
    airport_iata: airport.iata_code,
    origin_label: origin.label,
    origin_lat: origin.lat,
    origin_lng: origin.lng,
  };
}
