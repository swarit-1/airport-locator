import type { GeoPoint, TrafficResult } from '@gateshare/domain';
import type { TrafficProvider } from '../interfaces';

type GoogleRoutesTrafficProviderOptions = {
  apiKey: string;
};

export class GoogleRoutesTrafficProvider implements TrafficProvider {
  constructor(private options: GoogleRoutesTrafficProviderOptions) {}

  async getTrafficEstimate(
    origin: GeoPoint,
    destination: GeoPoint,
    departAt?: Date,
  ): Promise<TrafficResult> {
    const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.options.apiKey,
        'X-Goog-FieldMask': 'routes.duration,routes.staticDuration,routes.distanceMeters',
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: origin,
          },
        },
        destination: {
          location: {
            latLng: destination,
          },
        },
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE',
        departureTime: (departAt ?? new Date()).toISOString(),
        computeAlternativeRoutes: false,
        units: 'IMPERIAL',
      }),
    });

    if (!response.ok) {
      throw new Error(`Google Routes request failed: ${response.status}`);
    }

    const payload = await response.json() as {
      routes?: Array<{
        duration?: string;
        staticDuration?: string;
        distanceMeters?: number;
      }>;
    };
    const route = payload.routes?.[0];

    if (!route?.duration || !route.staticDuration || typeof route.distanceMeters !== 'number') {
      throw new Error('Google Routes response missing route data');
    }

    return {
      duration_minutes: durationStringToMinutes(route.staticDuration),
      duration_in_traffic_minutes: durationStringToMinutes(route.duration),
      distance_km: Math.round((route.distanceMeters / 1000) * 10) / 10,
      source: 'google-routes',
      source_name: 'Google Routes',
      source_type: 'live_api',
      fetched_at: new Date().toISOString(),
    };
  }
}

function durationStringToMinutes(value: string): number {
  const seconds = Number.parseFloat(value.replace('s', ''));
  if (Number.isNaN(seconds)) {
    throw new Error(`Invalid duration string: ${value}`);
  }

  return Math.max(1, Math.round(seconds / 60));
}
