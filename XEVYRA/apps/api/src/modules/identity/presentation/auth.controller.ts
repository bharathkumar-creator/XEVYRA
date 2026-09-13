import { Request, Response, NextFunction } from 'express';
import { IUserRepository, User, Email, IAuthAuditRepository } from '@xevyra/domain';
import { SessionResponse, CurrentUserResponse, LogoutResponse, UserDto } from '@xevyra/contracts';
import { generateId } from '@xevyra/shared';
import { AppError } from '../../../shared/errors/app-error.js';
import { AuthAuditLogger } from '../../../shared/logging/auth-audit.logger.js';
import { MongoProfileRepository } from '../../profile/infrastructure/mongo-profile.repository.js';
import { MongoNutritionRepository } from '../../nutrition/infrastructure/mongo-nutrition.repository.js';

export class AuthController {
  private auditLogger: AuthAuditLogger;

  constructor(
    private userRepository: IUserRepository,
    auditRepository?: IAuthAuditRepository,
    private profileRepository?: MongoProfileRepository,
    private nutritionRepository?: MongoNutritionRepository
  ) {
    this.auditLogger = new AuthAuditLogger(auditRepository);
  }

  private mapToDto(user: User): UserDto {
    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email.value,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      timezone: user.timezone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * POST /api/v1/auth/session
   * Establishes a verified session from the authenticated Firebase ID token
   */
  public createSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;
      if (!authUser) {
        throw AppError.unauthorized();
      }

      const { displayName, avatarUrl, timezone, clientPlatform, appVersion } = req.body || {};

      let user = await this.userRepository.findByFirebaseUid(authUser.firebaseUid);
      let isNewUser = false;

      if (!user) {
        isNewUser = true;
        const emailResult = Email.create(authUser.email);
        if (emailResult.isFailure) {
          throw AppError.badRequest(emailResult.error?.message || 'Invalid user email');
        }

        const newUserResult = User.create({
          id: generateId('usr'),
          firebaseUid: authUser.firebaseUid,
          email: emailResult.getValue(),
          displayName: displayName || authUser.displayName || 'Athlete',
          avatarUrl: avatarUrl,
          timezone: timezone || 'UTC',
          role: 'USER',
          isActive: true,
        });

        if (newUserResult.isFailure) {
          throw AppError.badRequest(newUserResult.error?.message || 'Failed to create user');
        }

        user = newUserResult.getValue();
        await this.userRepository.save(user);

        // Provision User Profile
        if (this.profileRepository && typeof this.profileRepository.save === 'function') {
          await this.profileRepository.save({
            id: `upr_${user.id.replace(/^usr_/, '')}`,
            userId: user.id,
            heightCm: 180,
            currentWeightKg: 78.2,
            gender: 'MALE',
            activityLevel: 'ATHLETE',
            weeklyWorkoutTarget: 4,
            trainingExperience: 'ADVANCED',
            preferredCuisine: 'AMERICAN',
            preferredUnits: 'METRIC',
            timezone: user.timezone || 'UTC',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        // Provision Nutrition Targets
        if (this.nutritionRepository && typeof this.nutritionRepository.saveTargets === 'function') {
          await this.nutritionRepository.saveTargets({
            _id: `ntr_${user.id.replace(/^usr_/, '')}`,
            ntrUserId: user.id,
            ntrTargetCalories: 2600,
            ntrTargetProteinGrams: 160,
            ntrTargetCarbsGrams: 280,
            ntrTargetFatGrams: 75,
            ntrEffectiveFrom: new Date(),
            ntrCreatedAt: new Date(),
            ntrUpdatedAt: new Date(),
          });
        }
      } else {
        // Update profile fields if provided
        if (displayName || avatarUrl || timezone) {
          user.updateProfile(displayName || user.displayName, avatarUrl, timezone);
          await this.userRepository.save(user);
        }
      }

      // Record successful login audit event
      await this.auditLogger.logEvent({
        eventType: 'LOGIN_SUCCESS',
        userId: user.id,
        firebaseUid: user.firebaseUid,
        ipAddress: req.ip,
        userAgent: req.header('user-agent'),
        metadata: {
          clientPlatform: clientPlatform || 'WEB',
          appVersion,
          isNewUser,
        },
      });

      // Set secure session cookie for Web clients
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('xevyra_session', user.id, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      const response: SessionResponse = {
        user: this.mapToDto(user),
        isNewUser,
        sessionToken: user.id,
      };

      res.status(isNewUser ? 201 : 200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/auth/me
   * Retrieves the current authenticated application user
   */
  public getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;
      if (!authUser) {
        throw AppError.unauthorized();
      }

      const user = await this.userRepository.findByFirebaseUid(authUser.firebaseUid);
      if (!user) {
        throw AppError.notFound('Application user profile not found for this account.');
      }

      const response: CurrentUserResponse = {
        user: this.mapToDto(user),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/auth/logout
   * Invalidates session and clears cookies
   */
  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;

      if (authUser) {
        await this.auditLogger.logEvent({
          eventType: 'LOGOUT',
          userId: authUser.userId,
          firebaseUid: authUser.firebaseUid,
          ipAddress: req.ip,
          userAgent: req.header('user-agent'),
        });
      }

      // Clear session cookie
      res.clearCookie('xevyra_session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/',
      });

      const response: LogoutResponse = {
        success: true,
        message: 'Successfully logged out.',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/auth/sync (Legacy alias for sync)
   */
  public syncUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return this.createSession(req, res, next);
  };
}
