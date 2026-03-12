import { z } from 'zod';
import { GeoPointSchema, RiskProfileSchema, RideModeSchema, FlightTypeSchema } from './common';

export const TripSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  // Flight info
  airline_id: z.string().uuid(),
  flight_number: z.string(),
  departure_date: z.string(), // YYYY-MM-DD
  departure_time: z.string(), // HH:MM (scheduled departure)
  airport_id: z.string().uuid(),
  terminal: z.string().nullable().default(null),
  gate: z.string().nullable().default(null),
  flight_type: FlightTypeSchema,
  // Origin
  origin_location: GeoPointSchema,
  origin_label: z.string(), // display name for origin
  // Travel details
  has_checked_bags: z.boolean().default(false),
  bag_count: z.number().min(0).default(0),
  party_size: z.number().min(1).default(1),
  has_tsa_precheck: z.boolean().default(false),
  has_clear: z.boolean().default(false),
  traveling_with_kids: z.boolean().default(false),
  accessibility_needs: z.boolean().default(false),
  ride_mode: RideModeSchema.default('rideshare'),
  risk_profile: RiskProfileSchema.default('balanced'),
  // Optional community filter
  community_id: z.string().uuid().nullable().default(null),
  // Status
  status: z.enum(['active', 'completed', 'cancelled']).default('active'),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type Trip = z.infer<typeof TripSchema>;

export const CreateTripInputSchema = TripSchema.omit({
  id: true,
  user_id: true,
  status: true,
  created_at: true,
  updated_at: true,
});
export type CreateTripInput = z.infer<typeof CreateTripInputSchema>;
