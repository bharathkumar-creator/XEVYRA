import { Entity, ValueObject } from '../common/entity.js';
import { DomainError, Result } from '../common/result.js';

export interface MacroNutrientsProps {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
}

export class MacroNutrients extends ValueObject<MacroNutrientsProps> {
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

  private constructor(props: MacroNutrientsProps) {
    super(props);
  }

  public static create(props: MacroNutrientsProps): Result<MacroNutrients, DomainError> {
    if (props.calories < 0 || props.proteinGrams < 0 || props.carbsGrams < 0 || props.fatGrams < 0) {
      return Result.fail(new DomainError('Macro nutrients cannot be negative', 'INVALID_MACROS'));
    }
    return Result.ok(new MacroNutrients(props));
  }

  public add(other: MacroNutrients): MacroNutrients {
    return new MacroNutrients({
      calories: this.calories + other.calories,
      proteinGrams: this.proteinGrams + other.proteinGrams,
      carbsGrams: this.carbsGrams + other.carbsGrams,
      fatGrams: this.fatGrams + other.fatGrams,
      fiberGrams: (this.fiberGrams || 0) + (other.fiberGrams || 0),
    });
  }

  public static zero(): MacroNutrients {
    return new MacroNutrients({
      calories: 0,
      proteinGrams: 0,
      carbsGrams: 0,
      fatGrams: 0,
      fiberGrams: 0,
    });
  }
}

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface LoggedFoodItemProps {
  foodId: string;
  name: string;
  servingSize: string;
  servingsCount: number;
  macros: MacroNutrients;
  loggedAt: Date;
}

export class LoggedFoodItem extends ValueObject<LoggedFoodItemProps> {
  get foodId(): string {
    return this.props.foodId;
  }
  get name(): string {
    return this.props.name;
  }
  get servingSize(): string {
    return this.props.servingSize;
  }
  get servingsCount(): number {
    return this.props.servingsCount;
  }
  get macros(): MacroNutrients {
    return this.props.macros;
  }

  private constructor(props: LoggedFoodItemProps) {
    super(props);
  }

  public static create(props: LoggedFoodItemProps): Result<LoggedFoodItem, DomainError> {
    if (!props.foodId || !props.name) {
      return Result.fail(new DomainError('Food ID and name are required', 'INVALID_FOOD_ITEM'));
    }
    if (props.servingsCount <= 0) {
      return Result.fail(new DomainError('Servings count must be greater than 0', 'INVALID_SERVINGS_COUNT'));
    }
    return Result.ok(new LoggedFoodItem(props));
  }
}

export interface NutritionDayProps {
  userId: string;
  dateString: string; // YYYY-MM-DD
  targetMacros: MacroNutrients;
  consumedBreakfast: LoggedFoodItem[];
  consumedLunch: LoggedFoodItem[];
  consumedDinner: LoggedFoodItem[];
  consumedSnacks: LoggedFoodItem[];
  waterMl: number;
  updatedAt: Date;
}

export class NutritionDay extends Entity<NutritionDayProps> {
  get userId(): string {
    return this.props.userId;
  }
  get dateString(): string {
    return this.props.dateString;
  }
  get targetMacros(): MacroNutrients {
    return this.props.targetMacros;
  }
  get waterMl(): number {
    return this.props.waterMl;
  }

  private constructor(id: string, props: NutritionDayProps) {
    super(id, props);
  }

  public static create(id: string, props: NutritionDayProps): Result<NutritionDay, DomainError> {
    if (!props.userId || !props.dateString) {
      return Result.fail(new DomainError('UserId and date are required', 'INVALID_NUTRITION_DAY'));
    }
    return Result.ok(new NutritionDay(id, props));
  }

  public getTotalConsumedMacros(): MacroNutrients {
    const allItems = [
      ...this.props.consumedBreakfast,
      ...this.props.consumedLunch,
      ...this.props.consumedDinner,
      ...this.props.consumedSnacks,
    ];

    return allItems.reduce((acc, item) => acc.add(item.macros), MacroNutrients.zero());
  }
}

export interface INutritionRepository {
  findByUserAndDate(userId: string, dateString: string): Promise<NutritionDay | null>;
  save(nutritionDay: NutritionDay): Promise<void>;
}
