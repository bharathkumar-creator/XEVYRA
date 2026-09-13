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

// Routers
import { createAuthRouter } from './modules/identity/presentation/auth.routes.js';
import { createHealthRouter } from './modules/health/presentation/health.routes.js';
import { createProfileRouter } from './modules/profile/presentation/profile.routes.js';
import { createTrainingRouter } from './modules/training/presentation/training.routes.js';
import { createNutritionRouter } from './modules/nutrition/presentation/nutrition.routes.js';
import { createProgressRouter } from './modules/progress/presentation/progress.routes.js';
import { createDashboardRouter } from './modules/dashboard/presentation/dashboard.routes.js';
import { createAppConfigRouter } from './modules/app-config/presentation/app-config.routes.js';

// Repositories
import { MongoProfileRepository } from './modules/profile/infrastructure/mongo-profile.repository.js';
import { MongoTrainingRepository } from './modules/training/infrastructure/mongo-training.repository.js';
import { MongoNutritionRepository } from './modules/nutrition/infrastructure/mongo-nutrition.repository.js';
import { MongoProgressRepository } from './modules/progress/infrastructure/mongo-progress.repository.js';

export interface AppDependencies {
  config: ApiEnv;
  db: MongoDatabase;
  userRepository: IUserRepository;
  authService?: IFirebaseAuthService;
  auditRepository?: IAuthAuditRepository;
  profileRepository?: MongoProfileRepository;
  trainingRepository?: MongoTrainingRepository;
  nutritionRepository?: MongoNutritionRepository;
  progressRepository?: MongoProgressRepository;
  customRouter?: { path: string; router: Router };
}

export function createApp(deps: AppDependencies): Express {
  const app = express();

  // Initialize DB collections if repositories not explicitly passed
  let dbInstance: any = null;
  try {
    dbInstance = deps.db?.getDb();
  } catch {
    // Database might not be connected in isolated mock unit tests
  }

  const profileRepo = deps.profileRepository || (dbInstance ? new MongoProfileRepository(dbInstance) : ({} as any));
  const trainingRepo = deps.trainingRepository || (dbInstance ? new MongoTrainingRepository(dbInstance) : ({} as any));
  const progressRepo = deps.progressRepository || (dbInstance ? new MongoProgressRepository(dbInstance) : ({} as any));
  const nutritionRepo = deps.nutritionRepository || (dbInstance ? new MongoNutritionRepository(dbInstance) : ({} as any));

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

  // Health Routers (both /health and /api/v1/health for container/LB orchestrators)
  const healthRouter = createHealthRouter(deps.db, deps.authService);
  app.use('/', healthRouter);
  app.use('/api/v1', healthRouter);

  // Identity Router
  app.use(
    '/api/v1/auth',
    createAuthRouter(deps.userRepository, deps.authService, deps.auditRepository, profileRepo, nutritionRepo)
  );

  // Profile Router
  app.use(
    '/api/v1/profile',
    createProfileRouter(deps.userRepository, profileRepo, deps.authService)
  );

  // Dashboard Router
  app.use(
    '/api/v1/dashboard',
    createDashboardRouter(
      deps.userRepository,
      profileRepo,
      nutritionRepo,
      trainingRepo,
      progressRepo,
      deps.authService
    )
  );

  // Training / Workouts Router
  app.use(
    '/api/v1/workouts',
    createTrainingRouter(deps.userRepository, trainingRepo, deps.authService)
  );

  // Nutrition Router
  app.use(
    '/api/v1/nutrition',
    createNutritionRouter(deps.userRepository, nutritionRepo, profileRepo, progressRepo, deps.authService)
  );

  // Progress Router
  app.use(
    '/api/v1/progress',
    createProgressRouter(deps.userRepository, progressRepo, trainingRepo, profileRepo, deps.authService)
  );

  // App Bootstrap / Configuration Router
  app.use(
    '/api/v1/app',
    createAppConfigRouter(deps.config)
  );

  // Optional Custom/Extension Router
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
