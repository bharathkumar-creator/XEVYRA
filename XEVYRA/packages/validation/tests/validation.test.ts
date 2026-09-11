import { describe, it, expect } from 'vitest';
import {
  WeightKgSchema,
  HeightCmSchema,
  DateStringSchema,
  PaginationQuerySchema,
  RepsSchema,
} from '../src/index.js';

describe('Validation Layer: Common Schemas', () => {
  it('should validate and clamp weight bounds correctly', () => {
    expect(WeightKgSchema.safeParse(75.5).success).toBe(true);
    expect(WeightKgSchema.safeParse(15).success).toBe(false); // below 20kg
    expect(WeightKgSchema.safeParse(600).success).toBe(false); // above 500kg
  });

  it('should validate height bounds correctly', () => {
    expect(HeightCmSchema.safeParse(180).success).toBe(true);
    expect(HeightCmSchema.safeParse(30).success).toBe(false);
    expect(HeightCmSchema.safeParse(350).success).toBe(false);
  });

  it('should enforce date string format YYYY-MM-DD', () => {
    expect(DateStringSchema.safeParse('2026-09-10').success).toBe(true);
    expect(DateStringSchema.safeParse('10-09-2026').success).toBe(false);
    expect(DateStringSchema.safeParse('2026/09/10').success).toBe(false);
  });

  it('should coerce and set defaults for pagination query', () => {
    const result = PaginationQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);

    const custom = PaginationQuerySchema.parse({ page: '3', limit: '50' });
    expect(custom.page).toBe(3);
    expect(custom.limit).toBe(50);
  });

  it('should validate reps integer constraint', () => {
    expect(RepsSchema.safeParse(10).success).toBe(true);
    expect(RepsSchema.safeParse(-1).success).toBe(false);
    expect(RepsSchema.safeParse(10.5).success).toBe(false);
  });
});
