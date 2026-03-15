import type { GeoPoint, TrafficResult } from '@boarding/domain';
import type { TrafficProvider } from '../interfaces';

/**
 * Deterministic mock traffic provider.
 * Computes distance using Haversine, estimates time at ~30mph average with traffic factor.
 */
export class MockTrafficProvider implements TrafficProvider {
  async getTrafficEstimate(
    origin: GeoPoint,
    destination: GeoPoint,
    departAt?: Date,
  ): Promise<TrafficResult> {
    const distanceKm = haversineKm(origin, destination);
    const baseMinutes = (distanceKm / 48) * 60; // ~30mph average
    const hour = departAt ? departAt.getHours() : new Date().getHours();

    // Traffic multiplier based on time of day
    let trafficMultiplier = 1.0;
    if (hour >= 7 && hour <= 9) trafficMultiplier = 1.4;
    else if (hour >= 16 && hour <= 18) trafficMultiplier = 1.5;
    else if (hour >= 11 && hour <= 14) trafficMultiplier = 1.15;

    const durationMinutes = Math.round(baseMinutes);
    const durationInTraffic = Math.round(baseMinutes * trafficMultiplier);

    return {
      duration_minutes: durationMinutes,
      duration_in_traffic_minutes: durationInTraffic,
      distance_km: Math.round(distanceKm * 10) / 10,
      source: 'mock',
      source_name: 'Deterministic traffic model',
      source_type: 'mock',
      fetched_at: new Date().toISOString(),
    };
  }
}

function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const calc =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;
  return R * 2 * Math.atan2(Math.sqrt(calc), Math.sqrt(1 - calc));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
