import { z } from 'zod';
import { GeoPointSchema, FlightTypeSchema } from './common';

export const AirportSchema = z.object({
  id: z.string().uuid(),
  iata_code: z.string().length(3),
  name: z.string(),
  city: z.string(),
  state: z.string().length(2),
  location: GeoPointSchema,
  timezone: z.string(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type Airport = z.infer<typeof AirportSchema>;

export const AirportProfileSchema = z.object({
  id: z.string().uuid(),
  airport_id: z.string().uuid(),
  flight_type: FlightTypeSchema,
  // Time in minutes from curb to bag drop
  curb_to_bag_drop_minutes: z.number().min(0).default(10),
  // Time from bag drop to security entrance
  bag_drop_to_security_minutes: z.number().min(0).default(5),
  // Time from security exit to farthest gate
  security_to_gate_minutes: z.number().min(0).default(15),
  // Average security wait
  avg_security_wait_minutes: z.number().min(0).default(20),
  // Peak security wait
  peak_security_wait_minutes: z.number().min(0).default(45),
  // Minimum recommended arrival before departure (minutes)
  min_arrival_before_departure: z.number().min(0).default(60),
  // Notes for display
  notes: z.string().nullable().default(null),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type AirportProfile = z.infer<typeof AirportProfileSchema>;
