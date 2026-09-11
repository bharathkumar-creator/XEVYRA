import { randomUUID } from 'node:crypto';

export function generateId(prefix?: string): string {
  const uuid = randomUUID().replace(/-/g, '');
  return prefix ? `${prefix}_${uuid}` : uuid;
}

export function formatDateToIsoString(date: Date = new Date()): string {
  return date.toISOString();
}

export function formatDateToDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]!;
}

export function isValidDateString(str: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(str);
}
