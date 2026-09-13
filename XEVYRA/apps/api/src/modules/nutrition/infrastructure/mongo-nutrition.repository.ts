import { Db, Collection } from 'mongodb';

export interface FoodItemDocument {
  _id: string; // foi_...
  foiName: string;
  foiBrand?: string;
  foiBarcode?: string;
  foiCategory: string;
  foiStandardBasis: 'PER_100G' | 'PER_100ML' | 'PER_SERVING';
  foiCaloriesPer100Basis: number;
  foiProteinPer100Basis: number;
  foiCarbsPer100Basis: number;
  foiFatPer100Basis: number;
  foiFiberPer100Basis?: number;
  foiSugarPer100Basis?: number;
  foiSodiumMgPer100Basis?: number;
  foiAvailableServings: Array<{
    foiServingId: string;
    foiServingLabel: string;
    foiUnitType: string;
    foiBaseAmount: number;
    foiBasisEquivalentFactor: number;
    foiIsDefault?: boolean;
  }>;
  foiIsVerified: boolean;
  foiCreatedByUserId?: string;
  foiCreatedAt: Date;
  foiUpdatedAt: Date;
}

export interface MealLogItemDocument {
  ntdEntryId: string;
  ntdFoodItemId: string;
  ntdFoodName: string;
  ntdMealType: string;
  ntdQuantity: number;
  ntdUnit: string;
  ntdServingLabel: string;
  ntdNutritionSnapshot: {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    fiberGrams?: number;
    sugarGrams?: number;
    sodiumMg?: number;
  };
  ntdLoggedAt: Date;
}

export interface NutritionDayDocument {
  _id: string; // ntd_...
  ntdUserId: string; // usr_...
  ntdDateString: string; // YYYY-MM-DD
  ntdTargetDailyCalories: number;
  ntdTargetProteinGrams: number;
  ntdTargetCarbsGrams: number;
  ntdTargetFatGrams: number;
  ntdTargetFiberGrams?: number;
  ntdTargetWaterMl?: number;
  ntdGoalMode: 'DEFICIT' | 'MAINTENANCE' | 'SURPLUS';
  ntdCalorieOffset: number;
  ntdWaterConsumedMl: number;
  ntdMeals: MealLogItemDocument[];
  ntdTotalConsumed: {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    fiberGrams?: number;
    sugarGrams?: number;
    sodiumMg?: number;
  };
  ntdRemainingCalories: number;
  ntdCreatedAt: Date;
  ntdUpdatedAt: Date;
}

export interface DietPlanDocument {
  _id: string; // dpl_...
  dplUserId: string; // usr_...
  dplTitle: string;
  dplCuisineType: 'AMERICAN' | 'NORTH_INDIAN' | 'SOUTH_INDIAN' | 'MEDITERRANEAN' | 'ASIAN' | 'CUSTOM';
  dplGoalMode: 'DEFICIT' | 'MAINTENANCE' | 'SURPLUS';
  dplTargetDailyCalories: number;
  dplTargetMacros: {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  };
  dplMeals: Array<{
    dplMealType: string;
    dplTitle: string;
    dplTargetTime?: string;
    dplItems: Array<{
      dplFoodItemId?: string;
      dplName: string;
      dplQuantity: number;
      dplUnit: string;
      dplPortionDescription: string;
      dplNutrients: {
        calories: number;
        proteinGrams: number;
        carbsGrams: number;
        fatGrams: number;
      };
      dplNotes?: string;
    }>;
    dplTotalNutrients: {
      calories: number;
      proteinGrams: number;
      carbsGrams: number;
      fatGrams: number;
    };
  }>;
  dplDietaryPreferences: string[];
  dplAllergies: string[];
  dplIsActive: boolean;
  dplGeneratedBy: 'AI' | 'COACH' | 'USER_CUSTOM';
  dplCreatedAt: Date;
  dplUpdatedAt: Date;
}

export interface MaintenanceAnalysisDocument {
  _id: string; // mca_...
  mcaUserId: string; // usr_...
  mcaDaysAnalyzed: number;
  mcaConfidence: 'INSUFFICIENT' | 'PRELIMINARY' | 'INITIAL' | 'MORE_RELIABLE' | 'STRONGER_TREND';
  mcaAverageDailyCalories: number;
  mcaAverageBodyWeightKg?: number;
  mcaWeightChangeKg?: number;
  mcaWeightTrendDescription: string;
  mcaEstimatedMaintenanceCalories: number;
  mcaRecommendations: string[];
  mcaCalculatedAt: Date;
  mcaHistoryPoints: Array<{
    dateString: string;
    caloriesLogged: number;
    bodyWeightKg?: number;
  }>;
}

export interface NutritionTargetDocument {
  _id: string; // ntr_...
  ntrUserId: string; // usr_...
  ntrTargetCalories: number;
  ntrTargetProteinGrams: number;
  ntrTargetCarbsGrams: number;
  ntrTargetFatGrams: number;
  ntrEffectiveFrom: Date;
  ntrCreatedAt: Date;
  ntrUpdatedAt: Date;
}

export class MongoNutritionRepository {
  private foodItemsCol: Collection<FoodItemDocument>;
  private nutritionDaysCol: Collection<NutritionDayDocument>;
  private dietPlansCol: Collection<DietPlanDocument>;
  private maintenanceAnalysesCol: Collection<MaintenanceAnalysisDocument>;
  private targetsCol: Collection<NutritionTargetDocument>;

