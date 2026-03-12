import type { GeoPoint } from '@gateshare/domain';

export interface CircleCandidate {
  circleId: string;
  airportId: string;
  targetLeaveTime: Date;
  leaveWindowStart: Date;
  leaveWindowEnd: Date;
  approximateOrigin: GeoPoint;
  proximityRadiusKm: number;
  maxDetourMinutes: number;
  maxMembers: number;
  currentMembers: number;
  communityId: string | null;
}

export interface MatchRequest {
  userId: string;
  airportId: string;
  origin: GeoPoint;
  targetLeaveTime: Date;
  leaveWindowStart: Date;
  leaveWindowEnd: Date;
  latestSafeArrival: Date;
  communityId: string | null;
  maxDetourMinutes: number;
}

export interface MatchResult {
  circleId: string;
  score: number; // 0-100, higher is better
  safetyScore: number;
  savingsScore: number;
  convenienceScore: number;
  estimatedDetourMinutes: number;
  estimatedSavingsCents: number;
}

export class CircleMatcher {
  match(request: MatchRequest, candidates: CircleCandidate[]): MatchResult[] {
    const results: MatchResult[] = [];

    for (const candidate of candidates) {
      // Rule: same airport only
      if (candidate.airportId !== request.airportId) continue;

      // Rule: not full
      if (candidate.currentMembers >= candidate.maxMembers) continue;

      // Rule: overlapping leave windows
      if (
        request.leaveWindowEnd < candidate.leaveWindowStart ||
        request.leaveWindowStart > candidate.leaveWindowEnd
      ) continue;

      // Rule: geographic proximity
      const distanceKm = haversineKm(request.origin, candidate.approximateOrigin);
      if (distanceKm > candidate.proximityRadiusKm) continue;

      // Rule: community scope if set
      if (candidate.communityId && request.communityId !== candidate.communityId) continue;

      // Estimate detour
      const estimatedDetourMinutes = Math.round((distanceKm / 40) * 60); // rough detour estimate
      if (estimatedDetourMinutes > request.maxDetourMinutes) continue;
      if (estimatedDetourMinutes > candidate.maxDetourMinutes) continue;

      // Rule: reject if detour puts user's safe arrival at risk
      const adjustedArrival = new Date(
        candidate.targetLeaveTime.getTime() + estimatedDetourMinutes * 60_000,
      );
      // This is a simplified check - in production we'd recompute the full recommendation
      if (adjustedArrival > request.latestSafeArrival) continue;

      // Score: safety first, then savings, then convenience
      const safetyScore = computeSafetyScore(estimatedDetourMinutes, request.maxDetourMinutes);
      const savingsScore = computeSavingsScore(candidate.currentMembers + 1, distanceKm);
      const convenienceScore = computeConvenienceScore(distanceKm, candidate.proximityRadiusKm);

      // Weighted composite: safety 50%, savings 30%, convenience 20%
      const score = Math.round(
        safetyScore * 0.5 + savingsScore * 0.3 + convenienceScore * 0.2,
      );

      // Estimated savings based on party size sharing
      const baseCostCents = Math.round(800 + distanceKm * 180);
      const sharedTotal = Math.round(baseCostCents * 1.2);
      const sharedPerPerson = Math.round(sharedTotal / (candidate.currentMembers + 1));
      const estimatedSavingsCents = baseCostCents - sharedPerPerson;

      results.push({
        circleId: candidate.circleId,
        score,
        safetyScore,
        savingsScore,
        convenienceScore,
        estimatedDetourMinutes,
        estimatedSavingsCents: Math.max(0, estimatedSavingsCents),
      });
    }

    // Sort by score descending, prefer smaller circles
    return results.sort((a, b) => b.score - a.score);
  }
}

function computeSafetyScore(detourMinutes: number, maxDetour: number): number {
  // Lower detour = higher safety score
  if (maxDetour === 0) return 100;
  const ratio = detourMinutes / maxDetour;
  return Math.round(Math.max(0, (1 - ratio) * 100));
}

function computeSavingsScore(totalRiders: number, distanceKm: number): number {
  // More riders and longer distance = higher savings
  const riderBonus = Math.min(totalRiders * 20, 80);
  const distanceBonus = Math.min(distanceKm * 2, 20);
  return Math.round(riderBonus + distanceBonus);
}

function computeConvenienceScore(distanceKm: number, maxRadius: number): number {
  // Closer = more convenient
  if (maxRadius === 0) return 100;
  const ratio = distanceKm / maxRadius;
  return Math.round(Math.max(0, (1 - ratio) * 100));
}

function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const calc =
    sinDLat * sinDLat +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinDLng * sinDLng;
  return R * 2 * Math.atan2(Math.sqrt(calc), Math.sqrt(1 - calc));
}
