import { z } from 'zod';

export const GeoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type GeoPoint = z.infer<typeof GeoPointSchema>;

export const RiskProfileSchema = z.enum(['conservative', 'balanced', 'aggressive']);
export type RiskProfile = z.infer<typeof RiskProfileSchema>;

export const RideModeSchema = z.enum(['rideshare', 'friend_dropoff', 'self_drive', 'transit']);
export type RideMode = z.infer<typeof RideModeSchema>;

export const FlightTypeSchema = z.enum(['domestic', 'international']);
export type FlightType = z.infer<typeof FlightTypeSchema>;

export const ConfidenceLevelSchema = z.enum(['high', 'medium', 'low']);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;

export const SourceTypeSchema = z.enum([
  'live_api',
  'crowdsourced',
  'historical',
  'fallback',
  'configured',
  'mock',
]);
export type SourceType = z.infer<typeof SourceTypeSchema>;

export const FeatureFlagsSchema = z.object({
  phoneVerification: z.boolean().default(false),
  idVerification: z.boolean().default(false),
  liveTraffic: z.boolean().default(false),
  liveFlight: z.boolean().default(false),
  liveWaitTimes: z.boolean().default(false),
  myTsa: z.boolean().default(false),
});
export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>;
