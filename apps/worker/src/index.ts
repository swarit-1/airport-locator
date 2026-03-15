/**
 * Boarding Worker
 *
 * Responsibilities:
 * 1. Periodically refresh recommendation data for active trips
 * 2. Expire "leaving now" circles past their window
 * 3. Run circle matching for new trips
 * 4. Clean up stale data
 *
 * Architecture:
 * - Simple interval-based polling on Postgres
 * - No Redis, no message queue — just Postgres-centric jobs
 * - In production, this can run as a long-lived process or be triggered by pg_cron
 */

import {
  MockTrafficProvider,
  MockFlightProvider,
  MockWaitTimeProvider,
  RecommendationEngine,
  CircleMatcher,
} from '@boarding/providers';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const EXPIRE_INTERVAL_MS = 1 * 60 * 1000;  // 1 minute

const engine = new RecommendationEngine(
  new MockTrafficProvider(),
  new MockFlightProvider(),
  new MockWaitTimeProvider(),
);

const matcher = new CircleMatcher();

async function refreshRecommendations() {
  // In production: query active trips, recompute recommendations, update DB
  console.log(`[${new Date().toISOString()}] Refreshing recommendations for active trips...`);
  // const { data: activeTrips } = await supabase
  //   .from('trips')
  //   .select('*')
  //   .eq('status', 'active')
  //   .gte('departure_date', new Date().toISOString().split('T')[0]);
  // for (const trip of activeTrips) { ... }
}

async function expireCircles() {
  console.log(`[${new Date().toISOString()}] Expiring old leaving-now circles...`);
  // In production: UPDATE ride_circles SET status = 'expired'
  // WHERE circle_type = 'leaving_now' AND leave_window_end < NOW() AND status = 'open'
}

async function runMatching() {
  console.log(`[${new Date().toISOString()}] Running circle matching...`);
  // In production: find unmatched trips and run them against open circles
}

async function main() {
  console.log('Boarding Worker started');
  console.log(`Refresh interval: ${REFRESH_INTERVAL_MS / 1000}s`);
  console.log(`Expire interval: ${EXPIRE_INTERVAL_MS / 1000}s`);

  // Initial run
  await refreshRecommendations();
  await expireCircles();
  await runMatching();

  // Set up intervals
  setInterval(refreshRecommendations, REFRESH_INTERVAL_MS);
  setInterval(expireCircles, EXPIRE_INTERVAL_MS);
  setInterval(runMatching, REFRESH_INTERVAL_MS);

  // Keep alive
  console.log('Worker running. Press Ctrl+C to stop.');
}

main().catch((err) => {
  console.error('Worker failed:', err);
  process.exit(1);
});
