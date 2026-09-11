import { Entity, ValueObject } from '../common/entity.js';
import { DomainError, Result } from '../common/result.js';

export type SetType = 'NORMAL' | 'WARMUP' | 'DROPSET' | 'FAILURE';

export interface WorkoutSetProps {
  setNumber: number;
  type: SetType;
  weightKg: number;
  reps: number;
  rpe?: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export class WorkoutSet extends ValueObject<WorkoutSetProps> {
  get setNumber(): number {
    return this.props.setNumber;
  }
  get type(): SetType {
    return this.props.type;
  }
  get weightKg(): number {
    return this.props.weightKg;
  }
  get reps(): number {
    return this.props.reps;
  }
  get rpe(): number | undefined {
    return this.props.rpe;
  }
  get isCompleted(): boolean {
    return this.props.isCompleted;
  }

  private constructor(props: WorkoutSetProps) {
    super(props);
  }

  public static create(props: WorkoutSetProps): Result<WorkoutSet, DomainError> {
    if (props.setNumber <= 0) {
      return Result.fail(new DomainError('Set number must be positive', 'INVALID_SET_NUMBER'));
    }
    if (props.weightKg < 0) {
      return Result.fail(new DomainError('Weight cannot be negative', 'INVALID_WEIGHT'));
    }
    if (props.reps < 0) {
      return Result.fail(new DomainError('Reps cannot be negative', 'INVALID_REPS'));
    }
    if (props.rpe !== undefined && (props.rpe < 1 || props.rpe > 10)) {
      return Result.fail(new DomainError('RPE must be between 1 and 10', 'INVALID_RPE'));
    }
    return Result.ok(new WorkoutSet(props));
  }
}

export interface WorkoutExerciseProps {
  exerciseId: string;
  name: string;
  order: number;
  notes?: string;
  sets: WorkoutSet[];
}

export class WorkoutExercise extends ValueObject<WorkoutExerciseProps> {
  get exerciseId(): string {
    return this.props.exerciseId;
  }
  get name(): string {
    return this.props.name;
  }
  get order(): number {
    return this.props.order;
  }
  get sets(): WorkoutSet[] {
    return this.props.sets;
  }

  private constructor(props: WorkoutExerciseProps) {
    super(props);
  }

  public static create(props: WorkoutExerciseProps): Result<WorkoutExercise, DomainError> {
    if (!props.exerciseId || !props.name) {
      return Result.fail(new DomainError('Exercise ID and name are required', 'INVALID_EXERCISE'));
    }
    return Result.ok(new WorkoutExercise(props));
  }
}

export type WorkoutStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface WorkoutSessionProps {
  userId: string;
  clientMutationId?: string;
  routineName: string;
  startedAt: Date;
  endedAt?: Date;
  status: WorkoutStatus;
  notes?: string;
  exercises: WorkoutExercise[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class WorkoutSession extends Entity<WorkoutSessionProps> {
  get userId(): string {
    return this.props.userId;
  }
  get routineName(): string {
    return this.props.routineName;
  }
  get startedAt(): Date {
    return this.props.startedAt;
  }
  get endedAt(): Date | undefined {
    return this.props.endedAt;
  }
  get status(): WorkoutStatus {
    return this.props.status;
  }
  get version(): number {
    return this.props.version;
  }
  get exercises(): WorkoutExercise[] {
    return this.props.exercises;
  }

  private constructor(id: string, props: WorkoutSessionProps) {
    super(id, props);
  }

  public static create(id: string, props: WorkoutSessionProps): Result<WorkoutSession, DomainError> {
    if (!props.userId) {
      return Result.fail(new DomainError('User ID is required for workout session', 'INVALID_USER_ID'));
    }
    if (!props.routineName || props.routineName.trim().length === 0) {
      return Result.fail(new DomainError('Routine name is required', 'INVALID_ROUTINE_NAME'));
    }
    return Result.ok(new WorkoutSession(id, props));
  }

  public completeSession(endedAt: Date = new Date()): Result<void, DomainError> {
    if (this.props.status === 'COMPLETED') {
      return Result.fail(new DomainError('Session is already completed', 'ALREADY_COMPLETED'));
    }
    (this.props as { status: WorkoutStatus }).status = 'COMPLETED';
    (this.props as { endedAt: Date }).endedAt = endedAt;
    (this.props as { version: number }).version += 1;
    (this.props as { updatedAt: Date }).updatedAt = new Date();
    return Result.ok(undefined);
  }
}

export interface ITrainingRepository {
  findSessionById(id: string, userId: string): Promise<WorkoutSession | null>;
  findRecentSessions(userId: string, limit: number): Promise<WorkoutSession[]>;
  saveSession(session: WorkoutSession): Promise<void>;
}