  constructor(private db: Db) {
    this.foodItemsCol = this.db.collection<FoodItemDocument>('food_items');
    this.nutritionDaysCol = this.db.collection<NutritionDayDocument>('nutrition_days');
    this.dietPlansCol = this.db.collection<DietPlanDocument>('diet_plans');
    this.maintenanceAnalysesCol = this.db.collection<MaintenanceAnalysisDocument>('maintenance_calorie_analyses');
    this.targetsCol = this.db.collection<NutritionTargetDocument>('nutrition_targets');
  }

  // 0. Nutrition Targets
  public async getTargets(userId: string): Promise<NutritionTargetDocument | null> {
    return this.targetsCol.findOne(
      { ntrUserId: userId },
      { sort: { ntrEffectiveFrom: -1 } }
    );
  }

  public async saveTargets(target: NutritionTargetDocument): Promise<void> {
    await this.targetsCol.updateOne(
      { _id: target._id },
      { $set: target },
      { upsert: true }
    );
  }

  // 1. Food Catalog
  public async searchFoodItems(query: string, userId?: string, category?: string, limit: number = 20): Promise<FoodItemDocument[]> {
    const filter: any = {
      $or: [
        { foiIsVerified: true },
        ...(userId ? [{ foiCreatedByUserId: userId }] : []),
      ],
    };

    if (query.trim()) {
      filter.$and = [
        ...(filter.$and || []),
        { foiName: { $regex: query.trim(), $options: 'i' } },
      ];
    }

    if (category) {
      filter.foiCategory = category;
    }

    return this.foodItemsCol.find(filter).limit(limit).toArray();
  }

  public async getFoodItemById(id: string): Promise<FoodItemDocument | null> {
    return this.foodItemsCol.findOne({ _id: id });
  }

  public async saveFoodItem(item: FoodItemDocument): Promise<void> {
    await this.foodItemsCol.updateOne(
      { _id: item._id },
      { $set: item },
      { upsert: true }
    );
  }

  // 2. Daily Nutrition Logs
  public async getNutritionDay(userId: string, dateString: string): Promise<NutritionDayDocument | null> {
    return this.nutritionDaysCol.findOne({
      ntdUserId: userId,
      ntdDateString: dateString,
    });
  }

  public async getRecentNutritionDays(userId: string, limitDays: number = 30): Promise<NutritionDayDocument[]> {
    return this.nutritionDaysCol
      .find({ ntdUserId: userId })
      .sort({ ntdDateString: -1 })
      .limit(limitDays)
      .toArray();
  }

  public async saveNutritionDay(day: NutritionDayDocument): Promise<void> {
    await this.nutritionDaysCol.updateOne(
      { _id: day._id },
      { $set: day },
      { upsert: true }
    );
  }

  public async removeMealEntry(userId: string, dateString: string, entryId: string): Promise<NutritionDayDocument | null> {
    const day = await this.getNutritionDay(userId, dateString);
    if (!day) return null;

    day.ntdMeals = day.ntdMeals.filter((m) => m.ntdEntryId !== entryId);
    
    // Recalculate totals
    let cal = 0, p = 0, c = 0, f = 0, fib = 0, sug = 0, sod = 0;
    for (const m of day.ntdMeals) {
      cal += m.ntdNutritionSnapshot.calories;
      p += m.ntdNutritionSnapshot.proteinGrams;
      c += m.ntdNutritionSnapshot.carbsGrams;
      f += m.ntdNutritionSnapshot.fatGrams;
      fib += m.ntdNutritionSnapshot.fiberGrams || 0;
      sug += m.ntdNutritionSnapshot.sugarGrams || 0;
      sod += m.ntdNutritionSnapshot.sodiumMg || 0;
    }

    day.ntdTotalConsumed = {
      calories: Math.round(cal),
      proteinGrams: Math.round(p * 10) / 10,
      carbsGrams: Math.round(c * 10) / 10,
      fatGrams: Math.round(f * 10) / 10,
      fiberGrams: Math.round(fib * 10) / 10,
      sugarGrams: Math.round(sug * 10) / 10,
      sodiumMg: Math.round(sod),
    };
    day.ntdRemainingCalories = Math.max(0, day.ntdTargetDailyCalories - day.ntdTotalConsumed.calories);
    day.ntdUpdatedAt = new Date();

    await this.saveNutritionDay(day);
    return day;
  }

  // 3. Diet Plans
  public async getActiveDietPlan(userId: string): Promise<DietPlanDocument | null> {
    return this.dietPlansCol.findOne({
      dplUserId: userId,
      dplIsActive: true,
    });
  }

  public async getDietPlanById(id: string, userId: string): Promise<DietPlanDocument | null> {
    return this.dietPlansCol.findOne({
      _id: id,
      dplUserId: userId,
    });
  }

  public async saveDietPlan(plan: DietPlanDocument): Promise<void> {
    if (plan.dplIsActive) {
      // Deactivate other plans for this user
      await this.dietPlansCol.updateMany(
        { dplUserId: plan.dplUserId, _id: { $ne: plan._id } },
        { $set: { dplIsActive: false, dplUpdatedAt: new Date() } }
      );
    }

    await this.dietPlansCol.updateOne(
      { _id: plan._id },
      { $set: plan },
      { upsert: true }
    );
  }

  // 4. Maintenance Calorie Analysis
  public async getLatestMaintenanceAnalysis(userId: string): Promise<MaintenanceAnalysisDocument | null> {
    return this.maintenanceAnalysesCol.findOne(
      { mcaUserId: userId },
      { sort: { mcaCalculatedAt: -1 } }
    );
  }

  public async saveMaintenanceAnalysis(analysis: MaintenanceAnalysisDocument): Promise<void> {
    await this.maintenanceAnalysesCol.updateOne(
      { _id: analysis._id },
      { $set: analysis },
      { upsert: true }
    );
  }
}
