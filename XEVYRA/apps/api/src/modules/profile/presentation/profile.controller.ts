import { Request, Response, NextFunction } from 'express';
import { IUserRepository } from '@xevyra/domain';
import { UpdateProfileRequestSchema } from '@xevyra/contracts';
import { MongoProfileRepository } from '../infrastructure/mongo-profile.repository.js';
import { AppError } from '../../../shared/errors/app-error.js';

export class ProfileController {
  constructor(
    private userRepository: IUserRepository,
    private profileRepository: MongoProfileRepository
  ) {}

  public getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;
      if (!authUser) {
        throw AppError.unauthorized('Authentication required to view profile');
      }

      const user = await this.userRepository.findById(authUser.userId);
      if (!user) {
        throw AppError.notFound('Athlete user record not found');
      }

      let profileData = await this.profileRepository.findByUserId(user.id);
      if (!profileData) {
        // Initialize default profile
        profileData = {
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
        };
        await this.profileRepository.save(profileData);
      }

      res.status(200).json({
        user: {
          id: user.id,
          firebaseUid: user.firebaseUid,
          email: user.email.value,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
        profile: {
          userId: profileData.userId,
          heightCm: profileData.heightCm,
          birthDate: profileData.birthDate,
          gender: profileData.gender,
          activityLevel: profileData.activityLevel,
          weeklyWorkoutTarget: profileData.weeklyWorkoutTarget,
          trainingExperience: profileData.trainingExperience,
          preferredCuisine: profileData.preferredCuisine,
          preferredUnits: profileData.preferredUnits,
          timezone: profileData.timezone,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;
      if (!authUser) {
        throw AppError.unauthorized('Authentication required to update profile');
      }

      const validated = UpdateProfileRequestSchema.parse(req.body);
      const user = await this.userRepository.findById(authUser.userId);
      if (!user) {
        throw AppError.notFound('Athlete record not found');
      }

      if (validated.displayName || validated.avatarUrl || validated.timezone) {
        user.updateProfile(
          validated.displayName || user.displayName,
          validated.avatarUrl !== undefined ? validated.avatarUrl : user.avatarUrl,
          validated.timezone || user.timezone
        );
        await this.userRepository.save(user);
      }

      let profileData = await this.profileRepository.findByUserId(user.id);
      if (!profileData) {
        profileData = {
          id: `upr_${user.id.replace(/^usr_/, '')}`,
          userId: user.id,
          heightCm: validated.heightCm || 180,
          currentWeightKg: validated.currentWeightKg || 78.2,
          gender: validated.gender || 'MALE',
          activityLevel: validated.activityLevel || 'ATHLETE',
          weeklyWorkoutTarget: validated.weeklyWorkoutTarget || 4,
          trainingExperience: 'ADVANCED',
          preferredCuisine: validated.preferredCuisine || 'AMERICAN',
          preferredUnits: validated.preferredUnits || 'METRIC',
          timezone: validated.timezone || user.timezone || 'UTC',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      } else {
        if (validated.heightCm !== undefined) profileData.heightCm = validated.heightCm;
        if (validated.currentWeightKg !== undefined) profileData.currentWeightKg = validated.currentWeightKg;
        if (validated.gender !== undefined) profileData.gender = validated.gender;
        if (validated.activityLevel !== undefined) profileData.activityLevel = validated.activityLevel;
        if (validated.weeklyWorkoutTarget !== undefined) profileData.weeklyWorkoutTarget = validated.weeklyWorkoutTarget;
        if (validated.preferredCuisine !== undefined) profileData.preferredCuisine = validated.preferredCuisine;
        if (validated.preferredUnits !== undefined) profileData.preferredUnits = validated.preferredUnits;
        if (validated.timezone !== undefined) profileData.timezone = validated.timezone;
        profileData.updatedAt = new Date();
      }

      await this.profileRepository.save(profileData);

      res.status(200).json({
        user: {
          id: user.id,
          firebaseUid: user.firebaseUid,
          email: user.email.value,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
        profile: {
          userId: profileData.userId,
          heightCm: profileData.heightCm,
          birthDate: profileData.birthDate,
          gender: profileData.gender,
          activityLevel: profileData.activityLevel,
          weeklyWorkoutTarget: profileData.weeklyWorkoutTarget,
          trainingExperience: profileData.trainingExperience,
          preferredCuisine: profileData.preferredCuisine,
          preferredUnits: profileData.preferredUnits,
          timezone: profileData.timezone,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
