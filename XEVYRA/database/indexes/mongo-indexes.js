"use strict";
/**
 * MongoDB Index Definitions for XEVYRA Platform
 * Strictly enforces 3-character collection prefix naming convention
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MONGO_INDEXES = void 0;
exports.MONGO_INDEXES = [
    // 1. Users Collection (usr)
    {
        collection: 'users',
        spec: { usrFirebaseUid: 1 },
        options: { unique: true, name: 'idx_users_usrFirebaseUid_unique' },
    },
    {
        collection: 'users',
        spec: { usrEmail: 1 },
        options: { unique: true, name: 'idx_users_usrEmail_unique' },
    },
    // 2. User Profiles Collection (upr)
    {
        collection: 'user_profiles',
        spec: { uprUserId: 1 },
        options: { unique: true, name: 'idx_user_profiles_uprUserId_unique' },
    },
    // 3. Nutrition Targets Collection (ntr)
    {
        collection: 'nutrition_targets',
        spec: { ntrUserId: 1, ntrEffectiveFrom: -1 },
        options: { name: 'idx_nutrition_targets_ntrUserId_effective' },
    },
    // 4. Exercises Collection (exr)
    {
        collection: 'exercises',
        spec: { exrName: 1, exrCreatedByUserId: 1 },
        options: { name: 'idx_exercises_exrName_createdUser' },
    },
    {
        collection: 'exercises',
        spec: { exrMuscleGroup: 1 },
        options: { name: 'idx_exercises_exrMuscleGroup' },
    },
    {
        collection: 'exercises',
        spec: { exrIsCustom: 1, exrCreatedByUserId: 1 },
        options: { name: 'idx_exercises_custom_user' },
    },
    // 5. Workout Routines Collection (wro)
    {
        collection: 'workout_routines',
        spec: { wroUserId: 1, wroIsArchived: 1 },
        options: { name: 'idx_workout_routines_user_archived' },
    },
    // 6. Workout Sessions Collection (wse)
    {
        collection: 'workout_sessions',
        spec: { wseUserId: 1, wseStartedAt: -1 },
        options: { name: 'idx_workout_sessions_user_started' },
    },
    {
        collection: 'workout_sessions',
        spec: { wseUserId: 1, wseStatus: 1 },
        options: { name: 'idx_workout_sessions_user_status' },
    },
    // 7. Food Items Collection (foi)
    {
        collection: 'food_items',
        spec: { foiName: 'text', foiCategory: 'text' },
        options: { name: 'idx_food_items_text_search' },
    },
    {
        collection: 'food_items',
        spec: { foiIsCustom: 1, foiCreatedByUserId: 1 },
        options: { name: 'idx_food_items_custom_user' },
    },
    {
        collection: 'food_items',
        spec: { foiCuisineType: 1 },
        options: { name: 'idx_food_items_cuisine' },
    },
    // 8. Nutrition Days Collection (ntd)
    {
        collection: 'nutrition_days',
        spec: { ntdUserId: 1, ntdDateString: 1 },
        options: { unique: true, name: 'idx_nutrition_days_user_date_unique' },
    },
    {
        collection: 'nutrition_days',
        spec: { ntdUserId: 1, ntdUpdatedAt: -1 },
        options: { name: 'idx_nutrition_days_user_updated' },
    },
    // 9. Diet Plans Collection (dpl)
    {
        collection: 'diet_plans',
        spec: { dplUserId: 1, dplIsActive: 1 },
        options: { name: 'idx_diet_plans_user_active' },
    },
    // 10. Maintenance Calorie Analyses Collection (mca)
    {
        collection: 'maintenance_calorie_analyses',
        spec: { mcaUserId: 1, mcaPeriodEnd: -1 },
        options: { name: 'idx_mca_user_period' },
    },
    // 11. Bodyweight Logs Collection (bwl)
    {
        collection: 'bodyweight_logs',
        spec: { bwlUserId: 1, bwlDateString: -1 },
        options: { unique: true, name: 'idx_bodyweight_logs_user_date_unique' },
    },
    // 12. Personal Records Collection (prc)
    {
        collection: 'personal_records',
        spec: { prcUserId: 1, prcExerciseId: 1 },
        options: { unique: true, name: 'idx_personal_records_user_exercise_unique' },
    },
    // 13. Audit Logs Collection (aud)
    {
        collection: 'audit_logs',
        spec: { audUserId: 1, audCreatedAt: -1 },
        options: { name: 'idx_audit_logs_user_created' },
    },
    // 14. Notifications Collection (ntf)
    {
        collection: 'notifications',
        spec: { ntfUserId: 1, ntfIsRead: 1, ntfCreatedAt: -1 },
        options: { name: 'idx_notifications_user_read' },
    },
    // 15. Idempotency Keys Collection (idk)
    {
        collection: 'idempotency_keys',
        spec: { idkUserId: 1, idkKey: 1 },
        options: { unique: true, name: 'idx_idempotency_user_key_unique' },
    },
    {
        collection: 'idempotency_keys',
        spec: { idkCreatedAt: 1 },
        options: { expireAfterSeconds: 86400, name: 'idx_idempotency_ttl' },
    },
    // 16. AI Requests Collection (air)
    {
        collection: 'ai_requests',
        spec: { airUserId: 1, airCreatedAt: -1 },
        options: { name: 'idx_ai_requests_user_created' },
    },
];
//# sourceMappingURL=mongo-indexes.js.map