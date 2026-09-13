import { Request, Response, NextFunction } from 'express';
import {
  LogFoodEntryRequestSchema,
  GenerateDietPlanRequestSchema,
} from '@xevyra/contracts';
import {
  MongoNutritionRepository,
  FoodItemDocument,
  DietPlanDocument,
  MaintenanceAnalysisDocument,
} from '../infrastructure/mongo-nutrition.repository.js';
import { MongoProgressRepository } from '../../progress/infrastructure/mongo-progress.repository.js';
import { MongoProfileRepository } from '../../profile/infrastructure/mongo-profile.repository.js';
import { NutritionDomainService } from '@xevyra/domain';
import { AppError } from '../../../shared/errors/app-error.js';

export class NutritionController {
  constructor(
    private nutritionRepository: MongoNutritionRepository,
    private profileRepository: MongoProfileRepository,
    private progressRepository?: MongoProgressRepository
  ) {}

  // 1. Get Daily Summary
  public getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;
      if (!authUser) throw AppError.unauthorized('Authentication required');

      const dateString = (req.query.date as string) || new Date().toISOString().split('T')[0]!;
      let day = await this.nutritionRepository.getNutritionDay(authUser.userId, dateString);

      if (!day) {
        const profile = await this.profileRepository.findByUserId(authUser.userId);
        const targetCalories = profile?.weeklyWorkoutTarget ? 2400 + (profile.weeklyWorkoutTarget * 50) : 2400;
        const targetProtein = 160;
        const targetCarbs = 260;
        const targetFat = 75;

        day = {
          _id: `ntd_${authUser.userId.replace(/^usr_/, '')}_${dateString.replace(/-/g, '')}`,
          ntdUserId: authUser.userId,
          ntdDateString: dateString,
          ntdTargetDailyCalories: targetCalories,
          ntdTargetProteinGrams: targetProtein,
          ntdTargetCarbsGrams: targetCarbs,
          ntdTargetFatGrams: targetFat,
          ntdTargetFiberGrams: 30,
          ntdTargetWaterMl: 3000,
          ntdGoalMode: 'MAINTENANCE',
          ntdCalorieOffset: 0,
          ntdWaterConsumedMl: 0,
          ntdMeals: [],
          ntdTotalConsumed: {
            calories: 0,
            proteinGrams: 0,
            carbsGrams: 0,
            fatGrams: 0,
            fiberGrams: 0,
            sugarGrams: 0,
            sodiumMg: 0,
          },
          ntdRemainingCalories: targetCalories,
          ntdCreatedAt: new Date(),
          ntdUpdatedAt: new Date(),
        };

        await this.nutritionRepository.saveNutritionDay(day);
      }

      const activeDay = day;

