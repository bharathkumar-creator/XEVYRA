import { Entity, ValueObject } from '../common/entity.js';
import { DomainError, Result } from '../common/result.js';

export type ActivityLevel = 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE';
export type PrimaryGoal = 'FAT_LOSS' | 'MAINTENANCE' | 'MUSCLE_GAIN';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type UnitSystem = 'METRIC' | 'IMPERIAL';

export interface FitnessGoalProps {
  primaryGoal: PrimaryGoal;
  targetWeightKg?: number;
  weeklyGoalRateKg?: number;
}

export class FitnessGoal extends ValueObject<FitnessGoalProps> {
  get primaryGoal(): PrimaryGoal {
    return this.props.primaryGoal;
  }
  get targetWeightKg(): number | undefined {
    return this.props.targetWeightKg;
  }
  get weeklyGoalRateKg(): number | undefined {
    return this.props.weeklyGoalRateKg;
  }

  private constructor(props: FitnessGoalProps) {
    super(props);
  }

  public static create(props: FitnessGoalProps): Result<FitnessGoal, DomainError> {
    if (props.targetWeightKg !== undefined && (props.targetWeightKg <= 20 || props.targetWeightKg >= 500)) {
      return Result.fail(new DomainError('Target weight must be between 20kg and 500kg', 'INVALID_TARGET_WEIGHT'));
    }
    return Result.ok(new FitnessGoal(props));
  }
}

export interface WeightLogProps {
  userId: string;
  weightKg: number;
  loggedAt: Date;
  note?: string;
  source: 'MANUAL' | 'SCALE_INTEGRATION';
}

export class WeightLog extends Entity<WeightLogProps> {
  get userId(): string {
    return this.props.userId;
  }
  get weightKg(): number {
    return this.props.weightKg;
  }
  get loggedAt(): Date {
    return this.props.loggedAt;
  }
  get note(): string | undefined {
    return this.props.note;
  }
  get source(): 'MANUAL' | 'SCALE_INTEGRATION' {
    return this.props.source;
  }

  private constructor(id: string, props: WeightLogProps) {
    super(id, props);
  }

  public static create(id: string, props: WeightLogProps): Result<WeightLog, DomainError> {
    if (!props.userId) {
      return Result.fail(new DomainError('User ID is required for weight log', 'INVALID_USER_ID'));
    }
    if (props.weightKg <= 20 || props.weightKg >= 500) {
      return Result.fail(new DomainError('Weight must be between 20kg and 500kg', 'INVALID_WEIGHT'));
    }
    return Result.ok(new WeightLog(id, props));
  }
}

export interface ProfileProps {
  userId: string;
  gender: Gender;
  birthDate: Date;
  heightCm: number;
  currentWeightKg: number;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  unitSystem: UnitSystem;
  calorieTargetOverride?: number;
  proteinTargetGramsOverride?: number;
  fatTargetGramsOverride?: number;
  carbTargetGramsOverride?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Profile extends Entity<ProfileProps> {
  get userId(): string {
    return this.props.userId;
  }
  get gender(): Gender {
    return this.props.gender;
  }
  get birthDate(): Date {
    return this.props.birthDate;
  }
  get heightCm(): number {
    return this.props.heightCm;
  }
  get currentWeightKg(): number {
    return this.props.currentWeightKg;
  }
  get activityLevel(): ActivityLevel {
    return this.props.activityLevel;
  }
  get goal(): FitnessGoal {
    return this.props.goal;
  }
  get unitSystem(): UnitSystem {
    return this.props.unitSystem;
  }

  private constructor(id: string, props: ProfileProps) {
    super(id, props);
  }

  public static create(id: string, props: ProfileProps): Result<Profile, DomainError> {
    if (!props.userId) {
      return Result.fail(new DomainError('User ID is required for profile', 'INVALID_USER_ID'));
    }
    if (props.heightCm <= 50 || props.heightCm >= 300) {
      return Result.fail(new DomainError('Height must be between 50cm and 300cm', 'INVALID_HEIGHT'));
    }
    if (props.currentWeightKg <= 20 || props.currentWeightKg >= 500) {
      return Result.fail(new DomainError('Weight must be between 20kg and 500kg', 'INVALID_WEIGHT'));
    }
    return Result.ok(new Profile(id, props));
  }
}

export interface IProfileRepository {
  findByUserId(userId: string): Promise<Profile | null>;
  save(profile: Profile): Promise<void>;
  saveWeightLog(log: WeightLog): Promise<void>;
  getWeightLogs(userId: string, fromDate?: Date, toDate?: Date): Promise<WeightLog[]>;
}
