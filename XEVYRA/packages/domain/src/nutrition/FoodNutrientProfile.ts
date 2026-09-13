import { ValueObject } from '../common/entity.js';
import { DomainError, Result } from '../common/result.js';

export interface FoodNutrientProfileProps {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
  sugarGrams?: number;
  sodiumMg?: number;
}

export class FoodNutrientProfile extends ValueObject<FoodNutrientProfileProps> {
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
  get sugarGrams(): number | undefined {
    return this.props.sugarGrams;
  }
  get sodiumMg(): number | undefined {
    return this.props.sodiumMg;
  }

  private constructor(props: FoodNutrientProfileProps) {
    super(props);
  }

  public static create(props: FoodNutrientProfileProps): Result<FoodNutrientProfile, DomainError> {
    if (props.calories < 0 || props.proteinGrams < 0 || props.carbsGrams < 0 || props.fatGrams < 0) {
      return Result.fail(new DomainError('Nutrient values cannot be negative', 'INVALID_NUTRIENT_PROFILE'));
    }
    return Result.ok(new FoodNutrientProfile(props));
  }

  public scale(factor: number): FoodNutrientProfile {
    return new FoodNutrientProfile({
      calories: Math.round(this.calories * factor * 10) / 10,
      proteinGrams: Math.round(this.proteinGrams * factor * 10) / 10,
      carbsGrams: Math.round(this.carbsGrams * factor * 10) / 10,
      fatGrams: Math.round(this.fatGrams * factor * 10) / 10,
      fiberGrams: this.fiberGrams !== undefined ? Math.round(this.fiberGrams * factor * 10) / 10 : undefined,
      sugarGrams: this.sugarGrams !== undefined ? Math.round(this.sugarGrams * factor * 10) / 10 : undefined,
      sodiumMg: this.sodiumMg !== undefined ? Math.round(this.sodiumMg * factor * 10) / 10 : undefined,
    });
  }

  public add(other: FoodNutrientProfile): FoodNutrientProfile {
    return new FoodNutrientProfile({
      calories: Math.round((this.calories + other.calories) * 10) / 10,
      proteinGrams: Math.round((this.proteinGrams + other.proteinGrams) * 10) / 10,
      carbsGrams: Math.round((this.carbsGrams + other.carbsGrams) * 10) / 10,
      fatGrams: Math.round((this.fatGrams + other.fatGrams) * 10) / 10,
      fiberGrams:
        this.fiberGrams !== undefined || other.fiberGrams !== undefined
          ? Math.round(((this.fiberGrams || 0) + (other.fiberGrams || 0)) * 10) / 10
          : undefined,
      sugarGrams:
        this.sugarGrams !== undefined || other.sugarGrams !== undefined
          ? Math.round(((this.sugarGrams || 0) + (other.sugarGrams || 0)) * 10) / 10
          : undefined,
      sodiumMg:
        this.sodiumMg !== undefined || other.sodiumMg !== undefined
          ? Math.round(((this.sodiumMg || 0) + (other.sodiumMg || 0)) * 10) / 10
          : undefined,
    });
  }

  public static zero(): FoodNutrientProfile {
    return new FoodNutrientProfile({
      calories: 0,
      proteinGrams: 0,
      carbsGrams: 0,
      fatGrams: 0,
      fiberGrams: 0,
    });
  }
}
