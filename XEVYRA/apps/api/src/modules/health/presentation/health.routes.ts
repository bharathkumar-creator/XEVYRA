import { Router } from 'express';
import { HealthController } from './health.controller.js';
import { MongoDatabase } from '../../../shared/database/mongo.client.js';
import { IFirebaseAuthService } from '../../../shared/auth/firebase-admin.client.js';

export function createHealthRouter(
  db: MongoDatabase,
  authService?: IFirebaseAuthService
): Router {
  const router = Router();
  const controller = new HealthController(db, authService);

  router.get('/health', controller.getHealth);

  return router;
}
