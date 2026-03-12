import { z } from 'zod';
import { GeoPointSchema } from './common';

export const CircleTypeSchema = z.enum(['scheduled', 'leaving_now']);
export type CircleType = z.infer<typeof CircleTypeSchema>;

export const CircleVisibilitySchema = z.enum(['public', 'private', 'community']);
export type CircleVisibility = z.infer<typeof CircleVisibilitySchema>;

export const CircleStatusSchema = z.enum(['open', 'full', 'departed', 'expired', 'cancelled']);
export type CircleStatus = z.infer<typeof CircleStatusSchema>;

export const PickupModeSchema = z.enum(['exact_address', 'landmark', 'hidden']);
export type PickupMode = z.infer<typeof PickupModeSchema>;

export const MemberRoleSchema = z.enum(['creator', 'member']);
export type MemberRole = z.infer<typeof MemberRoleSchema>;

export const MemberStatusSchema = z.enum(['active', 'pending', 'declined', 'left']);
export type MemberStatus = z.infer<typeof MemberStatusSchema>;

export const RideCircleSchema = z.object({
  id: z.string().uuid(),
  creator_id: z.string().uuid(),
  airport_id: z.string().uuid(),
  circle_type: CircleTypeSchema,
  visibility: CircleVisibilitySchema,
  status: CircleStatusSchema.default('open'),
  // Timing
  target_leave_time: z.string().datetime(),
  leave_window_start: z.string().datetime(),
  leave_window_end: z.string().datetime(),
  // Constraints
  max_members: z.number().min(2).max(6).default(4),
  max_detour_minutes: z.number().min(0).default(15),
  // Location (approximate center, not exact address)
  approximate_origin: GeoPointSchema,
  proximity_radius_km: z.number().default(10),
  // Community scope
  community_id: z.string().uuid().nullable().default(null),
  // Savings
  estimated_savings_cents: z.number().default(0),
  estimated_extra_minutes: z.number().default(0),
  // Meta
  invite_code: z.string().nullable().default(null),
  expires_at: z.string().datetime().nullable().default(null),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type RideCircle = z.infer<typeof RideCircleSchema>;

export const RideCircleMemberSchema = z.object({
  id: z.string().uuid(),
  circle_id: z.string().uuid(),
  user_id: z.string().uuid(),
  trip_id: z.string().uuid().nullable().default(null),
  role: MemberRoleSchema,
  status: MemberStatusSchema.default('active'),
  pickup_mode: PickupModeSchema.default('hidden'),
  pickup_location: GeoPointSchema.nullable().default(null),
  pickup_landmark: z.string().nullable().default(null),
  joined_at: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
});
export type RideCircleMember = z.infer<typeof RideCircleMemberSchema>;

export const MessageSchema = z.object({
  id: z.string().uuid(),
  circle_id: z.string().uuid(),
  user_id: z.string().uuid(),
  content: z.string().min(1).max(2000),
  type: z.enum(['text', 'system', 'join', 'leave']).default('text'),
  created_at: z.string().datetime().optional(),
});
export type Message = z.infer<typeof MessageSchema>;

export const CreateCircleInputSchema = RideCircleSchema.omit({
  id: true,
  creator_id: true,
  status: true,
  estimated_savings_cents: true,
  estimated_extra_minutes: true,
  invite_code: true,
  created_at: true,
  updated_at: true,
});
export type CreateCircleInput = z.infer<typeof CreateCircleInputSchema>;
