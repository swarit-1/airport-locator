import { describe, it, expect } from 'vitest';
import { CircleMatcher, type CircleCandidate, type MatchRequest } from '../engine/circle-matcher';

const matcher = new CircleMatcher();

const baseRequest: MatchRequest = {
  userId: 'user-1',
  airportId: 'airport-sea',
  origin: { lat: 47.6062, lng: -122.3321 },
  targetLeaveTime: new Date('2026-03-15T11:00:00Z'),
  leaveWindowStart: new Date('2026-03-15T10:30:00Z'),
  leaveWindowEnd: new Date('2026-03-15T11:30:00Z'),
  latestSafeArrival: new Date('2026-03-15T13:00:00Z'),
  communityId: null,
  maxDetourMinutes: 15,
};

const baseCandidate: CircleCandidate = {
  circleId: 'circle-1',
  airportId: 'airport-sea',
  targetLeaveTime: new Date('2026-03-15T11:00:00Z'),
  leaveWindowStart: new Date('2026-03-15T10:30:00Z'),
  leaveWindowEnd: new Date('2026-03-15T11:30:00Z'),
  approximateOrigin: { lat: 47.6100, lng: -122.3400 },
  proximityRadiusKm: 10,
  maxDetourMinutes: 15,
  maxMembers: 4,
  currentMembers: 1,
  communityId: null,
};

describe('CircleMatcher', () => {
  it('matches circles at the same airport with overlapping windows', () => {
    const results = matcher.match(baseRequest, [baseCandidate]);
    expect(results.length).toBe(1);
    expect(results[0]!.circleId).toBe('circle-1');
  });

  it('rejects circles at different airports', () => {
    const results = matcher.match(baseRequest, [
      { ...baseCandidate, airportId: 'airport-lax' },
    ]);
    expect(results.length).toBe(0);
  });

  it('rejects circles with non-overlapping windows', () => {
    const results = matcher.match(baseRequest, [
      {
        ...baseCandidate,
        leaveWindowStart: new Date('2026-03-15T14:00:00Z'),
        leaveWindowEnd: new Date('2026-03-15T15:00:00Z'),
      },
    ]);
    expect(results.length).toBe(0);
  });

  it('rejects full circles', () => {
    const results = matcher.match(baseRequest, [
      { ...baseCandidate, currentMembers: 4, maxMembers: 4 },
    ]);
    expect(results.length).toBe(0);
  });

  it('rejects circles outside proximity radius', () => {
    const results = matcher.match(baseRequest, [
      {
        ...baseCandidate,
        approximateOrigin: { lat: 48.5, lng: -123.5 }, // ~100km away
        proximityRadiusKm: 5,
      },
    ]);
    expect(results.length).toBe(0);
  });

  it('rejects circles exceeding max detour', () => {
    const results = matcher.match(
      { ...baseRequest, maxDetourMinutes: 1 },
      [
        {
          ...baseCandidate,
          approximateOrigin: { lat: 47.7, lng: -122.5 }, // ~15km away
        },
      ],
    );
    expect(results.length).toBe(0);
  });

  it('rejects community-scoped circles for non-members', () => {
    const results = matcher.match(baseRequest, [
      { ...baseCandidate, communityId: 'community-uw' },
    ]);
    expect(results.length).toBe(0);
  });

  it('matches community-scoped circles for members', () => {
    const results = matcher.match(
      { ...baseRequest, communityId: 'community-uw' },
      [{ ...baseCandidate, communityId: 'community-uw' }],
    );
    expect(results.length).toBe(1);
  });

  it('scores closer circles higher', () => {
    const close: CircleCandidate = {
      ...baseCandidate,
      circleId: 'circle-close',
      approximateOrigin: { lat: 47.607, lng: -122.333 }, // very close
    };
    const far: CircleCandidate = {
      ...baseCandidate,
      circleId: 'circle-far',
      approximateOrigin: { lat: 47.65, lng: -122.38 }, // farther
      proximityRadiusKm: 20,
    };

    const results = matcher.match(baseRequest, [far, close]);
    expect(results[0]!.circleId).toBe('circle-close');
  });

  it('returns scores between 0 and 100', () => {
    const results = matcher.match(baseRequest, [baseCandidate]);
    for (const result of results) {
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.safetyScore).toBeGreaterThanOrEqual(0);
      expect(result.savingsScore).toBeGreaterThanOrEqual(0);
      expect(result.convenienceScore).toBeGreaterThanOrEqual(0);
    }
  });

  it('returns positive estimated savings', () => {
    const results = matcher.match(baseRequest, [baseCandidate]);
    expect(results[0]!.estimatedSavingsCents).toBeGreaterThanOrEqual(0);
  });
});
