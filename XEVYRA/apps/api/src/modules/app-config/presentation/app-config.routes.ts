import { Router } from 'express';
import { ApiEnv } from '@xevyra/config';
import { AppConfigController } from './app-config.controller.js';

export function createAppConfigRouter(config: ApiEnv): Router {
  const router = Router();
  const controller = new AppConfigController(config);

  // GET /api/v1/app/config - Public bootstrap endpoint for mobile shell & clients
  router.get('/config', controller.getAppConfig);

  return router;
}
