import { z } from 'zod';
import { FlightTypeSchema } from './common';

export const AirlineSchema = z.object({
  id: z.string().uuid(),
  iata_code: z.string().min(2).max(2),
  name: z.string(),
  logo_url: z.string().nullable().default(null),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type Airline = z.infer<typeof AirlineSchema>;

export const AirlinePolicySchema = z.object({
  id: z.string().uuid(),
  airline_id: z.string().uuid(),
  flight_type: FlightTypeSchema,
  // Bag drop cutoff before departure (minutes)
  bag_drop_cutoff_minutes: z.number().min(0).default(45),
  // Boarding begins before departure (minutes)
  boarding_begins_minutes: z.number().min(0).default(30),
  // Gate closes before departure (minutes)
  gate_close_minutes: z.number().min(0).default(15),
  // Recommended checkin before departure (minutes)
  recommended_checkin_minutes: z.number().min(0).default(120),
  // Notes
  notes: z.string().nullable().default(null),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type AirlinePolicy = z.infer<typeof AirlinePolicySchema>;
