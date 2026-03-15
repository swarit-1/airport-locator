import type { GeoPoint, CostEstimate } from '@boarding/domain';
import type { CostEstimateProvider } from '../interfaces';

export class MockCostEstimateProvider implements CostEstimateProvider {
  async getEstimate(
    origin: GeoPoint,
    destination: GeoPoint,
    partySize: number,
  ): Promise<CostEstimate> {
    const distKm = haversineKm(origin, destination);
    const soloCostCents = Math.round(800 + distKm * 180);
    // Shared cost is solo cost * 1.2 / party size (slight premium for shared ride)
    const sharedTotal = Math.round(soloCostCents * 1.2);
    const sharedPerPerson = Math.round(sharedTotal / Math.max(partySize, 1));

    return {
      solo_cost_cents: soloCostCents,
      shared_cost_per_person_cents: sharedPerPerson,
      party_size: partySize,
      savings_cents: soloCostCents - sharedPerPerson,
      source: 'mock_heuristic',
    };
  }
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
