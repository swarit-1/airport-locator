import { config } from '@gateshare/config';
import type { ResolvedLocation } from '@gateshare/domain';
import { getDefaultOrigin } from '../trip-defaults';

type ResolveTypedAddressInput = {
  query: string;
  airport_iata: string;
};

type ResolveDeviceLocationInput = {
  lat: number;
  lng: number;
  label?: string | null;
};

export async function resolveTypedAddress(
  input: ResolveTypedAddressInput,
): Promise<ResolvedLocation> {
  if (config.features.liveTraffic && config.providers.googleMapsApiKey) {
    const live = await geocodeWithGoogle(input.query);
    if (live) {
      return {
        label: live.label,
        point: live.point,
        mode: 'typed_address',
        source_name: 'Google Geocoding',
        source_type: 'live_api',
        notes: 'Address geocoded from a typed origin.',
      };
    }
  }

  return resolveTypedAddressFallback(input);
}

export async function resolveDeviceLocation(
  input: ResolveDeviceLocationInput,
): Promise<ResolvedLocation> {
  if (config.features.liveTraffic && config.providers.googleMapsApiKey) {
    const liveLabel = await reverseGeocodeWithGoogle(input.lat, input.lng);
    if (liveLabel) {
      return {
        label: liveLabel,
        point: { lat: input.lat, lng: input.lng },
        mode: 'device_location',
        source_name: 'Browser location + Google Geocoding',
        source_type: 'live_api',
        notes: 'Using current device location.',
      };
    }
  }

  return {
    label: input.label?.trim() || 'Current location',
    point: { lat: input.lat, lng: input.lng },
    mode: 'device_location',
    source_name: 'Browser geolocation',
    source_type: 'fallback',
    notes: 'Coordinates captured from the device without reverse geocoding.',
  };
}

export function resolveTypedAddressFallback(
  input: ResolveTypedAddressInput,
): ResolvedLocation {
  const anchor = getDefaultOrigin(input.airport_iata);
  const seed = hashCode(`${input.airport_iata}:${input.query.toLowerCase()}`);
  const latOffset = ((seed % 23) - 11) / 1000;
  const lngOffset = (((seed >> 4) % 23) - 11) / 1000;

  return {
    label: normalizeLabel(input.query),
    point: {
      lat: roundCoordinate(anchor.lat + latOffset),
      lng: roundCoordinate(anchor.lng + lngOffset),
    },
    mode: 'typed_address',
    source_name: 'Demo geocoder fallback',
    source_type: 'fallback',
    notes: 'Approximate location derived from a deterministic local fallback.',
  };
}

export function getGeolocationDeniedMessage() {
  return 'Location access was denied. Type a neighborhood, landmark, or address instead.';
}

async function geocodeWithGoogle(query: string) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${config.providers.googleMapsApiKey}`,
  );

  if (!response.ok) {
    return null;
  }

  const payload = await response.json() as {
    status?: string;
    results?: Array<{
      formatted_address?: string;
      geometry?: {
        location?: {
          lat?: number;
          lng?: number;
        };
      };
    }>;
  };

  const result = payload.results?.[0];
  const point = result?.geometry?.location;

  if (payload.status !== 'OK' || !result?.formatted_address || typeof point?.lat !== 'number' || typeof point?.lng !== 'number') {
    return null;
  }

  return {
    label: result.formatted_address,
    point: {
      lat: point.lat,
      lng: point.lng,
    },
  };
}

async function reverseGeocodeWithGoogle(lat: number, lng: number) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${config.providers.googleMapsApiKey}`,
  );

  if (!response.ok) {
    return null;
  }

  const payload = await response.json() as {
    status?: string;
    results?: Array<{
      formatted_address?: string;
    }>;
  };

  if (payload.status !== 'OK') {
    return null;
  }

  return payload.results?.[0]?.formatted_address ?? null;
}

function hashCode(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function normalizeLabel(value: string) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function roundCoordinate(value: number) {
  return Math.round(value * 10_000) / 10_000;
}
