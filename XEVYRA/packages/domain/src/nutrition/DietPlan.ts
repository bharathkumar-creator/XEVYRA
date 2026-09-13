import { Entity, ValueObject } from '../common/entity.js';
import { DomainError, Result } from '../common/result.js';
import { FoodNutrientProfile } from './FoodNutrientProfile.js';
import { GoalMode } from './NutritionTarget.js';

export interface DietPlanMealItemProps {
  foodItemId?: string;
  name: string;
  quantity: number;
  unit: string;
  portionDescription: string;
  nutrients: FoodNutrientProfile;
  notes?: string;
}

export class DietPlanMealItem extends ValueObject<DietPlanMealItemProps> {
  get name(): string {
    return this.props.name;
  }
  get quantity(): number {
    return this.props.quantity;
  }
  get unit(): string {
    return this.props.unit;
  }
  get portionDescription(): string {
    return this.props.portionDescription;
  }
  get nutrients(): FoodNutrientProfile {
    return this.props.nutrients;
  }
  get notes(): string | undefined {
    return this.props.notes;
  }

  private constructor(props: DietPlanMealItemProps) {
    super(props);
  }

  public static create(props: DietPlanMealItemProps): Result<DietPlanMealItem, DomainError> {
    if (!props.name) {
      return Result.fail(new DomainError('Meal item name is required', 'INVALID_ITEM'));
    }
    return Result.ok(new DietPlanMealItem(props));
  }
}

export interface DietPlanMealProps {
  mealType: string;
  title: string;
  targetTime?: string;
  items: DietPlanMealItem[];
  totalNutrients: FoodNutrientProfile;
}

export type CuisineType =
  | 'AMERICAN'
  | 'NORTH_INDIAN'
  | 'SOUTH_INDIAN'
  | 'MEDITERRANEAN'
  | 'ASIAN'
  | 'CUSTOM';

export interface DietPlanProps {
  userId: string;
  title: string;
  cuisineType?: CuisineType;
  goalMode: GoalMode;
  targetDailyCalories: number;
  targetMacros: FoodNutrientProfile;
  meals: DietPlanMealProps[];
  dietaryPreferences: string[];
  allergies: string[];
  isActive: boolean;
  generatedBy: 'AI' | 'COACH' | 'USER_CUSTOM';
  createdAt: Date;
  updatedAt: Date;
}

export class DietPlan extends Entity<DietPlanProps> {
  get userId(): string {
    return this.props.userId;
  }
  get title(): string {
    return this.props.title;
  }
  get goalMode(): GoalMode {
    return this.props.goalMode;
  }
  get targetDailyCalories(): number {
    return this.props.targetDailyCalories;
  }
  get targetMacros(): FoodNutrientProfile {
    return this.props.targetMacros;
  }
  get meals(): DietPlanMealProps[] {
    return this.props.meals;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }

  private constructor(id: string, props: DietPlanProps) {
    super(id, props);
  }

  public static create(id: string, props: DietPlanProps): Result<DietPlan, DomainError> {
    if (!id || !props.userId) {
      return Result.fail(new DomainError('DietPlan ID and userId are required', 'INVALID_DIET_PLAN'));
    }
    return Result.ok(new DietPlan(id, props));
  }
}
