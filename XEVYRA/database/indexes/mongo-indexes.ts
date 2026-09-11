/**
 * MongoDB Index Definitions for XEVYRA Platform
 * Corresponds to Section 30 of Architecture Specification
 */

export interface IndexDefinition {
  collection: string;
  spec: Record<string, 1 | -1 | 'text'>;
  options?: {
    unique?: boolean;
    sparse?: boolean;
    expireAfterSeconds?: number;
    name?: string;
  };
}

export const MONGO_INDEXES: IndexDefinition[] = [
  // Users Collection
  {
    collection: 'users',
    spec: { firebaseUid: 1 },
    options: { unique: true, name: 'idx_users_firebase_uid_unique' },
  },
  {
    collection: 'users',
    spec: { email: 1 },
    options: { unique: true, name: 'idx_users_email_unique' },
  },

  // Auth Audit Logs Collection
  {
    collection: 'auth_audit_logs',
    spec: { userId: 1, timestamp: -1 },
    options: { name: 'idx_auth_audit_user_timestamp' },
  },
  {
    collection: 'auth_audit_logs',
    spec: { firebaseUid: 1, timestamp: -1 },
    options: { name: 'idx_auth_audit_firebase_timestamp' },
  },

  // Profiles Collection
  {
    collection: 'profiles',
    spec: { userId: 1 },
    options: { unique: true, name: 'idx_profiles_user_id_unique' },
  },

  // Weight Logs Collection
  {
    collection: 'weight_logs',
    spec: { userId: 1, loggedAt: -1 },
    options: { name: 'idx_weight_logs_user_logged_at' },
  },

  // Daily Nutrition Collection
  {
    collection: 'daily_nutrition',
    spec: { userId: 1, dateString: 1 },
    options: { unique: true, name: 'idx_daily_nutrition_user_date_unique' },
  },

  // Workout Sessions Collection
  {
    collection: 'workout_sessions',
    spec: { userId: 1, startedAt: -1 },
    options: { name: 'idx_workout_sessions_user_started_at' },
  },
  {
    collection: 'workout_sessions',
    spec: { userId: 1, clientMutationId: 1 },
    options: { unique: true, sparse: true, name: 'idx_workout_sessions_idempotency_unique' },
  },

  // Personal Records Collection
  {
    collection: 'personal_records',
    spec: { userId: 1, exerciseId: 1 },
    options: { unique: true, name: 'idx_personal_records_user_exercise_unique' },
  },

  // AI Diet Plans Collection
  {
    collection: 'ai_diet_plans',
    spec: { userId: 1, createdAt: -1 },
    options: { name: 'idx_ai_diet_plans_user_created_at' },
  },
];
