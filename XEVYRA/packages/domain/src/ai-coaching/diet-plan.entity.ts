import { Entity, ValueObject } from '../common/entity.js';
import { DomainError, Result } from '../common/result.js';
import { MacroNutrients } from '../nutrition/nutrition.entity.js';

export interface PlannedMealItemProps {
  name: string;
  quantityDescription: string;
  macros: MacroNutrients;
  recipeInstructions?: string[];
}

export class PlannedMealItem extends ValueObject<PlannedMealItemProps> {
  get name(): string {
    return this.props.name;
  }
  get macros(): MacroNutrients {
    return this.props.macros;
  }

  private constructor(props: PlannedMealItemProps) {
    super(props);
  }

  public static create(props: PlannedMealItemProps): Result<PlannedMealItem, DomainError> {
    if (!props.name) {
      return Result.fail(new DomainError('Meal item name is required', 'INVALID_MEAL_ITEM'));
    }
    return Result.ok(new PlannedMealItem(props));
  }
}

export interface PlannedMealProps {
  mealType: string;
  title: string;
  items: PlannedMealItem[];
  totalMacros: MacroNutrients;
}

export interface AIDietPlanProps {
  userId: string;
  promptVersion: string;
  targetCalories: number;
  macroRatio: {
    proteinPercent: number;
    carbsPercent: number;
    fatPercent: number;
  };
  meals: PlannedMealProps[];
  dietaryPreferences: string[];
  allergies: string[];
  createdAt: Date;
}

export class AIDietPlan extends Entity<AIDietPlanProps> {
  get userId(): string {
    return this.props.userId;
  }
  get targetCalories(): number {
    return this.props.targetCalories;
  }
  get meals(): PlannedMealProps[] {
    return this.props.meals;
  }

  private constructor(id: string, props: AIDietPlanProps) {
    super(id, props);
  }

  public static create(id: string, props: AIDietPlanProps): Result<AIDietPlan, DomainError> {
    if (!props.userId) {
      return Result.fail(new DomainError('User ID is required for AI diet plan', 'INVALID_USER_ID'));
    }
    if (props.targetCalories < 800 || props.targetCalories > 6000) {
      return Result.fail(new DomainError('Target calories out of safe range (800-6000)', 'UNSAFE_CALORIE_TARGET'));
    }
    return Result.ok(new AIDietPlan(id, props));
  }
}

export interface IAICoachingRepository {
  findLatestDietPlan(userId: string): Promise<AIDietPlan | null>;
  saveDietPlan(dietPlan: AIDietPlan): Promise<void>;
}
