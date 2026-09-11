import { ValueObject } from '../common/entity.js';
import { DomainError, Result } from '../common/result.js';

export interface OneRepMaxRecordProps {
  exerciseId: string;
  weightKg: number;
  calculated1RMKg: number;
  achievedAt: Date;
}

export class OneRepMaxRecord extends ValueObject<OneRepMaxRecordProps> {
  get exerciseId(): string {
    return this.props.exerciseId;
  }
  get calculated1RMKg(): number {
    return this.props.calculated1RMKg;
  }

  private constructor(props: OneRepMaxRecordProps) {
    super(props);
  }

  public static calculateBrzycki(weightKg: number, reps: number): number {
    if (reps === 1) return weightKg;
    if (reps >= 37) return weightKg;
    // Brzycki formula: Weight / (1.0278 - 0.0278 * reps)
    const result = weightKg / (1.0278 - 0.0278 * reps);
    return Math.round(result * 10) / 10;
  }

  public static create(props: {
    exerciseId: string;
    weightKg: number;
    reps: number;
    achievedAt?: Date;
  }): Result<OneRepMaxRecord, DomainError> {
    if (!props.exerciseId) {
      return Result.fail(new DomainError('Exercise ID is required', 'INVALID_EXERCISE_ID'));
    }
    const calculated = OneRepMaxRecord.calculateBrzycki(props.weightKg, props.reps);
    return Result.ok(
      new OneRepMaxRecord({
        exerciseId: props.exerciseId,
        weightKg: props.weightKg,
        calculated1RMKg: calculated,
        achievedAt: props.achievedAt || new Date(),
      })
    );
  }
}

export interface IProgressRepository {
  getPersonalRecords(userId: string): Promise<OneRepMaxRecord[]>;
  savePersonalRecord(userId: string, record: OneRepMaxRecord): Promise<void>;
}
