import { Router } from 'express';
import { CreateSessionRequestSchema } from '@xevyra/contracts';
import { AuthController } from './auth.controller.js';
import { validate } from '../../../shared/validation/validate.middleware.js';
import { createAuthMiddleware } from '../../../shared/auth/firebase-auth.middleware.js';
import { IFirebaseAuthService } from '../../../shared/auth/firebase-admin.client.js';
import { IUserRepository, IAuthAuditRepository } from '@xevyra/domain';
import { MongoProfileRepository } from '../../profile/infrastructure/mongo-profile.repository.js';
import { MongoNutritionRepository } from '../../nutrition/infrastructure/mongo-nutrition.repository.js';

export function createAuthRouter(
  userRepository: IUserRepository,
  authService?: IFirebaseAuthService,
  auditRepository?: IAuthAuditRepository,
  profileRepository?: MongoProfileRepository,
  nutritionRepository?: MongoNutritionRepository
): Router {
  const router = Router();
  const controller = new AuthController(userRepository, auditRepository, profileRepository, nutritionRepository);
  const authMiddleware = createAuthMiddleware(authService, userRepository);

  // POST /api/v1/auth/session - Establish session from Firebase ID Token
  router.post(
    '/session',
    authMiddleware,
    validate({ body: CreateSessionRequestSchema }),
    controller.createSession
  );

  // POST /api/v1/auth/sync - Sync alias
  router.post(
    '/sync',
    authMiddleware,
    validate({ body: CreateSessionRequestSchema }),
    controller.syncUser
  );

  // GET /api/v1/auth/me - Retrieve current authenticated user
  router.get(
    '/me',
    authMiddleware,
    controller.getCurrentUser
  );

  // POST /api/v1/auth/logout - Invalidate session & clear cookies
  router.post(
    '/logout',
    authMiddleware,
    controller.logout
  );

  return router;
}
