import { ValueObject } from '../common/entity.js';
import { DomainError, Result } from '../common/result.js';

export type GoalMode = 'DEFICIT' | 'MAINTENANCE' | 'SURPLUS';

export interface NutritionTargetProps {
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
  waterMl?: number;
  goalMode: GoalMode;
  calorieOffset: number; // e.g. -500 for deficit, 0 for maintenance, +300 for surplus
}

export class NutritionTarget extends ValueObject<NutritionTargetProps> {
  get dailyCalories(): number {
    return this.props.dailyCalories;
  }
  get proteinGrams(): number {
    return this.props.proteinGrams;
  }
  get carbsGrams(): number {
    return this.props.carbsGrams;
  }
  get fatGrams(): number {
    return this.props.fatGrams;
  }
  get fiberGrams(): number | undefined {
    return this.props.fiberGrams;
  }
  get waterMl(): number | undefined {
    return this.props.waterMl;
  }
  get goalMode(): GoalMode {
    return this.props.goalMode;
  }
  get calorieOffset(): number {
    return this.props.calorieOffset;
  }

  private constructor(props: NutritionTargetProps) {
    super(props);
  }

  public static create(props: NutritionTargetProps): Result<NutritionTarget, DomainError> {
    if (props.dailyCalories < 800 || props.dailyCalories > 8000) {
      return Result.fail(new DomainError('Daily calories must be between 800 and 8000 kcal', 'INVALID_TARGET_CALORIES'));
    }
    if (props.proteinGrams < 0 || props.carbsGrams < 0 || props.fatGrams < 0) {
      return Result.fail(new DomainError('Macro targets cannot be negative', 'INVALID_MACRO_TARGETS'));
    }
    return Result.ok(new NutritionTarget(props));
  }
}
