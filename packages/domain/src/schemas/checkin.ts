import { z } from 'zod';

export const CheckInResultSchema = z.object({
  success: z.boolean(),
  boarding_pass_url: z.string().url().nullable(),
  seat_assignment: z.string().nullable(),
  boarding_group: z.string().nullable(),
  error_message: z.string().nullable(),
  checked_in_at: z.string().datetime().nullable(),
});

export type CheckInResult = z.infer<typeof CheckInResultSchema>;

export const CheckInStatusSchema = z.enum([
  'not_available',
  'available',
  'scheduled',
  'in_progress',
  'completed',
  'failed',
]);

export type CheckInStatus = z.infer<typeof CheckInStatusSchema>;

export const CheckInConfigSchema = z.object({
  airline_iata: z.string().length(2),
  confirmation_code: z.string().min(4).max(10),
  passenger_last_name: z.string().min(1),
  auto_checkin_enabled: z.boolean().default(false),
});

export type CheckInConfig = z.infer<typeof CheckInConfigSchema>;
