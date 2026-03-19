import { z } from 'zod';

export const DietaryOptionSchema = z.enum([
  'vegetarian', 'vegan', 'gluten_free', 'halal', 'kosher', 'nut_free',
]);

export type DietaryOption = z.infer<typeof DietaryOptionSchema>;

export const AirportRestaurantSchema = z.object({
  id: z.string(),
  airport_iata: z.string().length(3),
  name: z.string(),
  terminal: z.string().nullable(),
  concourse: z.string().nullable(),
  near_gates: z.array(z.string()),
  cuisine_type: z.string(),
  price_range: z.enum(['$', '$$', '$$$']),
  hours: z.object({
    open: z.string(),
    close: z.string(),
  }).nullable(),
  is_open_now: z.boolean(),
  rating: z.number().min(0).max(5).nullable(),
  review_count: z.number().nullable(),
  image_url: z.string().url().nullable(),
  menu_url: z.string().url().nullable(),
  accepts_mobile_order: z.boolean().default(false),
  estimated_wait_minutes: z.number().nullable(),
  dietary_options: z.array(DietaryOptionSchema).default([]),
  walk_time_from_security_minutes: z.number().nullable(),
  description: z.string().nullable(),
});

export type AirportRestaurant = z.infer<typeof AirportRestaurantSchema>;

export const AirportRestaurantDetailSchema = AirportRestaurantSchema.extend({
  reviews: z.array(z.object({
    author: z.string(),
    rating: z.number().min(0).max(5),
    text: z.string(),
    date: z.string(),
  })).default([]),
  menu_items: z.array(z.object({
    name: z.string(),
    price: z.string(),
    description: z.string().nullable(),
  })).default([]),
});

export type AirportRestaurantDetail = z.infer<typeof AirportRestaurantDetailSchema>;
