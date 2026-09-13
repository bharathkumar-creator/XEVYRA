import { z } from 'zod';

export const UserProfileSchema = z.object({
  userId: z.string(),
  heightCm: z.number().min(50).max(300),
  birthDate: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  activityLevel: z.enum(['SEDENTARY', 'LIGHT', 'MODERATE', 'HEAVY', 'ATHLETE']),
  weeklyWorkoutTarget: z.number().min(1).max(14).default(4),
  trainingExperience: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  preferredCuisine: z.enum(['AMERICAN', 'NORTH_INDIAN', 'SOUTH_INDIAN', 'MEDITERRANEAN', 'ASIAN']).default('AMERICAN'),
  preferredUnits: z.enum(['METRIC', 'IMPERIAL']).default('METRIC'),
  timezone: z.string().default('UTC'),
});
export type UserProfileDto = z.infer<typeof UserProfileSchema>;

export const UpdateProfileRequestSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  heightCm: z.number().min(50).max(300).optional(),
  currentWeightKg: z.number().min(20).max(500).optional(),
  birthDate: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  activityLevel: z.enum(['SEDENTARY', 'LIGHT', 'MODERATE', 'HEAVY', 'ATHLETE']).optional(),
  weeklyWorkoutTarget: z.number().min(1).max(14).optional(),
  preferredCuisine: z.enum(['AMERICAN', 'NORTH_INDIAN', 'SOUTH_INDIAN', 'MEDITERRANEAN', 'ASIAN']).optional(),
  preferredUnits: z.enum(['METRIC', 'IMPERIAL']).optional(),
  timezone: z.string().optional(),
});
export type UpdateProfileRequestDto = z.infer<typeof UpdateProfileRequestSchema>;

export const ProfileResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    firebaseUid: z.string(),
    email: z.string().email(),
    displayName: z.string(),
    avatarUrl: z.string().optional(),
    role: z.enum(['USER', 'ADMIN', 'COACH']),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
  profile: UserProfileSchema,
});
export type ProfileResponseDto = z.infer<typeof ProfileResponseSchema>;
export type UserProfileResponseDto = ProfileResponseDto;
