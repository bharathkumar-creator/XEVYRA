import { Router } from 'express';
import { IUserRepository } from '@xevyra/domain';
import { MongoProfileRepository } from '../infrastructure/mongo-profile.repository.js';
import { ProfileController } from './profile.controller.js';
import { IFirebaseAuthService } from '../../../shared/auth/firebase-admin.client.js';
import { createAuthMiddleware } from '../../../shared/auth/firebase-auth.middleware.js';

export function createProfileRouter(
  userRepository: IUserRepository,
  profileRepository: MongoProfileRepository,
  authService?: IFirebaseAuthService
): Router {
  const router = Router();
  const controller = new ProfileController(userRepository, profileRepository);
  const requireAuth = createAuthMiddleware(authService, userRepository);

  router.get('/', requireAuth, controller.getProfile);
  router.patch('/', requireAuth, controller.updateProfile);

  return router;
}
