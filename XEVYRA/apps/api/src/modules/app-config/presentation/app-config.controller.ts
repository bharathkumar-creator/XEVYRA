import { Request, Response, NextFunction } from 'express';
import { ApiEnv } from '@xevyra/config';
import { AppConfigResponse } from '@xevyra/contracts';
import { AppError } from '../../../shared/errors/app-error.js';

export class AppConfigController {
  constructor(private config: ApiEnv) {}

  public getAppConfig = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const webAppUrl = this.config.WEB_APP_URL;
      if (!webAppUrl || webAppUrl.trim().length === 0) {
        throw AppError.internal('Web Application URL is not configured on the server');
      }

      const response: AppConfigResponse = {
        webAppUrl: webAppUrl.trim(),
        version: '1.0.0',
        environment: this.config.NODE_ENV,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
