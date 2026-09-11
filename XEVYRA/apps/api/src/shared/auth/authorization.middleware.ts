import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@xevyra/domain';
import { AppError } from '../errors/app-error.js';

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized('Authentication required to access this resource.'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        AppError.forbidden(
          `Insufficient permissions. Required role: [${allowedRoles.join(', ')}], Current role: ${req.user.role}`
        )
      );
      return;
    }

    next();
  };
}

export function requireOwnership(paramName: string = 'userId') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized('Authentication required to verify ownership.'));
      return;
    }

    // Admins can bypass individual ownership restrictions for support operations
    if (req.user.role === 'ADMIN') {
      next();
      return;
    }

    const targetUserId = req.params[paramName];
    if (!targetUserId) {
      next(AppError.badRequest(`Missing target resource owner parameter: '${paramName}'`));
      return;
    }

    if (targetUserId !== req.user.userId) {
      next(AppError.forbidden('Forbidden: You do not have ownership permission for this resource.'));
      return;
    }

    next();
  };
}
