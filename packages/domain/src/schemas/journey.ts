import { z } from 'zod';

export const JourneyPhaseSchema = z.enum([
  'planned',
  'prepare',
  'leave_now',
  'en_route',
  'at_airport',
  'through_security',
  'at_gate',
  'boarding',
  'in_flight',
  'arrived',
]);

export type JourneyPhase = z.infer<typeof JourneyPhaseSchema>;

export const ActiveTripSchema = z.object({
  id: z.string(),
  trip_id: z.string(),
  airline_iata: z.string(),
  airline_name: z.string(),
  flight_number: z.string(),
  departure_date: z.string(),
  departure_time: z.string(),
  airport_iata: z.string(),
  arrival_airport: z.string().nullable().default(null),
  flight_type: z.enum(['domestic', 'international']),
  terminal: z.string().nullable().default(null),
  gate: z.string().nullable().default(null),
  origin_label: z.string(),
  leave_by_time: z.string(),
  arrive_airport_time: z.string(),
  at_gate_time: z.string(),
  boarding_time: z.string(),
  total_minutes: z.number(),
  phase: JourneyPhaseSchema.default('planned'),
  status: z.enum(['on_time', 'delayed', 'cancelled', 'gate_changed']).default('on_time'),
  delay_minutes: z.number().default(0),
  status_message: z.string().nullable().default(null),
  last_status_check: z.string().nullable().default(null),
  breakdown: z.array(z.object({
    label: z.string(),
    minutes: z.number(),
    description: z.string(),
    source: z.string().optional(),
    phase: z.string().optional(),
  })).default([]),
  confidence: z.enum(['high', 'medium', 'low']).default('medium'),
});

export type ActiveTrip = z.infer<typeof ActiveTripSchema>;

export const FlightStatusUpdateSchema = z.object({
  status: z.enum(['on_time', 'delayed', 'cancelled', 'gate_changed']),
  delay_minutes: z.number().default(0),
  new_gate: z.string().nullable().default(null),
  new_departure_time: z.string().nullable().default(null),
  message: z.string().nullable().default(null),
  updated_at: z.string(),
});

export type FlightStatusUpdate = z.infer<typeof FlightStatusUpdateSchema>;
