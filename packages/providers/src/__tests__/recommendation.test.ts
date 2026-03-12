import { describe, it, expect } from 'vitest';
import { RecommendationEngine } from '../engine/recommendation';
import { MockTrafficProvider } from '../mock/traffic';
import { MockFlightProvider } from '../mock/flight';
import { MockWaitTimeProvider } from '../mock/wait-time';
import type { RecommendationInput } from '../engine/recommendation';

const engine = new RecommendationEngine(
  new MockTrafficProvider(),
  new MockFlightProvider(),
  new MockWaitTimeProvider(),
);

const baseInput: RecommendationInput = {
  tripId: 'test-trip-1',
  origin: { lat: 47.6062, lng: -122.3321 },
  airportLocation: { lat: 47.4502, lng: -122.3088 },
  airportIata: 'SEA',
  airlineIata: 'AA',
  flightNumber: '1234',
  departureDate: '2026-03-15',
  departureTime: '14:30',
  flightType: 'domestic',
  hasCheckedBags: false,
  bagCount: 0,
  partySize: 1,
  hasTsaPrecheck: false,
  hasClear: false,
  travelingWithKids: false,
  accessibilityNeeds: false,
  rideMode: 'rideshare',
  riskProfile: 'balanced',
  airportRules: {
    curb_to_bag_drop_minutes: 10,
    bag_drop_to_security_minutes: 5,
    security_to_gate_minutes: 15,
    avg_security_wait_minutes: 18,
    peak_security_wait_minutes: 35,
    min_arrival_before_departure: 60,
  },
  airlineRules: {
    bag_drop_cutoff_minutes: 45,
    boarding_begins_minutes: 30,
    gate_close_minutes: 15,
  },
};

describe('RecommendationEngine', () => {
  it('produces a recommendation with all required fields', async () => {
    const rec = await engine.compute(baseInput);

    expect(rec.id).toBeDefined();
    expect(rec.trip_id).toBe('test-trip-1');
    expect(rec.recommended_leave_time).toBeDefined();
    expect(rec.leave_window_start).toBeDefined();
    expect(rec.leave_window_end).toBeDefined();
    expect(rec.recommended_curb_arrival).toBeDefined();
    expect(rec.latest_safe_security_entry).toBeDefined();
    expect(rec.latest_safe_gate_arrival).toBeDefined();
    expect(rec.confidence).toBeDefined();
    expect(rec.confidence_score).toBeGreaterThan(0);
    expect(rec.breakdown.length).toBeGreaterThan(0);
    expect(rec.total_minutes).toBeGreaterThan(0);
    expect(rec.summary).toBeDefined();
    expect(rec.computed_at).toBeDefined();
  });

  it('leave time is before departure time', async () => {
    const rec = await engine.compute(baseInput);
    const leaveTime = new Date(rec.recommended_leave_time);
    const departureTime = new Date(`${baseInput.departureDate}T${baseInput.departureTime}:00.000Z`);
    expect(leaveTime.getTime()).toBeLessThan(departureTime.getTime());
  });

  it('window start is before window end', async () => {
    const rec = await engine.compute(baseInput);
    const start = new Date(rec.leave_window_start);
    const end = new Date(rec.leave_window_end);
    expect(start.getTime()).toBeLessThan(end.getTime());
  });

  it('conservative profile gives more total minutes than aggressive', async () => {
    const conservative = await engine.compute({
      ...baseInput,
      riskProfile: 'conservative',
    });
    const aggressive = await engine.compute({
      ...baseInput,
      riskProfile: 'aggressive',
    });
    expect(conservative.total_minutes).toBeGreaterThan(aggressive.total_minutes);
  });

  it('checked bags add bag drop to breakdown', async () => {
    const withBags = await engine.compute({
      ...baseInput,
      hasCheckedBags: true,
      bagCount: 2,
    });
    const bagItem = withBags.breakdown.find((b) => b.label === 'Bag drop');
    expect(bagItem).toBeDefined();
    expect(bagItem!.minutes).toBeGreaterThan(0);
  });

  it('TSA PreCheck reduces security time', async () => {
    const withoutPrecheck = await engine.compute(baseInput);
    const withPrecheck = await engine.compute({
      ...baseInput,
      hasTsaPrecheck: true,
    });
    const secNormal = withoutPrecheck.breakdown.find((b) => b.label.includes('Security'))!;
    const secPrecheck = withPrecheck.breakdown.find((b) => b.label.includes('Security'))!;
    expect(secPrecheck.minutes).toBeLessThan(secNormal.minutes);
  });

  it('CLEAR reduces security time more than PreCheck', async () => {
    const withPrecheck = await engine.compute({
      ...baseInput,
      hasTsaPrecheck: true,
    });
    const withClear = await engine.compute({
      ...baseInput,
      hasClear: true,
    });
    const secPrecheck = withPrecheck.breakdown.find((b) => b.label.includes('Security'))!;
    const secClear = withClear.breakdown.find((b) => b.label.includes('Security'))!;
    expect(secClear.minutes).toBeLessThanOrEqual(secPrecheck.minutes);
  });

  it('international flights add extra buffer', async () => {
    const domestic = await engine.compute(baseInput);
    const intl = await engine.compute({
      ...baseInput,
      flightType: 'international',
    });
    expect(intl.total_minutes).toBeGreaterThan(domestic.total_minutes);
  });

  it('large party adds group buffer', async () => {
    const solo = await engine.compute(baseInput);
    const group = await engine.compute({
      ...baseInput,
      partySize: 5,
    });
    expect(group.total_minutes).toBeGreaterThan(solo.total_minutes);
  });

  it('kids increase walk time', async () => {
    const noKids = await engine.compute(baseInput);
    const withKids = await engine.compute({
      ...baseInput,
      travelingWithKids: true,
    });
    const walkNoKids = noKids.breakdown.find((b) => b.label === 'Walk to gate')!;
    const walkKids = withKids.breakdown.find((b) => b.label === 'Walk to gate')!;
    expect(walkKids.minutes).toBeGreaterThan(walkNoKids.minutes);
  });

  it('breakdown items have labels and positive minutes', async () => {
    const rec = await engine.compute(baseInput);
    for (const item of rec.breakdown) {
      expect(item.label.length).toBeGreaterThan(0);
      expect(item.minutes).toBeGreaterThanOrEqual(0);
      expect(item.description.length).toBeGreaterThan(0);
    }
  });
});
