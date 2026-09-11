import { Request, Response, NextFunction } from 'express';
import { ApiErrorPayload } from '@xevyra/contracts';
import { AppError } from './app-error.js';
import { Logger } from '../logging/logger.js';

export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.requestId || 'req_unknown';

  if (err instanceof AppError) {
    Logger.warn(`[${requestId}] AppError: ${err.message}`, {
      code: err.code,
      statusCode: err.statusCode,
      details: err.details,
      path: req.path,
      method: req.method,
    });

    const responsePayload: ApiErrorPayload = {
      error: {
        code: err.code,
        message: err.message,
        requestId,
        ...(err.details ? { details: err.details } : {}),
      },
    };

    res.status(err.statusCode).json(responsePayload);
    return;
  }

  // Unhandled / Internal Server Errors
  Logger.error(`[${requestId}] Unhandled Exception: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const responsePayload: ApiErrorPayload = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected internal error occurred. Please try again later.',
      requestId,
    },
  };

  res.status(500).json(responsePayload);
}
