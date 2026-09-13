import { Entity } from '../common/entity.js';
import { DomainError, Result } from '../common/result.js';
import { FoodNutrientProfile } from './FoodNutrientProfile.js';
import { FoodServing, StandardNutritionBasis } from './FoodServing.js';

export interface FoodItemProps {
  name: string;
  brand?: string;
  barcode?: string;
  category: string; // e.g. "Proteins", "Carbohydrates", "Fats", "Dairy", "Vegetables", "Snacks"
  standardBasis: StandardNutritionBasis;
  nutrientsPerBasis: FoodNutrientProfile;
  availableServings: FoodServing[];
  isVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class FoodItem extends Entity<FoodItemProps> {
  get name(): string {
    return this.props.name;
  }
  get brand(): string | undefined {
    return this.props.brand;
  }
  get barcode(): string | undefined {
    return this.props.barcode;
  }
  get category(): string {
    return this.props.category;
  }
  get standardBasis(): StandardNutritionBasis {
    return this.props.standardBasis;
  }
  get nutrientsPerBasis(): FoodNutrientProfile {
    return this.props.nutrientsPerBasis;
  }
  get availableServings(): FoodServing[] {
    return this.props.availableServings;
  }
  get isVerified(): boolean {
    return !!this.props.isVerified;
  }

  private constructor(id: string, props: FoodItemProps) {
    super(id, props);
  }

  public static create(id: string, props: FoodItemProps): Result<FoodItem, DomainError> {
    if (!id || !props.name) {
      return Result.fail(new DomainError('Food ID and name are required', 'INVALID_FOOD_ITEM'));
    }
    return Result.ok(new FoodItem(id, props));
  }

  /**
   * Computes exact nutrient profile for an arbitrary weight/quantity
   */
  public calculateNutrients(quantity: number, servingIdOrUnit?: string): FoodNutrientProfile {
    let factor = 1;
    const serving = this.props.availableServings.find((s) => s.id === servingIdOrUnit);
    if (serving) {
      factor = serving.basisEquivalentFactor * quantity;
    } else {
      factor = FoodServing.calculateFactor(
        (servingIdOrUnit as any) || 'GRAMS',
        quantity,
        this.props.standardBasis
      );
    }
    return this.props.nutrientsPerBasis.scale(factor);
  }
}
