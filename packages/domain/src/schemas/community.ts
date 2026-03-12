import { z } from 'zod';
import { GeoPointSchema } from './common';

export const CommunityTypeSchema = z.enum(['general', 'campus']);
export type CommunityType = z.infer<typeof CommunityTypeSchema>;

export const CommunitySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  type: CommunityTypeSchema,
  description: z.string().nullable().default(null),
  email_domain: z.string().nullable().default(null), // e.g. "uw.edu"
  location: GeoPointSchema.nullable().default(null),
  logo_url: z.string().nullable().default(null),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type Community = z.infer<typeof CommunitySchema>;

export const CommunityMembershipSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  community_id: z.string().uuid(),
  role: z.enum(['member', 'moderator', 'admin']).default('member'),
  joined_at: z.string().datetime().optional(),
});
export type CommunityMembership = z.infer<typeof CommunityMembershipSchema>;

export const SavedLocationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  label: z.string(),
  location: GeoPointSchema,
  address: z.string().nullable().default(null),
  is_default: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
});
export type SavedLocation = z.infer<typeof SavedLocationSchema>;
