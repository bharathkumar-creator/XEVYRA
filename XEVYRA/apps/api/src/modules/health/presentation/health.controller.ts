import { Request, Response } from 'express';
import { HealthCheckResponse } from '@xevyra/contracts';
import { MongoDatabase } from '../../../shared/database/mongo.client.js';
import { IFirebaseAuthService } from '../../../shared/auth/firebase-admin.client.js';

export class HealthController {
  constructor(
    private db: MongoDatabase,
    private authService?: IFirebaseAuthService
  ) {}

  public getHealth = async (_req: Request, res: Response): Promise<void> => {
    const isDbHealthy = await this.db.isHealthy();
    const isAuthReady = this.authService?.isInitialized() ?? false;

    const status = isDbHealthy ? 'healthy' : 'degraded';

    const payload: HealthCheckResponse = {
      status,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: isDbHealthy ? 'connected' : 'disconnected',
        auth: isAuthReady ? 'ready' : 'uninitialized',
      },
    };

    res.status(isDbHealthy ? 200 : 503).json(payload);
  };
}
