import { Entity, ValueObject } from '../common/entity.js';
import { DomainError, Result } from '../common/result.js';
import { FoodNutrientProfile } from './FoodNutrientProfile.js';
import { FoodUnitType } from './FoodServing.js';
import { MealType } from './nutrition.entity.js';

export interface FoodEntryNutritionSnapshotProps {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
}

export class FoodEntryNutritionSnapshot extends ValueObject<FoodEntryNutritionSnapshotProps> {
  get calories(): number {
    return this.props.calories;
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

  private constructor(props: FoodEntryNutritionSnapshotProps) {
    super(props);
  }

  public static create(props: FoodEntryNutritionSnapshotProps): Result<FoodEntryNutritionSnapshot, DomainError> {
    return Result.ok(new FoodEntryNutritionSnapshot(props));
  }
}

export interface FoodEntryProps {
  userId: string;
  foodItemId: string;
  foodName: string;
  mealType: MealType;
  quantity: number;
  unit: FoodUnitType;
  servingLabel: string;
  nutritionSnapshot: FoodNutrientProfile;
  loggedAt: Date;
  dateString: string; // YYYY-MM-DD
}

export class FoodEntry extends Entity<FoodEntryProps> {
  get userId(): string {
    return this.props.userId;
  }
  get foodItemId(): string {
    return this.props.foodItemId;
  }
  get foodName(): string {
    return this.props.foodName;
  }
  get mealType(): MealType {
    return this.props.mealType;
  }
  get quantity(): number {
    return this.props.quantity;
  }
  get unit(): FoodUnitType {
    return this.props.unit;
  }
  get servingLabel(): string {
    return this.props.servingLabel;
  }
  get nutritionSnapshot(): FoodNutrientProfile {
    return this.props.nutritionSnapshot;
  }
  get loggedAt(): Date {
    return this.props.loggedAt;
  }
  get dateString(): string {
    return this.props.dateString;
  }

  private constructor(id: string, props: FoodEntryProps) {
    super(id, props);
  }

  public static create(id: string, props: FoodEntryProps): Result<FoodEntry, DomainError> {
    if (!id || !props.userId || !props.foodItemId) {
      return Result.fail(new DomainError('ID, userId, and foodItemId are required', 'INVALID_FOOD_ENTRY'));
    }
    if (props.quantity <= 0) {
      return Result.fail(new DomainError('Quantity must be greater than 0', 'INVALID_QUANTITY'));
    }
    return Result.ok(new FoodEntry(id, props));
  }
}
