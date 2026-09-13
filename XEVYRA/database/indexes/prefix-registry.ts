import crypto from 'crypto';

export const COLLECTION_PREFIXES = {
  users: 'usr',
  user_profiles: 'upr',
  nutrition_targets: 'ntr',
  exercises: 'exr',
  workout_routines: 'wro',
  workout_sessions: 'wse',
  food_items: 'foi',
  nutrition_days: 'ntd',
  diet_plans: 'dpl',
  maintenance_calorie_analyses: 'mca',
  bodyweight_logs: 'bwl',
  personal_records: 'prc',
  ai_requests: 'air',
  notifications: 'ntf',
  audit_logs: 'aud',
  idempotency_keys: 'idk',
} as const;

export type CollectionName = keyof typeof COLLECTION_PREFIXES;
export type CollectionPrefix = (typeof COLLECTION_PREFIXES)[CollectionName];

/**
 * Generates a standard prefixed entity ID (e.g. 'usr_7f8a9b1c2d3e4f5a')
 */
export function generatePrefixedId(collection: CollectionName): string {
  const prefix = COLLECTION_PREFIXES[collection];
  const uniqueHex = crypto.randomBytes(12).toString('hex');
  return `${prefix}_${uniqueHex}`;
}

/**
 * Validates whether an ID matches the required collection prefix
 */
export function isValidPrefixedId(id: string, collection: CollectionName): boolean {
  if (!id || typeof id !== 'string') return false;
  const prefix = COLLECTION_PREFIXES[collection];
  return id.startsWith(`${prefix}_`);
}
