import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
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

  // Handle AppError
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

  // Handle Zod Validation Errors
  if (err.name === 'ZodError' || err instanceof ZodError || 'issues' in (err as any)) {
    const zodErr = err as ZodError;
    const details = (zodErr.issues || []).map((issue) => ({
      field: (issue.path || []).join('.'),
      message: issue.message,
      code: issue.code,
    }));

    Logger.warn(`[${requestId}] Validation Error: ${err.message}`, {
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      details,
      path: req.path,
      method: req.method,
    });

    const responsePayload: ApiErrorPayload = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Please check the entered values.',
        requestId,
        details,
      },
    };

    res.status(400).json(responsePayload);
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
