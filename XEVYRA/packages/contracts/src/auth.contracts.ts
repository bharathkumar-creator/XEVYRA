import { z } from 'zod';

export const UserRoleSchema = z.enum(['USER', 'TRAINER', 'ADMIN']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserDtoSchema = z.object({
  id: z.string(),
  firebaseUid: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  avatarUrl: z.string().url().optional(),
  timezone: z.string(),
  role: UserRoleSchema,
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserDto = z.infer<typeof UserDtoSchema>;

export const ClientPlatformSchema = z.enum(['WEB', 'FLUTTER_WEBVIEW', 'NATIVE_MOBILE']);
export type ClientPlatform = z.infer<typeof ClientPlatformSchema>;

export const CreateSessionRequestSchema = z.object({
  clientPlatform: ClientPlatformSchema.default('WEB'),
  appVersion: z.string().optional(),
  displayName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  timezone: z.string().optional(),
});

export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;

export const SessionResponseSchema = z.object({
  user: UserDtoSchema,
  isNewUser: z.boolean(),
  sessionToken: z.string().optional(),
});

export type SessionResponse = z.infer<typeof SessionResponseSchema>;

export const CurrentUserResponseSchema = z.object({
  user: UserDtoSchema,
});

export type CurrentUserResponse = z.infer<typeof CurrentUserResponseSchema>;

export const LogoutResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

export const SyncAuthRequestSchema = z.object({
  displayName: z.string().min(1).max(100),
  avatarUrl: z.string().url().optional(),
  timezone: z.string().optional(),
});

export type SyncAuthRequest = z.infer<typeof SyncAuthRequestSchema>;

export const SyncAuthResponseSchema = z.object({
  user: UserDtoSchema,
  isNewUser: z.boolean(),
});

export type SyncAuthResponse = z.infer<typeof SyncAuthResponseSchema>;
