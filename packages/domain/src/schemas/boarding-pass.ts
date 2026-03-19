import { z } from 'zod';

export const BoardingPassDataSchema = z.object({
  passenger_name: z.string(),
  booking_reference: z.string(),
  from_airport: z.string().length(3),
  to_airport: z.string().length(3),
  airline_code: z.string().min(2).max(3),
  flight_number: z.string(),
  flight_date: z.string(),
  compartment: z.string().max(1),
  seat_number: z.string().nullable(),
  sequence_number: z.string().nullable(),
  source: z.enum(['barcode_scan', 'manual_entry', 'pkpass_import', 'ocr']),
  scanned_at: z.string().datetime(),
});

export type BoardingPassData = z.infer<typeof BoardingPassDataSchema>;

export const WaitTimeReportSchema = z.object({
  id: z.string(),
  airport_iata: z.string().length(3),
  terminal: z.string().nullable(),
  minutes: z.number().min(0).max(300),
  reporter_id: z.string().nullable(),
  reported_at: z.string().datetime(),
  precheck: z.boolean().default(false),
});

export type WaitTimeReport = z.infer<typeof WaitTimeReportSchema>;
