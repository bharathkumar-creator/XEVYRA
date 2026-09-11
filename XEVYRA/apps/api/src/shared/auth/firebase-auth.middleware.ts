import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@xevyra/domain';
import { AppError } from '../errors/app-error.js';
import { IFirebaseAuthService, FirebaseAuthService } from './firebase-admin.client.js';
import { IUserRepository } from '@xevyra/domain';

export interface AuthenticatedUserContext {
  userId: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUserContext;
    }
  }
}

export function createAuthMiddleware(
  authService: IFirebaseAuthService = FirebaseAuthService.getInstance(),
  userRepository?: IUserRepository
) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.header('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw AppError.unauthorized('Missing or invalid Authorization header. Expected Bearer token.');
      }

      const token = authHeader.substring(7).trim();
      if (!token) {
        throw AppError.unauthorized('Empty Bearer token provided.');
      }

      let decoded;
      try {
        decoded = await authService.verifyIdToken(token);
      } catch (err: unknown) {
        throw AppError.unauthorized('Invalid or expired authentication token.');
      }

      if (!decoded.uid) {
        throw AppError.unauthorized('Token verification failed: No UID present.');
      }

      // If user repository is injected, find or create application user
      let appUser = userRepository ? await userRepository.findByFirebaseUid(decoded.uid) : null;

      req.user = {
        userId: appUser ? appUser.id : `usr_${decoded.uid}`,
        firebaseUid: decoded.uid,
        email: decoded.email || `${decoded.uid}@xevyra.fit`,
        displayName: appUser ? appUser.displayName : decoded.name || 'Athlete',
        role: appUser ? appUser.role : 'USER',
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}
