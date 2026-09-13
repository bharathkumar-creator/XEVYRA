import { Router } from 'express';
import { IUserRepository } from '@xevyra/domain';
import { MongoProgressRepository } from '../infrastructure/mongo-progress.repository.js';
import { MongoTrainingRepository } from '../../training/infrastructure/mongo-training.repository.js';
import { MongoProfileRepository } from '../../profile/infrastructure/mongo-profile.repository.js';
import { ProgressController } from './progress.controller.js';
import { IFirebaseAuthService } from '../../../shared/auth/firebase-admin.client.js';
import { createAuthMiddleware } from '../../../shared/auth/firebase-auth.middleware.js';

export function createProgressRouter(
  userRepository: IUserRepository,
  progressRepository: MongoProgressRepository,
  trainingRepository: MongoTrainingRepository,
  profileRepository: MongoProfileRepository,
  authService?: IFirebaseAuthService
): Router {
  const router = Router();
  const controller = new ProgressController(progressRepository, trainingRepository, profileRepository);
  const requireAuth = createAuthMiddleware(authService, userRepository);

  router.get('/summary', requireAuth, controller.getSummary);
  router.post('/bodyweight', requireAuth, controller.logWeight);

  return router;
}
