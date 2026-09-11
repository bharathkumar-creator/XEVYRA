import { describe, it, expect } from 'vitest';
import { generateId, formatDateToDateString, isValidDateString } from '../src/index.js';

describe('Shared Utilities: ID Generation & Dates', () => {
  it('should generate prefixed UUID strings', () => {
    const id = generateId('usr');
    expect(id).toMatch(/^usr_[a-f0-9]{32}$/);
  });

  it('should format dates and validate format', () => {
    const date = new Date('2026-09-10T12:00:00Z');
    const formatted = formatDateToDateString(date);
    expect(formatted).toBe('2026-09-10');
    expect(isValidDateString(formatted)).toBe(true);
    expect(isValidDateString('2026/09/10')).toBe(false);
  });
});
