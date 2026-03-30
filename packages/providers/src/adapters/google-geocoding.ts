import type { GeoPoint } from '@boarding/domain';

type GoogleGeocodingOptions = {
  apiKey: string;
};

type GeocodingResult = {
  label: string;
  point: GeoPoint;
};

/**
 * Uses Google Geocoding API to resolve typed addresses to lat/lng.
 */
export class GoogleGeocodingProvider {
  constructor(private options: GoogleGeocodingOptions) {}

  async geocode(address: string): Promise<GeocodingResult | null> {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('address', address);
    url.searchParams.set('key', this.options.apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Google Geocoding request failed: ${response.status}`);
    }

    const payload = await response.json() as {
      status: string;
      results?: Array<{
        formatted_address: string;
        geometry: {
          location: { lat: number; lng: number };
        };
      }>;
    };

    if (payload.status !== 'OK' || !payload.results?.length) {
      return null;
    }

    const result = payload.results[0]!;
    return {
      label: result.formatted_address,
      point: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
    };
  }
}
