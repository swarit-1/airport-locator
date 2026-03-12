import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  __resetRepositoriesForTests,
  getAdminRulesRepo,
  getCircleRepo,
  getMessageRepo,
  getRecommendationRepo,
  getReportRepo,
  getShareRepo,
} from '../repositories';

function createLocalStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
  };
}

beforeEach(() => {
  vi.unstubAllGlobals();
  __resetRepositoriesForTests();
  const localStorage = createLocalStorageMock();
  vi.stubGlobal('window', {
    localStorage,
    sessionStorage: localStorage,
  });
});

describe('demo repositories', () => {
  it('creates a circle and loads it back by id', () => {
    const repo = getCircleRepo();
    const id = `circle-test-${Date.now()}`;
    repo.create({
      id,
      creator_name: 'You',
      airport_iata: 'SEA',
      airport_name: 'Seattle-Tacoma',
      circle_type: 'scheduled',
      visibility: 'public',
      status: 'open',
      target_leave_time: '2026-03-15T18:00:00.000Z',
      leave_window_start: '2026-03-15T17:45:00.000Z',
      leave_window_end: '2026-03-15T18:15:00.000Z',
      max_members: 4,
      current_members: 1,
      estimated_savings_cents: 1600,
      estimated_extra_minutes: 7,
      neighborhood: 'Downtown Seattle',
      origin_lat: 47.6062,
      origin_lng: -122.3321,
      created_at: new Date().toISOString(),
    });

    expect(repo.getById(id)?.id).toBe(id);
  });

  it('persists join, leave, and chat events through the repositories', () => {
    const circleRepo = getCircleRepo();
    const messageRepo = getMessageRepo();
    const circleId = 'circle-demo-1';

    circleRepo.join(circleId, {
      circle_id: circleId,
      user_name: 'You',
      role: 'member',
      status: 'active',
      joined_at: new Date().toISOString(),
    });

    messageRepo.send({
      id: `msg-${Date.now()}`,
      circle_id: circleId,
      sender: 'You',
      content: 'On my way.',
      time: '11:02 AM',
      type: 'text',
      created_at: new Date().toISOString(),
    });

    expect(circleRepo.getMembers(circleId).some((member) => member.user_name === 'You')).toBe(true);
    expect(messageRepo.getByCircleId(circleId).some((message) => message.content === 'On my way.')).toBe(true);

    circleRepo.leave(circleId, 'You');
    expect(circleRepo.getMembers(circleId).some((member) => member.user_name === 'You')).toBe(false);
  });

  it('loads a saved recommendation by share id', () => {
    const recommendationRepo = getRecommendationRepo();
    const shareRepo = getShareRepo();
    const id = `rec-${Date.now()}`;

    recommendationRepo.save({
      id,
      trip_id: 'trip-1',
      airline_name: 'Delta',
      flight_number: '1286',
      airport_iata: 'SEA',
      departure_time: '14:30',
      departure_date: '2026-03-15',
      recommended_leave_time: '2026-03-15T19:15:00.000Z',
      leave_window_start: '2026-03-15T19:05:00.000Z',
      leave_window_end: '2026-03-15T19:25:00.000Z',
      recommended_curb_arrival: '2026-03-15T19:55:00.000Z',
      latest_safe_bag_drop: null,
      latest_safe_security_entry: '2026-03-15T20:15:00.000Z',
      latest_safe_gate_arrival: '2026-03-15T20:40:00.000Z',
      confidence: 'high',
      confidence_score: 88,
      breakdown: [],
      total_minutes: 95,
      summary: 'Leave by 11:15 AM for a balanced buffer.',
      warnings: [],
      computed_at: new Date().toISOString(),
    });

    expect(shareRepo.getRecommendation(id)?.id).toBe(id);
  });

  it('persists admin edits through the repository layer', () => {
    const adminRepo = getAdminRulesRepo();
    const before = adminRepo.getAirportProfile('SEA', 'domestic');
    expect(before).toBeDefined();

    adminRepo.updateAirportProfile('SEA', 'domestic', { avg_security_wait_minutes: 31 });
    adminRepo.updateAirlinePolicy('DL', 'domestic', { gate_close_minutes: 18 });

    expect(adminRepo.getAirportProfile('SEA', 'domestic')?.avg_security_wait_minutes).toBe(31);
    expect(adminRepo.getAirlinePolicy('DL', 'domestic')?.gate_close_minutes).toBe(18);
  });

  it('persists moderation status changes', () => {
    const reportRepo = getReportRepo();
    const firstReport = reportRepo.getAll()[0];
    expect(firstReport).toBeDefined();

    reportRepo.updateStatus(firstReport!.id, 'resolved');
    expect(reportRepo.getAll().find((report) => report.id === firstReport!.id)?.status).toBe('resolved');
  });
});
