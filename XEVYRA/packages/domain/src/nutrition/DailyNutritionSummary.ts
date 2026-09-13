import { ValueObject } from '../common/entity.js';
import { DomainError, Result } from '../common/result.js';
import { FoodNutrientProfile } from './FoodNutrientProfile.js';
import { FoodEntry } from './FoodEntry.js';
import { NutritionTarget } from './NutritionTarget.js';

export interface DailyNutritionSummaryProps {
  userId: string;
  dateString: string; // YYYY-MM-DD
  target: NutritionTarget;
  entries: FoodEntry[];
  totalConsumed: FoodNutrientProfile;
  remainingCalories: number;
  waterConsumedMl: number;
}

export class DailyNutritionSummary extends ValueObject<DailyNutritionSummaryProps> {
  get userId(): string {
    return this.props.userId;
  }
  get dateString(): string {
    return this.props.dateString;
  }
  get target(): NutritionTarget {
    return this.props.target;
  }
  get entries(): FoodEntry[] {
    return this.props.entries;
  }
  get totalConsumed(): FoodNutrientProfile {
    return this.props.totalConsumed;
  }
  get remainingCalories(): number {
    return this.props.remainingCalories;
  }
  get waterConsumedMl(): number {
    return this.props.waterConsumedMl;
  }

  private constructor(props: DailyNutritionSummaryProps) {
    super(props);
  }

  public static create(props: DailyNutritionSummaryProps): Result<DailyNutritionSummary, DomainError> {
    return Result.ok(new DailyNutritionSummary(props));
  }

  public static fromEntries(
    userId: string,
    dateString: string,
    target: NutritionTarget,
    entries: FoodEntry[],
    waterConsumedMl = 0
  ): DailyNutritionSummary {
    const totalConsumed = entries.reduce(
      (acc, entry) => acc.add(entry.nutritionSnapshot),
      FoodNutrientProfile.zero()
    );

    const remainingCalories = Math.max(0, target.dailyCalories - totalConsumed.calories);

    return new DailyNutritionSummary({
      userId,
      dateString,
      target,
      entries,
      totalConsumed,
      remainingCalories,
      waterConsumedMl,
    });
  }
}
