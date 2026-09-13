import { Router } from 'express';
import { IUserRepository } from '@xevyra/domain';
import { MongoTrainingRepository } from '../infrastructure/mongo-training.repository.js';
import { TrainingController } from './training.controller.js';
import { IFirebaseAuthService } from '../../../shared/auth/firebase-admin.client.js';
import { createAuthMiddleware } from '../../../shared/auth/firebase-auth.middleware.js';

export function createTrainingRouter(
  userRepository: IUserRepository,
  trainingRepository: MongoTrainingRepository,
  authService?: IFirebaseAuthService
): Router {
  const router = Router();
  const controller = new TrainingController(trainingRepository);
  const requireAuth = createAuthMiddleware(authService, userRepository);

  // Exercise library
  router.get('/exercises', requireAuth, controller.getExercises);
  router.post('/exercises', requireAuth, controller.createExercise);

  // Workout Routines
  router.get('/routines', requireAuth, controller.getRoutines);
  router.post('/routines', requireAuth, controller.createRoutine);

  // Workout Sessions & Set Logging
  router.post('/sessions', requireAuth, controller.startSession);
  router.patch('/sessions/:id/sets', requireAuth, controller.logSet);
  router.post('/sessions/:id/complete', requireAuth, controller.completeSession);
  router.get('/sessions', requireAuth, controller.getSessions);

  return router;
}
