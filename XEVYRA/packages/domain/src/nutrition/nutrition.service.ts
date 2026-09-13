export type NutritionUnit = 'G' | 'KG' | 'OZ' | 'ML' | 'L' | 'SCOOP' | 'SERVING';

export interface NutritionBasisSnapshot {
  caloriesPer100Basis: number;
  proteinGramsPer100Basis: number;
  carbsGramsPer100Basis: number;
  fatGramsPer100Basis: number;
  fiberGramsPer100Basis?: number;
}

export interface ScaledNutritionResult {
  normalizedQuantity: number;
  normalizedUnit: 'G' | 'ML';
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
}

export type MaintenanceConfidence =
  | 'INSUFFICIENT'
  | 'PRELIMINARY'
  | 'INITIAL'
  | 'MORE_RELIABLE'
  | 'STRONGER_TREND';

export interface MaintenanceAnalysisResult {
  periodStart: Date;
  periodEnd: Date;
  daysAnalyzed: number;
  averageCalories: number;
  averageWeightKg: number;
  startingWeightKg?: number;
  endingWeightKg?: number;
  weightChangeKg?: number;
  estimatedMaintenanceCalories: number;
  confidence: MaintenanceConfidence;
  dataQuality: {
    calorieLoggingCompleteness: number; // 0.0 to 1.0
    weighInCompleteness: number;        // 0.0 to 1.0
  };
}

export class NutritionDomainService {
  /**
   * Normalizes any input unit to a standard 'G' or 'ML' quantity
   */
  public static normalizeQuantity(
    quantity: number,
    unit: NutritionUnit,
    servingGrams: number = 100
  ): { normalizedQuantity: number; normalizedUnit: 'G' | 'ML' } {
    switch (unit) {
      case 'KG':
        return { normalizedQuantity: quantity * 1000, normalizedUnit: 'G' };
      case 'OZ':
        return { normalizedQuantity: Math.round(quantity * 28.3495 * 10) / 10, normalizedUnit: 'G' };
      case 'L':
        return { normalizedQuantity: quantity * 1000, normalizedUnit: 'ML' };
      case 'SCOOP':
        return { normalizedQuantity: quantity * (servingGrams || 30), normalizedUnit: 'G' };
      case 'SERVING':
        return { normalizedQuantity: quantity * (servingGrams || 100), normalizedUnit: 'G' };
      case 'ML':
        return { normalizedQuantity: quantity, normalizedUnit: 'ML' };
      case 'G':
      default:
        return { normalizedQuantity: quantity, normalizedUnit: 'G' };
    }
  }

  /**
   * Scales 100g/100ml baseline nutrition to the exact logged intake portion
   */
  public static scaleNutrition(
    quantity: number,
    unit: NutritionUnit,
    baseline: NutritionBasisSnapshot,
    servingGrams: number = 100
  ): ScaledNutritionResult {
    const { normalizedQuantity, normalizedUnit } = this.normalizeQuantity(quantity, unit, servingGrams);
    const factor = normalizedQuantity / 100;

    return {
      normalizedQuantity,
      normalizedUnit,
      calories: Math.round(baseline.caloriesPer100Basis * factor),
      proteinGrams: Math.round(baseline.proteinGramsPer100Basis * factor * 10) / 10,
      carbsGrams: Math.round(baseline.carbsGramsPer100Basis * factor * 10) / 10,
      fatGrams: Math.round(baseline.fatGramsPer100Basis * factor * 10) / 10,
      fiberGrams: baseline.fiberGramsPer100Basis !== undefined
        ? Math.round(baseline.fiberGramsPer100Basis * factor * 10) / 10
        : undefined,
    };
  }

