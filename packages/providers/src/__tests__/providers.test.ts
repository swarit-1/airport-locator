import { describe, it, expect } from 'vitest';
import { MockTrafficProvider } from '../mock/traffic';
import { MockFlightProvider } from '../mock/flight';
import { MockWaitTimeProvider } from '../mock/wait-time';
import { MockRideLinkProvider } from '../mock/ride-link';
import { MockCostEstimateProvider } from '../mock/cost-estimate';

describe('MockTrafficProvider', () => {
  const provider = new MockTrafficProvider();

  it('returns valid traffic result', async () => {
    const result = await provider.getTrafficEstimate(
      { lat: 47.6062, lng: -122.3321 },
      { lat: 47.4502, lng: -122.3088 },
    );
    expect(result.duration_minutes).toBeGreaterThan(0);
    expect(result.duration_in_traffic_minutes).toBeGreaterThanOrEqual(result.duration_minutes);
    expect(result.distance_km).toBeGreaterThan(0);
    expect(result.source).toBe('mock');
    expect(result.source_name).toBe('Deterministic traffic model');
    expect(result.source_type).toBe('mock');
    expect(result.fetched_at).toBeDefined();
  });

  it('traffic multiplier affects result', async () => {
    const morningRush = new Date('2026-03-15T08:00:00');
    const midnight = new Date('2026-03-15T02:00:00');

    const rush = await provider.getTrafficEstimate(
      { lat: 47.6062, lng: -122.3321 },
      { lat: 47.4502, lng: -122.3088 },
      morningRush,
    );
    const calm = await provider.getTrafficEstimate(
      { lat: 47.6062, lng: -122.3321 },
      { lat: 47.4502, lng: -122.3088 },
      midnight,
    );
    expect(rush.duration_in_traffic_minutes).toBeGreaterThan(calm.duration_in_traffic_minutes);
  });
});

describe('MockFlightProvider', () => {
  const provider = new MockFlightProvider();

  it('returns flight info for known flight', async () => {
    const info = await provider.getFlightInfo('AA', '1234', '2026-03-15');
    expect(info).not.toBeNull();
    expect(info!.airline_iata).toBe('AA');
    expect(info!.flight_number).toBe('1234');
    expect(info!.departure_airport).toBe('DFW');
    expect(info!.departure_airport_name).toContain('Dallas');
    expect(info!.departure_timezone).toBe('America/Chicago');
    expect(info!.terminal).toBeDefined();
    expect(info!.gate).toBeDefined();
    expect(info!.source).toBe('mock');
    expect(info!.source_name).toBe('Deterministic flight schedule');
    expect(info!.source_type).toBe('mock');
  });

  it('generates plausible flight for unknown flights', async () => {
    const info = await provider.getFlightInfo('XY', '9999', '2026-03-15');
    expect(info).not.toBeNull();
    expect(info!.airline_iata).toBe('XY');
    expect(info!.flight_number).toBe('9999');
    expect(info!.departure_airport).toMatch(/^[A-Z]{3}$/);
    expect(info!.departure_timezone).toBeTruthy();
  });
});

describe('MockWaitTimeProvider', () => {
  const provider = new MockWaitTimeProvider();

  it('returns wait time for known airport', async () => {
    const result = await provider.getWaitTime('SEA');
    expect(result.value_minutes).toBeGreaterThan(0);
    expect(result.source_name).toBeDefined();
    expect(result.source_type).toBe('fallback');
    expect(result.freshness_timestamp).toBeDefined();
    expect(result.confidence_level).toBeDefined();
  });

  it('returns fallback for unknown airport', async () => {
    const result = await provider.getWaitTime('XYZ');
    expect(result.value_minutes).toBeGreaterThan(0);
  });
});

describe('MockRideLinkProvider', () => {
  const provider = new MockRideLinkProvider();

  it('returns Uber deep link', async () => {
    const result = await provider.getRideLink(
      { lat: 47.6062, lng: -122.3321 },
      { lat: 47.4502, lng: -122.3088 },
      'uber',
    );
    expect(result.provider).toBe('uber');
    expect(result.deep_link).toContain('uber://');
    expect(result.web_link).toContain('m.uber.com');
    expect(result.estimated_price_cents).toBeGreaterThan(0);
  });

  it('returns Lyft deep link', async () => {
    const result = await provider.getRideLink(
      { lat: 47.6062, lng: -122.3321 },
      { lat: 47.4502, lng: -122.3088 },
      'lyft',
    );
    expect(result.provider).toBe('lyft');
    expect(result.deep_link).toContain('lyft://');
    expect(result.web_link).toContain('ride.lyft.com');
  });
});

describe('MockCostEstimateProvider', () => {
  const provider = new MockCostEstimateProvider();

  it('returns cost estimates with savings', async () => {
    const result = await provider.getEstimate(
      { lat: 47.6062, lng: -122.3321 },
      { lat: 47.4502, lng: -122.3088 },
      3,
    );
    expect(result.solo_cost_cents).toBeGreaterThan(0);
    expect(result.shared_cost_per_person_cents).toBeGreaterThan(0);
    expect(result.savings_cents).toBeGreaterThan(0);
    expect(result.shared_cost_per_person_cents).toBeLessThan(result.solo_cost_cents);
    expect(result.party_size).toBe(3);
  });
});
