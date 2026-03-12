import { z } from 'zod';
import { GeoPointSchema, ConfidenceLevelSchema, SourceTypeSchema, FlightTypeSchema, LocationModeSchema } from './common';

// ─── Traffic Provider ─────────────────────────────────────────────────
export const TrafficResultSchema = z.object({
  duration_minutes: z.number().min(0),
  duration_in_traffic_minutes: z.number().min(0),
  distance_km: z.number().min(0),
  source: z.string(),
  source_name: z.string().default('Traffic source'),
  source_type: SourceTypeSchema.default('mock'),
  fetched_at: z.string().datetime(),
});
export type TrafficResult = z.infer<typeof TrafficResultSchema>;

// ─── Flight Provider ──────────────────────────────────────────────────
export const FlightStatusSchema = z.enum([
  'scheduled', 'delayed', 'cancelled', 'boarding', 'departed', 'arrived',
]);
export type FlightStatus = z.infer<typeof FlightStatusSchema>;

export const FlightInfoSchema = z.object({
  airline_iata: z.string(),
  flight_number: z.string(),
  departure_airport: z.string(),
  departure_airport_name: z.string().nullable().default(null),
  departure_timezone: z.string().nullable().default(null),
  arrival_airport: z.string().nullable(),
  scheduled_departure: z.string().datetime(),
  estimated_departure: z.string().datetime().nullable(),
  status: FlightStatusSchema,
  terminal: z.string().nullable(),
  gate: z.string().nullable(),
  flight_type: FlightTypeSchema.default('domestic'),
  delay_minutes: z.number().default(0),
  source: z.string(),
  source_name: z.string().default('Flight source'),
  source_type: SourceTypeSchema.default('mock'),
  notes: z.string().nullable().default(null),
  fetched_at: z.string().datetime(),
});
export type FlightInfo = z.infer<typeof FlightInfoSchema>;

export const ResolvedLocationSchema = z.object({
  label: z.string(),
  point: GeoPointSchema,
  mode: LocationModeSchema,
  source_name: z.string(),
  source_type: SourceTypeSchema,
  notes: z.string().nullable().default(null),
});
export type ResolvedLocation = z.infer<typeof ResolvedLocationSchema>;

// ─── Wait Time Provider ───────────────────────────────────────────────
export const WaitTimeResultSchema = z.object({
  value_minutes: z.number().min(0),
  source_name: z.string(),
  source_type: SourceTypeSchema,
  freshness_timestamp: z.string().datetime(),
  confidence_level: ConfidenceLevelSchema,
  notes: z.string().nullable().default(null),
});
export type WaitTimeResult = z.infer<typeof WaitTimeResultSchema>;

// ─── Ride Link Provider ───────────────────────────────────────────────
export const RideLinkSchema = z.object({
  provider: z.enum(['uber', 'lyft']),
  deep_link: z.string().url(),
  web_link: z.string().url(),
  estimated_price_cents: z.number().nullable().default(null),
  estimated_minutes: z.number().nullable().default(null),
});
export type RideLink = z.infer<typeof RideLinkSchema>;

// ─── Cost Estimate Provider ───────────────────────────────────────────
export const CostEstimateSchema = z.object({
  solo_cost_cents: z.number(),
  shared_cost_per_person_cents: z.number(),
  party_size: z.number(),
  savings_cents: z.number(),
  source: z.string(),
});
export type CostEstimate = z.infer<typeof CostEstimateSchema>;

// ─── Admin Override ───────────────────────────────────────────────────
export const AdminOverrideSchema = z.object({
  id: z.string().uuid(),
  entity_type: z.string(),
  entity_id: z.string().uuid(),
  field: z.string(),
  value: z.unknown(),
  reason: z.string().nullable().default(null),
  created_by: z.string().uuid(),
  created_at: z.string().datetime().optional(),
});
export type AdminOverride = z.infer<typeof AdminOverrideSchema>;
