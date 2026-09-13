// Common Domain Building Blocks
export * from './common/result.js';
export * from './common/entity.js';

// Identity Context
export * from './identity/email.vo.js';
export * from './identity/user.entity.js';
export * from './identity/user.repository.interface.js';
export * from './identity/auth-audit.entity.js';

// Profile Context
export * from './profile/profile.entity.js';

// Nutrition Context
export * from './nutrition/nutrition.entity.js';
export * from './nutrition/nutrition.service.js';
export * from './nutrition/FoodNutrientProfile.js';
export * from './nutrition/FoodServing.js';
export * from './nutrition/FoodItem.js';
export * from './nutrition/FoodEntry.js';
export * from './nutrition/NutritionTarget.js';
export * from './nutrition/DailyNutritionSummary.js';
export * from './nutrition/MaintenanceCalorieAnalysis.js';
export * from './nutrition/DietPlan.js';

// Training Context
export * from './training/training.entity.js';
export * from './training/training.service.js';

// Progress Context
export * from './progress/progress.entity.js';

// AI Coaching Context
export * from './ai-coaching/diet-plan.entity.js';
