import { describe, expect, it } from 'vitest';
import {
  getGeolocationDeniedMessage,
  resolveDeviceLocation,
  resolveTypedAddressFallback,
} from '../server/location-resolver';

describe('location resolver helpers', () => {
  it('returns a deterministic fallback for typed addresses in demo mode', () => {
    const first = resolveTypedAddressFallback({
      query: 'South Lake Union',
      airport_iata: 'SEA',
    });
    const second = resolveTypedAddressFallback({
      query: 'South Lake Union',
      airport_iata: 'SEA',
    });

    expect(first).toEqual(second);
    expect(first.label).toBe('South Lake Union');
    expect(first.source_type).toBe('fallback');
  });

  it('preserves device coordinates when reverse geocoding is unavailable', async () => {
    const result = await resolveDeviceLocation({
      lat: 47.61,
      lng: -122.33,
    });

    expect(result.point).toEqual({ lat: 47.61, lng: -122.33 });
    expect(result.mode).toBe('device_location');
  });

  it('provides a typed-address fallback message for denied geolocation', () => {
    expect(getGeolocationDeniedMessage()).toContain('Type a neighborhood');
  });
});
