import { ValueObject } from '../common/entity.js';
import { DomainError, Result } from '../common/result.js';

export type StandardNutritionBasis = 'PER_100G' | 'PER_100ML' | 'PER_SERVING';

export type FoodUnitType = 'GRAMS' | 'KILOGRAMS' | 'OUNCES' | 'MILLILITERS' | 'LITERS' | 'SERVING' | 'PIECE' | 'SCOOP' | 'CUP';

export interface FoodServingProps {
  id: string;
  label: string; // e.g., "1 Scoop (30g)", "1 Cup cooked (150g)", "100g"
  unitType: FoodUnitType;
  baseAmount: number; // e.g. 100 for 100g, 30 for 30g scoop
  basisEquivalentFactor: number; // multiplier to convert 1 of this serving to the food's base nutrition (e.g. 0.3 for 30g when basis is 100g)
  isDefault?: boolean;
}

export class FoodServing extends ValueObject<FoodServingProps> {
  get id(): string {
    return this.props.id;
  }
  get label(): string {
    return this.props.label;
  }
  get unitType(): FoodUnitType {
    return this.props.unitType;
  }
  get baseAmount(): number {
    return this.props.baseAmount;
  }
  get basisEquivalentFactor(): number {
    return this.props.basisEquivalentFactor;
  }
  get isDefault(): boolean {
    return !!this.props.isDefault;
  }

  private constructor(props: FoodServingProps) {
    super(props);
  }

  public static create(props: FoodServingProps): Result<FoodServing, DomainError> {
    if (!props.id || !props.label) {
      return Result.fail(new DomainError('Serving id and label are required', 'INVALID_SERVING'));
    }
    if (props.basisEquivalentFactor <= 0) {
      return Result.fail(new DomainError('Basis equivalent factor must be positive', 'INVALID_FACTOR'));
    }
    return Result.ok(new FoodServing(props));
  }

  /**
   * Calculates multiplier from an arbitrary weight/quantity entered by user
   */
  public static calculateFactor(
    unit: FoodUnitType,
    quantity: number,
    basis: StandardNutritionBasis
  ): number {
    let standardGramsOrMl = quantity;
    switch (unit) {
      case 'KILOGRAMS':
      case 'LITERS':
        standardGramsOrMl = quantity * 1000;
        break;
      case 'OUNCES':
        standardGramsOrMl = quantity * 28.3495;
        break;
      case 'GRAMS':
      case 'MILLILITERS':
      case 'SERVING':
      case 'PIECE':
      case 'SCOOP':
      case 'CUP':
      default:
        standardGramsOrMl = quantity;
        break;
    }

    if (basis === 'PER_100G' || basis === 'PER_100ML') {
      return standardGramsOrMl / 100;
    }
    return quantity; // PER_SERVING
  }
}
