import express, { Express, Router } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { ApiEnv } from '@xevyra/config';
import { IUserRepository, IAuthAuditRepository } from '@xevyra/domain';
import { MongoDatabase } from './shared/database/mongo.client.js';
import { IFirebaseAuthService } from './shared/auth/firebase-admin.client.js';
import { requestContextMiddleware } from './shared/http/request-context.middleware.js';
import { errorHandlerMiddleware } from './shared/errors/error.middleware.js';
import { AppError } from './shared/errors/app-error.js';
import { createAuthRouter } from './modules/identity/presentation/auth.routes.js';
import { createHealthRouter } from './modules/health/presentation/health.routes.js';

export interface AppDependencies {
  config: ApiEnv;
  db: MongoDatabase;
  userRepository: IUserRepository;
  authService?: IFirebaseAuthService;
  auditRepository?: IAuthAuditRepository;
  customRouter?: { path: string; router: Router };
}

export function createApp(deps: AppDependencies): Express {
  const app = express();

  // Security & Core Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: deps.config.CORS_ORIGIN.split(','),
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(requestContextMiddleware);

  // Health Router
  app.use('/api/v1', createHealthRouter(deps.db, deps.authService));

  // Identity Router
  app.use(
    '/api/v1/auth',
    createAuthRouter(deps.userRepository, deps.authService, deps.auditRepository)
  );

  // Optional Custom/Extension Router (mounted before 404 handler)
  if (deps.customRouter) {
    app.use(deps.customRouter.path, deps.customRouter.router);
  }

  // 404 Route Handler
  app.use((_req, _res, next) => {
    next(AppError.notFound('The requested endpoint does not exist.'));
  });

  // Global Error Handler
  app.use(errorHandlerMiddleware);

  return app;
}