  /**
   * Analyzes caloric intake vs weigh-in trend over a period to calculate estimated TDEE and confidence
   */
  public static calculateMaintenance(
    dailyLogs: Array<{ dateString: string; totalCalories: number; weightKg?: number }>,
    periodStart: Date,
    periodEnd: Date
  ): MaintenanceAnalysisResult {
    const daysAnalyzed = dailyLogs.length;

    if (daysAnalyzed === 0) {
      return {
        periodStart,
        periodEnd,
        daysAnalyzed: 0,
        averageCalories: 2500,
        averageWeightKg: 75,
        estimatedMaintenanceCalories: 2500,
        confidence: 'INSUFFICIENT',
        dataQuality: { calorieLoggingCompleteness: 0, weighInCompleteness: 0 },
      };
    }

    const totalCals = dailyLogs.reduce((acc, log) => acc + log.totalCalories, 0);
    const averageCalories = Math.round(totalCals / daysAnalyzed);

    const loggedWeighIns = dailyLogs.filter((log) => typeof log.weightKg === 'number' && log.weightKg > 0);
    const averageWeightKg = loggedWeighIns.length > 0
      ? Math.round((loggedWeighIns.reduce((acc, l) => acc + (l.weightKg || 0), 0) / loggedWeighIns.length) * 10) / 10
      : 75;

    const startingWeightKg = loggedWeighIns[0]?.weightKg;
    const endingWeightKg = loggedWeighIns[loggedWeighIns.length - 1]?.weightKg;
    const weightChangeKg = startingWeightKg !== undefined && endingWeightKg !== undefined
      ? Math.round((endingWeightKg - startingWeightKg) * 10) / 10
      : 0;

    // 1kg fat ~= 7700 kcal energy equivalent
    const dailyCaloricImbalance = daysAnalyzed > 0 ? (weightChangeKg * 7700) / daysAnalyzed : 0;
    const estimatedMaintenanceCalories = Math.round(averageCalories - dailyCaloricImbalance);

    const calorieLoggingCompleteness = Math.min(1, Math.round((dailyLogs.filter((d) => d.totalCalories > 500).length / daysAnalyzed) * 100) / 100);
    const weighInCompleteness = Math.min(1, Math.round((loggedWeighIns.length / daysAnalyzed) * 100) / 100);

    let confidence: MaintenanceConfidence = 'INSUFFICIENT';
    if (daysAnalyzed >= 28 && calorieLoggingCompleteness >= 0.8 && weighInCompleteness >= 0.7) {
      confidence = 'STRONGER_TREND';
    } else if (daysAnalyzed >= 14 && calorieLoggingCompleteness >= 0.7) {
      confidence = 'MORE_RELIABLE';
    } else if (daysAnalyzed >= 7 && calorieLoggingCompleteness >= 0.6) {
      confidence = 'INITIAL';
    } else if (daysAnalyzed >= 3) {
      confidence = 'PRELIMINARY';
    }

    return {
      periodStart,
      periodEnd,
      daysAnalyzed,
      averageCalories,
      averageWeightKg,
      startingWeightKg,
      endingWeightKg,
      weightChangeKg,
      estimatedMaintenanceCalories: Math.max(1200, Math.min(6000, estimatedMaintenanceCalories)),
      confidence,
      dataQuality: {
        calorieLoggingCompleteness,
        weighInCompleteness,
      },
    };
  }

  /**
   * Calculates target calories and athletic macro distribution from goal mode and offset
   */
  public static calculateGoalTargets(
    maintenanceCalories: number,
    goalMode: 'DEFICIT' | 'MAINTENANCE' | 'SURPLUS',
    offset: number = 0
  ): { targetCalories: number; proteinGrams: number; carbsGrams: number; fatGrams: number } {
    let effectiveOffset = offset;
    if (goalMode === 'DEFICIT' && offset === 0) effectiveOffset = -500;
    if (goalMode === 'SURPLUS' && offset === 0) effectiveOffset = 300;
    if (goalMode === 'MAINTENANCE') effectiveOffset = 0;

    const targetCalories = Math.max(1200, maintenanceCalories + effectiveOffset);

    // Athletic Macro Partition: 35% Protein, 40% Carbs, 25% Fat
    const proteinGrams = Math.round((targetCalories * 0.35) / 4);
    const carbsGrams = Math.round((targetCalories * 0.40) / 4);
    const fatGrams = Math.round((targetCalories * 0.25) / 9);

    return {
      targetCalories,
      proteinGrams,
      carbsGrams,
      fatGrams,
    };
  }
}
