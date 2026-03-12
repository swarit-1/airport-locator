import type { WaitTimeResult } from '@gateshare/domain';
import type { WaitTimeProvider } from '../interfaces';

// Deterministic mock wait times by airport
const AIRPORT_WAIT_TIMES: Record<string, { base: number; peak: number }> = {
  SEA: { base: 15, peak: 35 },
  MCO: { base: 20, peak: 45 },
  DEN: { base: 18, peak: 40 },
  DFW: { base: 15, peak: 35 },
  LAX: { base: 25, peak: 55 },
  SFO: { base: 20, peak: 45 },
  ATL: { base: 22, peak: 50 },
  JFK: { base: 25, peak: 55 },
  LGA: { base: 20, peak: 40 },
  ORD: { base: 22, peak: 48 },
};

export class MockWaitTimeProvider implements WaitTimeProvider {
  async getWaitTime(
    airportIata: string,
    _terminalId?: string,
  ): Promise<WaitTimeResult> {
    const config = AIRPORT_WAIT_TIMES[airportIata] ?? { base: 20, peak: 40 };
    const hour = new Date().getHours();
    const isPeak = (hour >= 5 && hour <= 9) || (hour >= 15 && hour <= 19);
    const value = isPeak ? config.peak : config.base;

    return {
      value_minutes: value,
      source_name: 'GateShare Historical Model',
      source_type: 'fallback',
      freshness_timestamp: new Date().toISOString(),
      confidence_level: 'medium',
      notes: isPeak
        ? 'Peak hours estimate based on historical patterns'
        : 'Off-peak estimate based on historical patterns',
    };
  }
}
