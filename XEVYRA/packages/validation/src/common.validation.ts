import { z } from 'zod';

export const IdSchema = z.string().min(1, 'ID cannot be empty');

export const DateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD');

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const WeightKgSchema = z
  .number()
  .min(20, 'Weight must be at least 20 kg')
  .max(500, 'Weight cannot exceed 500 kg');

export const HeightCmSchema = z
  .number()
  .min(50, 'Height must be at least 50 cm')
  .max(300, 'Height cannot exceed 300 cm');

export const RepsSchema = z
  .number()
  .int('Reps must be an integer')
  .min(0, 'Reps cannot be negative')
  .max(500, 'Reps cannot exceed 500');

export const RpeSchema = z
  .number()
  .min(1, 'RPE must be between 1 and 10')
  .max(10, 'RPE must be between 1 and 10')
  .optional();
