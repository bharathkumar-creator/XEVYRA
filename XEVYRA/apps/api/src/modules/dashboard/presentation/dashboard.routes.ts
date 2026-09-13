import { Router } from 'express';
import { IUserRepository } from '@xevyra/domain';
import { MongoProfileRepository } from '../../profile/infrastructure/mongo-profile.repository.js';
import { MongoNutritionRepository } from '../../nutrition/infrastructure/mongo-nutrition.repository.js';
import { MongoTrainingRepository } from '../../training/infrastructure/mongo-training.repository.js';
import { MongoProgressRepository } from '../../progress/infrastructure/mongo-progress.repository.js';
import { DashboardController } from './dashboard.controller.js';
import { IFirebaseAuthService } from '../../../shared/auth/firebase-admin.client.js';
import { createAuthMiddleware } from '../../../shared/auth/firebase-auth.middleware.js';

export function createDashboardRouter(
  userRepository: IUserRepository,
  profileRepository: MongoProfileRepository,
  nutritionRepository: MongoNutritionRepository,
  trainingRepository: MongoTrainingRepository,
  progressRepository?: MongoProgressRepository,
  authService?: IFirebaseAuthService
): Router {
  const router = Router();
  const controller = new DashboardController(
    userRepository,
    profileRepository,
    nutritionRepository,
    trainingRepository,
    progressRepository
  );
  const requireAuth = createAuthMiddleware(authService, userRepository);

  router.get('/', requireAuth, controller.getDashboard);

  return router;
}
