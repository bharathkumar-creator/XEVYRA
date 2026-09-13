import { Router } from 'express';
import { IUserRepository } from '@xevyra/domain';
import { MongoNutritionRepository } from '../infrastructure/mongo-nutrition.repository.js';
import { MongoProfileRepository } from '../../profile/infrastructure/mongo-profile.repository.js';
import { MongoProgressRepository } from '../../progress/infrastructure/mongo-progress.repository.js';
import { NutritionController } from './nutrition.controller.js';
import { IFirebaseAuthService } from '../../../shared/auth/firebase-admin.client.js';
import { createAuthMiddleware } from '../../../shared/auth/firebase-auth.middleware.js';

export function createNutritionRouter(
  userRepository: IUserRepository,
  nutritionRepository: MongoNutritionRepository,
  profileRepository: MongoProfileRepository,
  progressRepository?: MongoProgressRepository,
  authService?: IFirebaseAuthService
): Router {
  const router = Router();
  const controller = new NutritionController(nutritionRepository, profileRepository, progressRepository);
  const requireAuth = createAuthMiddleware(authService, userRepository);

  // Daily Summary & Logs
  router.get('/summary', requireAuth, controller.getSummary);
  router.post('/log', requireAuth, controller.logFoodEntry);
  router.delete('/log/:dateString/:entryId', requireAuth, controller.deleteMealEntry);

  // Food Catalog Search & Custom Items
  router.get('/foods/search', requireAuth, controller.searchFoods);
  router.post('/foods/custom', requireAuth, controller.createCustomFood);

  // Maintenance Analysis
  router.get('/maintenance/analysis', requireAuth, controller.getMaintenanceAnalysis);

  // Diet Plans
  router.get('/diet-plan', requireAuth, controller.getActiveDietPlan);
  router.post('/diet-plan/generate', requireAuth, controller.generateDietPlan);

  return router;
}