      res.status(200).json({
        dateString: activeDay.ntdDateString,
        target: {
          dailyCalories: activeDay.ntdTargetDailyCalories,
          proteinGrams: activeDay.ntdTargetProteinGrams,
          carbsGrams: activeDay.ntdTargetCarbsGrams,
          fatGrams: activeDay.ntdTargetFatGrams,
          fiberGrams: activeDay.ntdTargetFiberGrams,
          waterMl: activeDay.ntdTargetWaterMl,
          goalMode: activeDay.ntdGoalMode,
          calorieOffset: activeDay.ntdCalorieOffset,
        },
        entries: activeDay.ntdMeals.map((m) => ({
          id: m.ntdEntryId,
          userId: authUser.userId,
          foodItemId: m.ntdFoodItemId,
          foodName: m.ntdFoodName,
          mealType: m.ntdMealType,
          quantity: m.ntdQuantity,
          unit: m.ntdUnit,
          servingLabel: m.ntdServingLabel,
          nutritionSnapshot: m.ntdNutritionSnapshot,
          loggedAt: m.ntdLoggedAt.toISOString(),
          dateString: activeDay.ntdDateString,
        })),
        totalConsumed: activeDay.ntdTotalConsumed,
        remainingCalories: activeDay.ntdRemainingCalories,
        waterConsumedMl: activeDay.ntdWaterConsumedMl,
      });
    } catch (error) {
      next(error);
    }
  };

  // 2. Search Foods
  public searchFoods = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;
      const query = (req.query.query as string) || '';
      const category = req.query.category as string;
      const limit = parseInt(req.query.limit as string, 10) || 30;

      let foods = await this.nutritionRepository.searchFoodItems(query, authUser?.userId, category, limit);

      if (foods.length === 0 && !query) {
        await this.seedDefaultFoods();
        foods = await this.nutritionRepository.searchFoodItems(query, authUser?.userId, category, limit);
      }

      res.status(200).json({
        items: foods.map((f) => this.mapFoodToDto(f)),
      });
    } catch (error) {
      next(error);
    }
  };

  // 3. Create Custom Food
  public createCustomFood = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;
      if (!authUser) throw AppError.unauthorized('Authentication required');

      const {
        name,
        brand,
        category,
        standardBasis = 'PER_100G',
        nutrientsPerBasis,
        servings = [],
      } = req.body;

      if (!name || !nutrientsPerBasis) {
        throw AppError.badRequest('Name and nutrient profile are required');
      }

      const foiId = `foi_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const newFood: FoodItemDocument = {
        _id: foiId,
        foiName: name.trim(),
        foiBrand: brand?.trim(),
        foiCategory: category || 'Custom',
        foiStandardBasis: standardBasis,
        foiCaloriesPer100Basis: Number(nutrientsPerBasis.calories || 0),
        foiProteinPer100Basis: Number(nutrientsPerBasis.proteinGrams || 0),
        foiCarbsPer100Basis: Number(nutrientsPerBasis.carbsGrams || 0),
        foiFatPer100Basis: Number(nutrientsPerBasis.fatGrams || 0),
        foiFiberPer100Basis: Number(nutrientsPerBasis.fiberGrams || 0),
        foiSugarPer100Basis: Number(nutrientsPerBasis.sugarGrams || 0),
        foiSodiumMgPer100Basis: Number(nutrientsPerBasis.sodiumMg || 0),
        foiAvailableServings: servings.length > 0 ? servings.map((s: any, idx: number) => ({
          foiServingId: s.id || `srv_${idx + 1}`,
          foiServingLabel: s.label || `${s.baseAmount}g`,
          foiUnitType: s.unitType || 'GRAMS',
          foiBaseAmount: Number(s.baseAmount || 100),
          foiBasisEquivalentFactor: Number(s.baseAmount || 100) / 100,
          foiIsDefault: s.isDefault ?? (idx === 0),
        })) : [
          {
            foiServingId: 'srv_100g',
            foiServingLabel: '100 grams',
            foiUnitType: 'GRAMS',
            foiBaseAmount: 100,
            foiBasisEquivalentFactor: 1.0,
            foiIsDefault: true,
          },
        ],
        foiIsVerified: false,
        foiCreatedByUserId: authUser.userId,
        foiCreatedAt: new Date(),
        foiUpdatedAt: new Date(),
      };

      await this.nutritionRepository.saveFoodItem(newFood);
      res.status(201).json(this.mapFoodToDto(newFood));
    } catch (error) {
      next(error);
    }
  };

  // 4. Log Food Entry
  public logFoodEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;
      if (!authUser) throw AppError.unauthorized('Authentication required');

      const validated = LogFoodEntryRequestSchema.parse(req.body);
      const food = await this.nutritionRepository.getFoodItemById(validated.foodItemId);
      if (!food) throw AppError.notFound('Food item not found');

      // Calculate snapshot nutrients
      let factor = 1.0;
      let servingLabel = `${validated.quantity} ${validated.unit.toLowerCase()}`;

      if (validated.servingId) {
        const matchedServing = food.foiAvailableServings.find((s) => s.foiServingId === validated.servingId);
        if (matchedServing) {
          factor = matchedServing.foiBasisEquivalentFactor * validated.quantity;
          servingLabel = `${validated.quantity}x ${matchedServing.foiServingLabel}`;
        }
      } else {
        factor = validated.quantity / 100;
      }

      const snapshot = {
        calories: Math.round(food.foiCaloriesPer100Basis * factor),
        proteinGrams: Math.round(food.foiProteinPer100Basis * factor * 10) / 10,
        carbsGrams: Math.round(food.foiCarbsPer100Basis * factor * 10) / 10,
        fatGrams: Math.round(food.foiFatPer100Basis * factor * 10) / 10,
        fiberGrams: food.foiFiberPer100Basis ? Math.round(food.foiFiberPer100Basis * factor * 10) / 10 : undefined,
        sugarGrams: food.foiSugarPer100Basis ? Math.round(food.foiSugarPer100Basis * factor * 10) / 10 : undefined,
        sodiumMg: food.foiSodiumMgPer100Basis ? Math.round(food.foiSodiumMgPer100Basis * factor) : undefined,
      };

      let day = await this.nutritionRepository.getNutritionDay(authUser.userId, validated.dateString);
      if (!day) {
        day = {
          _id: `ntd_${authUser.userId.replace(/^usr_/, '')}_${validated.dateString.replace(/-/g, '')}`,
          ntdUserId: authUser.userId,
          ntdDateString: validated.dateString,
          ntdTargetDailyCalories: 2400,
          ntdTargetProteinGrams: 160,
          ntdTargetCarbsGrams: 260,
          ntdTargetFatGrams: 75,
          ntdTargetFiberGrams: 30,
          ntdTargetWaterMl: 3000,
          ntdGoalMode: 'MAINTENANCE',
          ntdCalorieOffset: 0,
          ntdWaterConsumedMl: 0,
          ntdMeals: [],
          ntdTotalConsumed: { calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 },
          ntdRemainingCalories: 2400,
          ntdCreatedAt: new Date(),
          ntdUpdatedAt: new Date(),
        };
      }

      const entryId = `men_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      day.ntdMeals.push({
        ntdEntryId: entryId,
        ntdFoodItemId: food._id,
        ntdFoodName: food.foiName,
        ntdMealType: validated.mealType,
        ntdQuantity: validated.quantity,
        ntdUnit: validated.unit,
        ntdServingLabel: servingLabel,
        ntdNutritionSnapshot: snapshot,
        ntdLoggedAt: new Date(),
      });

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

      await this.nutritionRepository.saveNutritionDay(day);

      res.status(201).json({
        id: entryId,
        userId: authUser.userId,
        foodItemId: food._id,
        foodName: food.foiName,
        mealType: validated.mealType,
        quantity: validated.quantity,
        unit: validated.unit,
        servingLabel,
        nutritionSnapshot: snapshot,
        loggedAt: new Date().toISOString(),
        dateString: validated.dateString,
      });
    } catch (error) {
      next(error);
    }
  };

  // 5. Delete Meal Entry
  public deleteMealEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;
      if (!authUser) throw AppError.unauthorized('Authentication required');

      const { dateString, entryId } = req.params;
      if (!dateString || !entryId) throw AppError.badRequest('dateString and entryId are required');

      const updatedDay = await this.nutritionRepository.removeMealEntry(authUser.userId, dateString, entryId);
      if (!updatedDay) throw AppError.notFound('Nutrition log not found');

      res.status(200).json({ success: true, remainingCalories: updatedDay.ntdRemainingCalories });
    } catch (error) {
      next(error);
    }
  };

  // 6. Maintenance Calorie Analysis
  public getMaintenanceAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;
      if (!authUser) throw AppError.unauthorized('Authentication required');

      const days = await this.nutritionRepository.getRecentNutritionDays(authUser.userId, 30);
      const weighIns = this.progressRepository ? await this.progressRepository.getWeightLogs(authUser.userId, 30) : [];

      const dailyLogs = days.map((d) => {
        const matchingWeight = weighIns.find((w) => w.bwlDateString === d.ntdDateString);
        return {
          dateString: d.ntdDateString,
          totalCalories: d.ntdTotalConsumed.calories,
          weightKg: matchingWeight?.bwlWeightKg,
        };
      });

      const now = new Date();
      const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const result = NutritionDomainService.calculateMaintenance(dailyLogs, startDate, now);

      const mcaDoc: MaintenanceAnalysisDocument = {
        _id: `mca_${authUser.userId.replace(/^usr_/, '')}_${Date.now()}`,
        mcaUserId: authUser.userId,
        mcaDaysAnalyzed: result.daysAnalyzed,
        mcaConfidence: result.confidence,
        mcaAverageDailyCalories: result.averageCalories,
        mcaAverageBodyWeightKg: result.averageWeightKg,
        mcaWeightChangeKg: result.weightChangeKg,
        mcaWeightTrendDescription: result.weightChangeKg
          ? result.weightChangeKg > 0 ? `+${result.weightChangeKg} kg trend` : `${result.weightChangeKg} kg trend`
          : 'Weight stable',
        mcaEstimatedMaintenanceCalories: result.estimatedMaintenanceCalories,
        mcaRecommendations: [
          'Log your daily intake consistently to enhance maintenance precision.',
          'Weigh in at least 3 mornings per week under identical fasted conditions.',
        ],
        mcaCalculatedAt: new Date(),
        mcaHistoryPoints: dailyLogs.map((c) => ({
          dateString: c.dateString,
          caloriesLogged: c.totalCalories,
          bodyWeightKg: c.weightKg,
        })),
      };

      await this.nutritionRepository.saveMaintenanceAnalysis(mcaDoc);

      res.status(200).json({
        userId: authUser.userId,
        daysAnalyzed: result.daysAnalyzed,
        confidence: result.confidence,
        averageDailyCalories: result.averageCalories,
        averageBodyWeightKg: result.averageWeightKg,
        weightChangeKg: result.weightChangeKg,
        weightTrendDescription: mcaDoc.mcaWeightTrendDescription,
        estimatedMaintenanceCalories: result.estimatedMaintenanceCalories,
        calculatedAt: mcaDoc.mcaCalculatedAt.toISOString(),
        recommendations: mcaDoc.mcaRecommendations,
        historyPoints: mcaDoc.mcaHistoryPoints,
      });
    } catch (error) {
      next(error);
    }
  };

  // 7. Get Active Diet Plan
  public getActiveDietPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;
      if (!authUser) throw AppError.unauthorized('Authentication required');

      let plan = await this.nutritionRepository.getActiveDietPlan(authUser.userId);
      if (!plan) {
        const generated = this.buildSmartDietPlan(authUser.userId, 2400, 'AMERICAN', 'HIGH_PROTEIN', 'MAINTENANCE');
        await this.nutritionRepository.saveDietPlan(generated);
        plan = generated;
      }

      res.status(200).json(this.mapDietPlanToDto(plan));
    } catch (error) {
      next(error);
    }
  };

  // 8. Generate Diet Plan
  public generateDietPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.user;
      if (!authUser) throw AppError.unauthorized('Authentication required');

      const validated = GenerateDietPlanRequestSchema.parse(req.body);
      const newPlan = this.buildSmartDietPlan(
        authUser.userId,
        validated.targetDailyCalories,
        validated.cuisineType,
        validated.macroSplitPreference,
        validated.goalMode,
        validated.dietaryPreferences,
        validated.allergies
      );

      await this.nutritionRepository.saveDietPlan(newPlan);
      res.status(201).json(this.mapDietPlanToDto(newPlan));
    } catch (error) {
      next(error);
    }
  };

  private mapFoodToDto(f: FoodItemDocument) {
    return {
      id: f._id,
      name: f.foiName,
      brand: f.foiBrand,
      barcode: f.foiBarcode,
      category: f.foiCategory,
      standardBasis: f.foiStandardBasis,
      nutrientsPerBasis: {
        calories: f.foiCaloriesPer100Basis,
        proteinGrams: f.foiProteinPer100Basis,
        carbsGrams: f.foiCarbsPer100Basis,
        fatGrams: f.foiFatPer100Basis,
        fiberGrams: f.foiFiberPer100Basis,
        sugarGrams: f.foiSugarPer100Basis,
        sodiumMg: f.foiSodiumMgPer100Basis,
      },
      availableServings: f.foiAvailableServings.map((s) => ({
        id: s.foiServingId,
        label: s.foiServingLabel,
        unitType: s.foiUnitType,
        baseAmount: s.foiBaseAmount,
        basisEquivalentFactor: s.foiBasisEquivalentFactor,
        isDefault: s.foiIsDefault,
      })),
      isVerified: f.foiIsVerified,
    };
  }

  private mapDietPlanToDto(p: DietPlanDocument) {
    return {
      id: p._id,
      userId: p.dplUserId,
      title: p.dplTitle,
      cuisineType: p.dplCuisineType,
      goalMode: p.dplGoalMode,
      targetDailyCalories: p.dplTargetDailyCalories,
      targetMacros: p.dplTargetMacros,
      meals: p.dplMeals.map((m) => ({
        mealType: m.dplMealType,
        title: m.dplTitle,
        targetTime: m.dplTargetTime,
        items: m.dplItems.map((item) => ({
          foodItemId: item.dplFoodItemId,
          name: item.dplName,
          quantity: item.dplQuantity,
          unit: item.dplUnit,
          portionDescription: item.dplPortionDescription,
          nutrients: item.dplNutrients,
          notes: item.dplNotes,
        })),
        totalNutrients: m.dplTotalNutrients,
      })),
      dietaryPreferences: p.dplDietaryPreferences,
      allergies: p.dplAllergies,
      isActive: p.dplIsActive,
      generatedBy: p.dplGeneratedBy,
      createdAt: p.dplCreatedAt.toISOString(),
      updatedAt: p.dplUpdatedAt.toISOString(),
    };
  }

  private buildSmartDietPlan(
    userId: string,
    targetCalories: number,
    cuisine: 'AMERICAN' | 'NORTH_INDIAN' | 'SOUTH_INDIAN' | 'MEDITERRANEAN' | 'ASIAN' | 'CUSTOM',
    macroPreference: string = 'HIGH_PROTEIN',
    goalMode: 'DEFICIT' | 'MAINTENANCE' | 'SURPLUS' = 'MAINTENANCE',
    preferences: string[] = [],
    allergies: string[] = []
  ): DietPlanDocument {
    const dplId = `dpl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    // Macro ratios
    let proteinRatio = 0.35, carbRatio = 0.40, fatRatio = 0.25;
    if (macroPreference === 'BALANCED') { proteinRatio = 0.30; carbRatio = 0.45; fatRatio = 0.25; }
    if (macroPreference === 'LOW_CARB') { proteinRatio = 0.40; carbRatio = 0.25; fatRatio = 0.35; }
    if (macroPreference === 'KETO') { proteinRatio = 0.30; carbRatio = 0.05; fatRatio = 0.65; }

    const targetProtein = Math.round((targetCalories * proteinRatio) / 4);
    const targetCarbs = Math.round((targetCalories * carbRatio) / 4);
    const targetFat = Math.round((targetCalories * fatRatio) / 9);

    const mealTemplates: Record<string, any[]> = {
      AMERICAN: [
        {
          mealType: 'BREAKFAST',
          title: 'Power Oats & Whey',
          items: [
            { name: 'Rolled Oats', quantity: 80, unit: 'g', portionDescription: '1 cup cooked', nutrients: { calories: 300, proteinGrams: 10, carbsGrams: 54, fatGrams: 5 } },
            { name: 'Whey Isolate Protein', quantity: 35, unit: 'g', portionDescription: '1 scoop', nutrients: { calories: 130, proteinGrams: 30, carbsGrams: 2, fatGrams: 1 } },
            { name: 'Blueberries', quantity: 75, unit: 'g', portionDescription: '1/2 cup fresh', nutrients: { calories: 45, proteinGrams: 1, carbsGrams: 11, fatGrams: 0 } },
          ],
        },
        {
          mealType: 'LUNCH',
          title: 'Grilled Chicken & Sweet Potato Bowl',
          items: [
            { name: 'Chicken Breast (Grilled)', quantity: 200, unit: 'g', portionDescription: '7 oz lean breast', nutrients: { calories: 330, proteinGrams: 62, carbsGrams: 0, fatGrams: 7 } },
            { name: 'Baked Sweet Potato', quantity: 200, unit: 'g', portionDescription: '1 medium', nutrients: { calories: 180, proteinGrams: 4, carbsGrams: 41, fatGrams: 0 } },
            { name: 'Steamed Broccoli & Olive Oil', quantity: 150, unit: 'g', portionDescription: '1 bowl', nutrients: { calories: 110, proteinGrams: 4, carbsGrams: 10, fatGrams: 6 } },
          ],
        },
        {
          mealType: 'DINNER',
          title: 'Wild Salmon & Quinoa',
          items: [
            { name: 'Wild Atlantic Salmon', quantity: 180, unit: 'g', portionDescription: '6 oz fillet', nutrients: { calories: 375, proteinGrams: 40, carbsGrams: 0, fatGrams: 22 } },
            { name: 'Cooked Quinoa', quantity: 150, unit: 'g', portionDescription: '3/4 cup', nutrients: { calories: 180, proteinGrams: 6, carbsGrams: 32, fatGrams: 3 } },
            { name: 'Roasted Asparagus', quantity: 100, unit: 'g', portionDescription: '8 spears', nutrients: { calories: 40, proteinGrams: 3, carbsGrams: 4, fatGrams: 1 } },
          ],
        },
      ],
      SOUTH_INDIAN: [
        {
          mealType: 'BREAKFAST',
          title: 'High Protein Idli & Sambar Bowl',
          items: [
            { name: 'Steamed Ragi/Rice Idli', quantity: 3, unit: 'piece', portionDescription: '3 medium idlis', nutrients: { calories: 195, proteinGrams: 6, carbsGrams: 40, fatGrams: 1 } },
            { name: 'Mixed Vegetable Toor Dal Sambar', quantity: 200, unit: 'ml', portionDescription: '1 deep bowl', nutrients: { calories: 140, proteinGrams: 8, carbsGrams: 20, fatGrams: 3 } },
            { name: 'Boiled Egg Whites / Paneer Cubes', quantity: 100, unit: 'g', portionDescription: '4 egg whites / 50g paneer', nutrients: { calories: 130, proteinGrams: 20, carbsGrams: 2, fatGrams: 4 } },
          ],
        },
        {
          mealType: 'LUNCH',
          title: 'Brown Rice, Chicken/Soy Chukka & Rasam',
          items: [
            { name: 'Chicken Breast Pepper Chukka (Low Oil)', quantity: 200, unit: 'g', portionDescription: 'Spiced chicken roast', nutrients: { calories: 320, proteinGrams: 55, carbsGrams: 4, fatGrams: 9 } },
            { name: 'Brown Ponni Rice', quantity: 180, unit: 'g', portionDescription: '1 cup cooked', nutrients: { calories: 215, proteinGrams: 5, carbsGrams: 45, fatGrams: 2 } },
            { name: 'Tomato Pepper Rasam & Cabbage Poriyal', quantity: 150, unit: 'g', portionDescription: '1 portion', nutrients: { calories: 85, proteinGrams: 3, carbsGrams: 12, fatGrams: 3 } },
          ],
        },
        {
          mealType: 'DINNER',
          title: 'Pesarattu (Moong Dal Dosa) & Greek Curd',
          items: [
            { name: 'Green Moong Dal Pesarattu', quantity: 2, unit: 'piece', portionDescription: '2 crisp crepes', nutrients: { calories: 280, proteinGrams: 18, carbsGrams: 42, fatGrams: 4 } },
            { name: 'Paneer Bhurji / Grilled Chicken Filling', quantity: 120, unit: 'g', portionDescription: '1 portion', nutrients: { calories: 220, proteinGrams: 22, carbsGrams: 5, fatGrams: 12 } },
            { name: 'Fresh Mint Coriander Chutney', quantity: 40, unit: 'g', portionDescription: '2 tbsp', nutrients: { calories: 45, proteinGrams: 1, carbsGrams: 3, fatGrams: 3 } },
          ],
        },
      ],
      NORTH_INDIAN: [
        {
          mealType: 'BREAKFAST',
          title: 'Paneer Stuffed Multigrain Paratha & Dahi',
          items: [
            { name: 'Multigrain Paneer Paratha (Dry Tawa)', quantity: 2, unit: 'piece', portionDescription: '2 parathas', nutrients: { calories: 340, proteinGrams: 20, carbsGrams: 44, fatGrams: 9 } },
            { name: 'Low Fat Curd / Dahi', quantity: 150, unit: 'g', portionDescription: '1 cup', nutrients: { calories: 90, proteinGrams: 8, carbsGrams: 9, fatGrams: 2 } },
          ],
        },
        {
          mealType: 'LUNCH',
          title: 'Tandoori Chicken Breast & Yellow Dal Tadka',
          items: [
            { name: 'Tandoori Spiced Chicken Breast', quantity: 220, unit: 'g', portionDescription: 'Lean roasted breast', nutrients: { calories: 340, proteinGrams: 64, carbsGrams: 3, fatGrams: 7 } },
            { name: 'Yellow Moong Dal Tadka', quantity: 150, unit: 'g', portionDescription: '1 bowl', nutrients: { calories: 150, proteinGrams: 9, carbsGrams: 22, fatGrams: 3 } },
            { name: 'Whole Wheat Phulka (No Ghee)', quantity: 2, unit: 'piece', portionDescription: '2 rotis', nutrients: { calories: 160, proteinGrams: 6, carbsGrams: 32, fatGrams: 1 } },
          ],
        },
        {
          mealType: 'DINNER',
          title: 'Egg Curry / Tofu Makhani with Jeera Rice',
          items: [
            { name: 'Egg White Curry / Light Tofu Makhani', quantity: 200, unit: 'g', portionDescription: '1 deep serving', nutrients: { calories: 250, proteinGrams: 24, carbsGrams: 14, fatGrams: 10 } },
            { name: 'Steamed Jeera Basmati Rice', quantity: 150, unit: 'g', portionDescription: '3/4 cup cooked', nutrients: { calories: 195, proteinGrams: 4, carbsGrams: 42, fatGrams: 1 } },
            { name: 'Cucumber Onion Kachumber Salad', quantity: 100, unit: 'g', portionDescription: '1 bowl', nutrients: { calories: 35, proteinGrams: 1, carbsGrams: 7, fatGrams: 0 } },
          ],
        },
      ],
      MEDITERRANEAN: [
        {
          mealType: 'BREAKFAST',
          title: 'Greek Yogurt Parfait with Walnuts & Honey',
          items: [
            { name: '0% Greek Yogurt', quantity: 200, unit: 'g', portionDescription: '1 large cup', nutrients: { calories: 130, proteinGrams: 22, carbsGrams: 7, fatGrams: 0 } },
            { name: 'Crushed Walnuts', quantity: 25, unit: 'g', portionDescription: 'Small handful', nutrients: { calories: 165, proteinGrams: 4, carbsGrams: 3, fatGrams: 16 } },
            { name: 'Mixed Berries & Honey drizzle', quantity: 60, unit: 'g', portionDescription: '1 portion', nutrients: { calories: 60, proteinGrams: 1, carbsGrams: 14, fatGrams: 0 } },
          ],
        },
        {
          mealType: 'LUNCH',
          title: 'Mediterranean Grilled Chicken Salad',
          items: [
            { name: 'Herb Grilled Chicken Breast', quantity: 200, unit: 'g', portionDescription: '7 oz grilled chicken', nutrients: { calories: 320, proteinGrams: 60, carbsGrams: 0, fatGrams: 7 } },
            { name: 'Greek Salad (Cucumbers, Olives, Feta)', quantity: 150, unit: 'g', portionDescription: '1 bowl', nutrients: { calories: 180, proteinGrams: 7, carbsGrams: 8, fatGrams: 13 } },
            { name: 'Whole Wheat Pita Pocket', quantity: 1, unit: 'piece', portionDescription: '1 pita', nutrients: { calories: 140, proteinGrams: 5, carbsGrams: 28, fatGrams: 1 } },
          ],
        },
        {
          mealType: 'DINNER',
          title: 'Baked Sea Bass with Lemon Couscous',
          items: [
            { name: 'Baked Sea Bass Fillet', quantity: 200, unit: 'g', portionDescription: '7 oz white fish', nutrients: { calories: 250, proteinGrams: 46, carbsGrams: 0, fatGrams: 6 } },
            { name: 'Herb Lemon Couscous', quantity: 140, unit: 'g', portionDescription: '3/4 cup', nutrients: { calories: 160, proteinGrams: 5, carbsGrams: 32, fatGrams: 1 } },
            { name: 'Grilled Zucchini & Bell Peppers', quantity: 120, unit: 'g', portionDescription: '1 plate', nutrients: { calories: 50, proteinGrams: 2, carbsGrams: 9, fatGrams: 1 } },
          ],
        },
      ],
      ASIAN: [
        {
          mealType: 'BREAKFAST',
          title: 'Silken Tofu & Egg White Miso Soup',
          items: [
            { name: 'Miso Broth with Soft Tofu & Scallions', quantity: 250, unit: 'ml', portionDescription: '1 warm bowl', nutrients: { calories: 120, proteinGrams: 12, carbsGrams: 8, fatGrams: 4 } },
            { name: 'Boiled / Poached Eggs', quantity: 2, unit: 'piece', portionDescription: '2 whole eggs', nutrients: { calories: 145, proteinGrams: 13, carbsGrams: 1, fatGrams: 10 } },
            { name: 'Steamed Edamame Pods', quantity: 80, unit: 'g', portionDescription: '1/2 cup', nutrients: { calories: 95, proteinGrams: 9, carbsGrams: 6, fatGrams: 4 } },
          ],
        },
        {
          mealType: 'LUNCH',
          title: 'Teriyaki Chicken Breast & Jasmine Rice',
          items: [
            { name: 'Teriyaki Glazed Chicken Breast', quantity: 200, unit: 'g', portionDescription: '7 oz lean breast', nutrients: { calories: 340, proteinGrams: 58, carbsGrams: 8, fatGrams: 7 } },
            { name: 'Steamed Jasmine Rice', quantity: 180, unit: 'g', portionDescription: '1 cup cooked', nutrients: { calories: 230, proteinGrams: 4, carbsGrams: 50, fatGrams: 0 } },
            { name: 'Stir Fried Bok Choy & Garlic', quantity: 120, unit: 'g', portionDescription: '1 side dish', nutrients: { calories: 45, proteinGrams: 2, carbsGrams: 5, fatGrams: 2 } },
          ],
        },
        {
          mealType: 'DINNER',
          title: 'Spicy Garlic Shrimp Stir-Fry',
          items: [
            { name: 'Tiger Shrimp in Garlic Chili Sauce', quantity: 200, unit: 'g', portionDescription: '8 large prawns', nutrients: { calories: 240, proteinGrams: 48, carbsGrams: 4, fatGrams: 3 } },
            { name: 'Rice Noodles / Buckwheat Soba', quantity: 140, unit: 'g', portionDescription: '1 portion', nutrients: { calories: 180, proteinGrams: 5, carbsGrams: 37, fatGrams: 1 } },
            { name: 'Snap Peas & Shiitake Mushrooms', quantity: 100, unit: 'g', portionDescription: '1 cup veggies', nutrients: { calories: 55, proteinGrams: 3, carbsGrams: 9, fatGrams: 1 } },
          ],
        },
      ],
      CUSTOM: [],
    };

    const chosenTemplate = mealTemplates[cuisine] || mealTemplates['AMERICAN'] || [];

    const meals = chosenTemplate.map((m: any) => {
      let cal = 0, p = 0, c = 0, f = 0;
      for (const it of m.items) {
        cal += it.nutrients.calories;
        p += it.nutrients.proteinGrams;
        c += it.nutrients.carbsGrams;
        f += it.nutrients.fatGrams;
      }
      return {
        dplMealType: m.mealType,
        dplTitle: m.title,
        dplTargetTime: m.mealType === 'BREAKFAST' ? '08:30' : m.mealType === 'LUNCH' ? '13:00' : '19:30',
        dplItems: m.items.map((it: any) => ({
          dplFoodItemId: undefined,
          dplName: it.name,
          dplQuantity: it.quantity,
          dplUnit: it.unit,
          dplPortionDescription: it.portionDescription,
          dplNutrients: it.nutrients,
          dplNotes: undefined,
        })),
        dplTotalNutrients: {
          calories: Math.round(cal),
          proteinGrams: Math.round(p),
          carbsGrams: Math.round(c),
          fatGrams: Math.round(f),
        },
      };
    });

    return {
      _id: dplId,
      dplUserId: userId,
      dplTitle: `${cuisine.replace(/_/g, ' ')} Hypertrophy & Performance`,
      dplCuisineType: cuisine,
      dplGoalMode: goalMode,
      dplTargetDailyCalories: targetCalories,
      dplTargetMacros: {
        calories: targetCalories,
        proteinGrams: targetProtein,
        carbsGrams: targetCarbs,
        fatGrams: targetFat,
      },
      dplMeals: meals,
      dplDietaryPreferences: preferences,
      dplAllergies: allergies,
      dplIsActive: true,
      dplGeneratedBy: 'AI',
      dplCreatedAt: new Date(),
      dplUpdatedAt: new Date(),
    };
  }

  private async seedDefaultFoods(): Promise<void> {
    const seeds: FoodItemDocument[] = [
      {
        _id: 'foi_chicken_breast',
        foiName: 'Boneless Skinless Chicken Breast',
        foiCategory: 'Poultry',
        foiStandardBasis: 'PER_100G',
        foiCaloriesPer100Basis: 165,
        foiProteinPer100Basis: 31,
        foiCarbsPer100Basis: 0,
        foiFatPer100Basis: 3.6,
        foiAvailableServings: [
          { foiServingId: 'srv_100g', foiServingLabel: '100g raw', foiUnitType: 'GRAMS', foiBaseAmount: 100, foiBasisEquivalentFactor: 1.0, foiIsDefault: true },
          { foiServingId: 'srv_200g', foiServingLabel: '200g fillet', foiUnitType: 'GRAMS', foiBaseAmount: 200, foiBasisEquivalentFactor: 2.0 },
        ],
        foiIsVerified: true,
        foiCreatedAt: new Date(),
        foiUpdatedAt: new Date(),
      },
      {
        _id: 'foi_basmati_rice',
        foiName: 'Basmati White Rice (Cooked)',
        foiCategory: 'Grains',
        foiStandardBasis: 'PER_100G',
        foiCaloriesPer100Basis: 130,
        foiProteinPer100Basis: 2.7,
        foiCarbsPer100Basis: 28,
        foiFatPer100Basis: 0.3,
        foiAvailableServings: [
          { foiServingId: 'srv_100g', foiServingLabel: '100g cooked', foiUnitType: 'GRAMS', foiBaseAmount: 100, foiBasisEquivalentFactor: 1.0, foiIsDefault: true },
          { foiServingId: 'srv_1cup', foiServingLabel: '1 Cup cooked (158g)', foiUnitType: 'CUP', foiBaseAmount: 158, foiBasisEquivalentFactor: 1.58 },
        ],
        foiIsVerified: true,
        foiCreatedAt: new Date(),
        foiUpdatedAt: new Date(),
      },
      {
        _id: 'foi_whey_isolate',
        foiName: 'Whey Protein Isolate (Vanilla / Chocolate)',
        foiCategory: 'Supplements',
        foiStandardBasis: 'PER_100G',
        foiCaloriesPer100Basis: 370,
        foiProteinPer100Basis: 86,
        foiCarbsPer100Basis: 4,
        foiFatPer100Basis: 1.5,
        foiAvailableServings: [
          { foiServingId: 'srv_1scoop', foiServingLabel: '1 Scoop (32g)', foiUnitType: 'SCOOP', foiBaseAmount: 32, foiBasisEquivalentFactor: 0.32, foiIsDefault: true },
        ],
        foiIsVerified: true,
        foiCreatedAt: new Date(),
        foiUpdatedAt: new Date(),
      },
      {
        _id: 'foi_paneer',
        foiName: 'Fresh Cottage Cheese (Paneer)',
        foiCategory: 'Dairy',
        foiStandardBasis: 'PER_100G',
        foiCaloriesPer100Basis: 290,
        foiProteinPer100Basis: 18,
        foiCarbsPer100Basis: 4,
        foiFatPer100Basis: 22,
        foiAvailableServings: [
          { foiServingId: 'srv_100g', foiServingLabel: '100g cubes', foiUnitType: 'GRAMS', foiBaseAmount: 100, foiBasisEquivalentFactor: 1.0, foiIsDefault: true },
        ],
        foiIsVerified: true,
        foiCreatedAt: new Date(),
        foiUpdatedAt: new Date(),
      },
      {
        _id: 'foi_whole_egg',
        foiName: 'Whole Large Egg',
        foiCategory: 'Poultry',
        foiStandardBasis: 'PER_100G',
        foiCaloriesPer100Basis: 143,
        foiProteinPer100Basis: 12.6,
        foiCarbsPer100Basis: 0.7,
        foiFatPer100Basis: 9.5,
        foiAvailableServings: [
          { foiServingId: 'srv_1egg', foiServingLabel: '1 Large Egg (50g)', foiUnitType: 'PIECE', foiBaseAmount: 50, foiBasisEquivalentFactor: 0.5, foiIsDefault: true },
        ],
        foiIsVerified: true,
        foiCreatedAt: new Date(),
        foiUpdatedAt: new Date(),
      },
      {
        _id: 'foi_egg_white',
        foiName: 'Liquid Egg Whites',
        foiCategory: 'Poultry',
        foiStandardBasis: 'PER_100G',
        foiCaloriesPer100Basis: 52,
        foiProteinPer100Basis: 11,
        foiCarbsPer100Basis: 0.7,
        foiFatPer100Basis: 0.2,
        foiAvailableServings: [
          { foiServingId: 'srv_100ml', foiServingLabel: '100ml (approx 3 whites)', foiUnitType: 'MILLILITERS', foiBaseAmount: 100, foiBasisEquivalentFactor: 1.0, foiIsDefault: true },
        ],
        foiIsVerified: true,
        foiCreatedAt: new Date(),
        foiUpdatedAt: new Date(),
      },
      {
        _id: 'foi_rolled_oats',
        foiName: 'Whole Rolled Oats',
        foiCategory: 'Grains',
        foiStandardBasis: 'PER_100G',
        foiCaloriesPer100Basis: 389,
        foiProteinPer100Basis: 16.9,
        foiCarbsPer100Basis: 66.3,
        foiFatPer100Basis: 6.9,
        foiFiberPer100Basis: 10.6,
        foiAvailableServings: [
          { foiServingId: 'srv_40g', foiServingLabel: '1/2 Cup Dry (40g)', foiUnitType: 'CUP', foiBaseAmount: 40, foiBasisEquivalentFactor: 0.4, foiIsDefault: true },
          { foiServingId: 'srv_100g', foiServingLabel: '100g Dry', foiUnitType: 'GRAMS', foiBaseAmount: 100, foiBasisEquivalentFactor: 1.0 },
        ],
        foiIsVerified: true,
        foiCreatedAt: new Date(),
        foiUpdatedAt: new Date(),
      },
    ];

    for (const item of seeds) {
      await this.nutritionRepository.saveFoodItem(item);
    }
  }
}
