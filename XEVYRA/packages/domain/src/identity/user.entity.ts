import { Entity } from '../common/entity.js';
import { DomainError, Result } from '../common/result.js';
import { Email } from './email.vo.js';

export type UserRole = 'USER' | 'TRAINER' | 'ADMIN';

export interface UserProps {
  firebaseUid: string;
  email: Email;
  displayName: string;
  avatarUrl?: string;
  timezone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends Entity<UserProps> {
  get firebaseUid(): string {
    return this.props.firebaseUid;
  }

  get email(): Email {
    return this.props.email;
  }

  get displayName(): string {
    return this.props.displayName;
  }

  get avatarUrl(): string | undefined {
    return this.props.avatarUrl;
  }

  get timezone(): string {
    return this.props.timezone;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  private constructor(id: string, props: UserProps) {
    super(id, props);
  }

  public static create(
    props: {
      id: string;
      firebaseUid: string;
      email: Email;
      displayName: string;
      avatarUrl?: string;
      timezone?: string;
      role?: UserRole;
      isActive?: boolean;
      createdAt?: Date;
      updatedAt?: Date;
    }
  ): Result<User, DomainError> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new DomainError('User ID is required', 'INVALID_USER_ID'));
    }

    if (!props.firebaseUid || props.firebaseUid.trim().length === 0) {
      return Result.fail(new DomainError('Firebase UID is required', 'INVALID_FIREBASE_UID'));
    }

    if (!props.displayName || props.displayName.trim().length === 0) {
      return Result.fail(new DomainError('Display name is required', 'INVALID_DISPLAY_NAME'));
    }

    const now = new Date();
    const user = new User(props.id, {
      firebaseUid: props.firebaseUid,
      email: props.email,
      displayName: props.displayName.trim(),
      avatarUrl: props.avatarUrl,
      timezone: props.timezone || 'UTC',
      role: props.role || 'USER',
      isActive: props.isActive !== undefined ? props.isActive : true,
      createdAt: props.createdAt || now,
      updatedAt: props.updatedAt || now,
    });

    return Result.ok(user);
  }

  public updateProfile(displayName: string, avatarUrl?: string, timezone?: string): Result<void, DomainError> {
    if (!displayName || displayName.trim().length === 0) {
      return Result.fail(new DomainError('Display name cannot be empty', 'INVALID_DISPLAY_NAME'));
    }

    (this.props as { displayName: string }).displayName = displayName.trim();
    if (avatarUrl !== undefined) {
      (this.props as { avatarUrl?: string }).avatarUrl = avatarUrl;
    }
    if (timezone) {
      (this.props as { timezone: string }).timezone = timezone;
    }
    (this.props as { updatedAt: Date }).updatedAt = new Date();

    return Result.ok(undefined);
  }
}
