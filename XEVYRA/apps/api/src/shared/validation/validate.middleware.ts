import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../errors/app-error.js';

interface ValidationTargets {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(schemas: ValidationTargets) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error: any) {
      if (error instanceof ZodError || error?.name === 'ZodError') {
        const zodErrors = error.errors || [];
        const details = zodErrors.map((err: any) => ({
          field: Array.isArray(err.path) ? err.path.join('.') : undefined,
          message: err.message,
          code: err.code,
        }));
        next(AppError.badRequest('Please check the entered values.', details));
      } else {
        next(error);
      }
    }
  };
}
