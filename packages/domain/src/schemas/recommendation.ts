import { z } from 'zod';
import { ConfidenceLevelSchema, SourceTypeSchema } from './common';

export const TimeBreakdownItemSchema = z.object({
  label: z.string(),
  minutes: z.number(),
  description: z.string(),
  source: z.string().optional(),
  source_type: SourceTypeSchema.optional(),
  freshness: z.string().datetime().optional(),
});
export type TimeBreakdownItem = z.infer<typeof TimeBreakdownItemSchema>;

export const RecommendationSchema = z.object({
  id: z.string().uuid(),
  trip_id: z.string().uuid(),
  // Core outputs
  recommended_leave_time: z.string().datetime(),
  leave_window_start: z.string().datetime(),
  leave_window_end: z.string().datetime(),
  recommended_curb_arrival: z.string().datetime(),
  latest_safe_bag_drop: z.string().datetime().nullable(),
  latest_safe_security_entry: z.string().datetime(),
  latest_safe_gate_arrival: z.string().datetime(),
  confidence: ConfidenceLevelSchema,
  confidence_score: z.number().min(0).max(100),
  // Breakdown
  breakdown: z.array(TimeBreakdownItemSchema),
  total_minutes: z.number(),
  // Summary
  summary: z.string(),
  warnings: z.array(z.string()).default([]),
  // Metadata
  computed_at: z.string().datetime(),
  expires_at: z.string().datetime().optional(),
  version: z.number().default(1),
  created_at: z.string().datetime().optional(),
});
export type Recommendation = z.infer<typeof RecommendationSchema>;

export const WaitTimeSnapshotSchema = z.object({
  id: z.string().uuid(),
  airport_id: z.string().uuid(),
  value_minutes: z.number().min(0),
  source_name: z.string(),
  source_type: SourceTypeSchema,
  freshness_timestamp: z.string().datetime(),
  confidence_level: ConfidenceLevelSchema,
  notes: z.string().nullable().default(null),
  created_at: z.string().datetime().optional(),
});
export type WaitTimeSnapshot = z.infer<typeof WaitTimeSnapshotSchema>;

export const FlightSnapshotSchema = z.object({
  id: z.string().uuid(),
  trip_id: z.string().uuid(),
  status: z.enum(['scheduled', 'delayed', 'cancelled', 'boarding', 'departed', 'arrived']),
  departure_time: z.string().datetime(),
  terminal: z.string().nullable(),
  gate: z.string().nullable(),
  delay_minutes: z.number().default(0),
  source: z.string(),
  fetched_at: z.string().datetime(),
  created_at: z.string().datetime().optional(),
});
export type FlightSnapshot = z.infer<typeof FlightSnapshotSchema>;

export const TrafficSnapshotSchema = z.object({
  id: z.string().uuid(),
  trip_id: z.string().uuid(),
  duration_minutes: z.number().min(0),
  duration_in_traffic_minutes: z.number().min(0),
  distance_km: z.number().min(0),
  source: z.string(),
  fetched_at: z.string().datetime(),
  created_at: z.string().datetime().optional(),
});
export type TrafficSnapshot = z.infer<typeof TrafficSnapshotSchema>;
