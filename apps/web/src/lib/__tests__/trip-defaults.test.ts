import { describe, expect, it } from 'vitest';
import { DEFAULT_DEPARTURE_TIME, getDefaultDepartureDate, getDefaultOrigin } from '../trip-defaults';

describe('trip defaults', () => {
  it('returns a concrete departure date and time instead of UI-only placeholders', () => {
    expect(getDefaultDepartureDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(DEFAULT_DEPARTURE_TIME).toBe('14:30');
  });

  it('returns a default origin for seeded airports', () => {
    expect(getDefaultOrigin('SEA')).toEqual({
      label: 'Downtown Seattle',
      lat: 47.6062,
      lng: -122.3321,
    });
  });

  it('falls back to SEA defaults for unknown airports', () => {
    expect(getDefaultOrigin('XXX').label).toBe('Downtown Seattle');
  });
});
