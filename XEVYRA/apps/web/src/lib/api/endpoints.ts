import { apiClient } from './api-client';
import {
  DashboardResponseDto,
  UserProfileResponseDto,
  UpdateProfileRequestDto,
  WorkoutRoutineDto,
  WorkoutSessionDto,
  ExerciseDto,
  CreateCustomExerciseRequestDto,
  CreateRoutineRequestDto,
  StartWorkoutSessionRequestDto,
  LogWorkoutSetRequestDto,
  CompleteWorkoutSessionRequestDto,
  DailyNutritionSummaryResponseDto,
  LogFoodEntryRequestDto,
  FoodItemResponseDto,
  DietPlanResponseDto,
  GenerateDietPlanRequestDto,
  MaintenanceCalorieAnalysisResponseDto,
  ProgressSummaryResponseDto,
  LogBodyweightRequestDto,
  BodyweightLogDto,
} from '@xevyra/contracts';

// Dashboard Endpoints
export async function getDashboard(): Promise<DashboardResponseDto> {
  return apiClient.get<DashboardResponseDto>('/dashboard');
}

// Profile Endpoints
export async function getProfile(): Promise<UserProfileResponseDto> {
  return apiClient.get<UserProfileResponseDto>('/profile');
}

export async function updateProfile(data: UpdateProfileRequestDto): Promise<UserProfileResponseDto> {
  return apiClient.patch<UserProfileResponseDto>('/profile', data);
}

// Training & Workout Endpoints
export async function getExercises(): Promise<{ exercises: ExerciseDto[] }> {
  return apiClient.get<{ exercises: ExerciseDto[] }>('/workouts/exercises');
}

export async function createExercise(data: CreateCustomExerciseRequestDto): Promise<ExerciseDto> {
  return apiClient.post<ExerciseDto>('/workouts/exercises', data);
}

export async function getRoutines(): Promise<{ routines: WorkoutRoutineDto[] }> {
  return apiClient.get<{ routines: WorkoutRoutineDto[] }>('/workouts/routines');
}

export async function createRoutine(data: CreateRoutineRequestDto): Promise<WorkoutRoutineDto> {
  return apiClient.post<WorkoutRoutineDto>('/workouts/routines', data);
}

export async function startWorkoutSession(data: StartWorkoutSessionRequestDto): Promise<WorkoutSessionDto> {
  return apiClient.post<WorkoutSessionDto>('/workouts/sessions', data);
}

export async function logWorkoutSet(sessionId: string, data: LogWorkoutSetRequestDto): Promise<WorkoutSessionDto> {
  return apiClient.patch<WorkoutSessionDto>(`/workouts/sessions/${sessionId}/sets`, data);
}

export async function completeWorkoutSession(sessionId: string, data: CompleteWorkoutSessionRequestDto): Promise<WorkoutSessionDto> {
  return apiClient.post<WorkoutSessionDto>(`/workouts/sessions/${sessionId}/complete`, data);
}

export async function getWorkoutSessions(limit: number = 20, skip: number = 0): Promise<{ sessions: WorkoutSessionDto[] }> {
  return apiClient.get<{ sessions: WorkoutSessionDto[] }>(`/workouts/sessions?limit=${limit}&skip=${skip}`);
}

// Nutrition Endpoints
export async function getNutritionSummary(dateString?: string): Promise<DailyNutritionSummaryResponseDto> {
  const query = dateString ? `?date=${dateString}` : '';
  return apiClient.get<DailyNutritionSummaryResponseDto>(`/nutrition/summary${query}`);
}

export async function searchFoods(query: string, category?: string, limit: number = 30): Promise<{ items: FoodItemResponseDto[] }> {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  if (category) params.append('category', category);
  if (limit) params.append('limit', limit.toString());
  return apiClient.get<{ items: FoodItemResponseDto[] }>(`/nutrition/foods/search?${params.toString()}`);
}

export async function createCustomFood(data: any): Promise<FoodItemResponseDto> {
  return apiClient.post<FoodItemResponseDto>('/nutrition/foods/custom', data);
}

export async function logFoodEntry(data: LogFoodEntryRequestDto): Promise<any> {
  return apiClient.post('/nutrition/log', data);
}

export async function deleteMealEntry(dateString: string, entryId: string): Promise<{ success: boolean; remainingCalories: number }> {
  return apiClient.delete<{ success: boolean; remainingCalories: number }>(`/nutrition/log/${dateString}/${entryId}`);
}

export async function getMaintenanceAnalysis(): Promise<MaintenanceCalorieAnalysisResponseDto> {
  return apiClient.get<MaintenanceCalorieAnalysisResponseDto>('/nutrition/maintenance/analysis');
}

export async function getActiveDietPlan(): Promise<DietPlanResponseDto> {
  return apiClient.get<DietPlanResponseDto>('/nutrition/diet-plan');
}

export async function generateDietPlan(data: GenerateDietPlanRequestDto): Promise<DietPlanResponseDto> {
  return apiClient.post<DietPlanResponseDto>('/nutrition/diet-plan/generate', data);
}

// Progress Endpoints
export async function getProgressSummary(): Promise<ProgressSummaryResponseDto> {
  return apiClient.get<ProgressSummaryResponseDto>('/progress/summary');
}

export async function logBodyweight(data: LogBodyweightRequestDto): Promise<BodyweightLogDto> {
  return apiClient.post<BodyweightLogDto>('/progress/bodyweight', data);
}
