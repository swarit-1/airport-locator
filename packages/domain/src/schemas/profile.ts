import { z } from 'zod';

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  display_name: z.string().nullable().default(null),
  avatar_url: z.string().nullable().default(null),
  phone: z.string().nullable().default(null),
  phone_verified: z.boolean().default(false),
  email_verified: z.boolean().default(true),
  is_admin: z.boolean().default(false),
  // Trust signals
  completed_trips_count: z.number().default(0),
  // Preferences
  default_risk_profile: z.enum(['conservative', 'balanced', 'aggressive']).default('balanced'),
  default_ride_mode: z.enum(['rideshare', 'friend_dropoff', 'self_drive', 'transit']).default('rideshare'),
  has_tsa_precheck: z.boolean().default(false),
  has_clear: z.boolean().default(false),
  // Feature flags for future
  id_verified: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type Profile = z.infer<typeof ProfileSchema>;

export const ReportSchema = z.object({
  id: z.string().uuid(),
  reporter_id: z.string().uuid(),
  reported_user_id: z.string().uuid().nullable().default(null),
  circle_id: z.string().uuid().nullable().default(null),
  message_id: z.string().uuid().nullable().default(null),
  reason: z.enum(['spam', 'harassment', 'inappropriate', 'safety', 'other']),
  details: z.string().nullable().default(null),
  status: z.enum(['pending', 'reviewed', 'resolved', 'dismissed']).default('pending'),
  reviewed_by: z.string().uuid().nullable().default(null),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type Report = z.infer<typeof ReportSchema>;

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  actor_id: z.string().uuid(),
  action: z.string(),
  entity_type: z.string(),
  entity_id: z.string().uuid(),
  metadata: z.record(z.unknown()).default({}),
  created_at: z.string().datetime().optional(),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;

export const NotificationPreferencesSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  circle_messages: z.boolean().default(true),
  circle_joins: z.boolean().default(true),
  recommendation_updates: z.boolean().default(true),
  marketing: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
});
export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;
