import { z } from 'zod';

export const ExerciseMuscleGroupSchema = z.enum([
  'CHEST',
  'BACK',
  'LEGS',
  'SHOULDERS',
  'ARMS',
  'CORE',
]);
export type ExerciseMuscleGroupDto = z.infer<typeof ExerciseMuscleGroupSchema>;

export const ExerciseEquipmentSchema = z.enum([
  'BARBELL',
  'DUMBBELLS',
  'CABLE',
  'MACHINE',
  'BODYWEIGHT',
  'KETTLEBELL',
]);
export type ExerciseEquipmentDto = z.infer<typeof ExerciseEquipmentSchema>;

export const ExerciseResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  muscleGroup: ExerciseMuscleGroupSchema,
  secondaryMuscles: z.array(z.string()).optional(),
  equipment: ExerciseEquipmentSchema,
  standardIncrementKg: z.number().default(2.5),
  isCustom: z.boolean(),
  createdByUserId: z.string().optional(),
});
export type ExerciseResponseDto = z.infer<typeof ExerciseResponseSchema>;
export type ExerciseDto = ExerciseResponseDto;

export const CreateCustomExerciseRequestSchema = z.object({
  name: z.string().min(2).max(100),
  muscleGroup: ExerciseMuscleGroupSchema,
  secondaryMuscles: z.array(z.string()).optional(),
  equipment: ExerciseEquipmentSchema,
  standardIncrementKg: z.number().positive().default(2.5),
});
export type CreateCustomExerciseRequestDto = z.infer<typeof CreateCustomExerciseRequestSchema>;

export const RoutineExerciseSchema = z.object({
  exerciseId: z.string(),
  exerciseName: z.string(),
  order: z.number().int().min(1),
  targetSets: z.number().int().min(1),
  targetReps: z.number().int().min(1),
  restSeconds: z.number().int().min(0).default(90),
  notes: z.string().optional(),
});
export type RoutineExerciseDto = z.infer<typeof RoutineExerciseSchema>;

export const WorkoutRoutineSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1).max(100),
  muscleGroups: z.array(z.string()),
  estimatedMinutes: z.number().int().min(5),
  exercises: z.array(RoutineExerciseSchema),
  lastCompletedDate: z.string().optional(),
  isArchived: z.boolean().default(false),
});
export type WorkoutRoutineDto = z.infer<typeof WorkoutRoutineSchema>;

export const CreateRoutineRequestSchema = z.object({
  name: z.string().min(1).max(100),
  muscleGroups: z.array(z.string()).min(1),
  estimatedMinutes: z.number().int().min(5).max(300).default(60),
  exercises: z.array(RoutineExerciseSchema).min(1),
});
export type CreateRoutineRequestDto = z.infer<typeof CreateRoutineRequestSchema>;

export const WorkoutSetSchema = z.object({
  setNumber: z.number().int().min(1),
  type: z.enum(['NORMAL', 'WARMUP', 'DROPSET', 'FAILURE']).default('NORMAL'),
  weightKg: z.number().min(0),
  reps: z.number().int().min(0),
  rpe: z.number().min(1).max(10).optional(),
  isCompleted: z.boolean().default(false),
  previousPerformance: z.string().optional(),
  completedAt: z.string().datetime().optional(),
});
export type WorkoutSetDto = z.infer<typeof WorkoutSetSchema>;

export const SessionExerciseSchema = z.object({
  exerciseId: z.string(),
  name: z.string(),
  targetMuscle: z.string(),
  equipment: z.string(),
  sets: z.array(WorkoutSetSchema),
});
export type SessionExerciseDto = z.infer<typeof SessionExerciseSchema>;

export const PRAchievementSchema = z.object({
  exerciseId: z.string(),
  exerciseName: z.string(),
  weightKg: z.number(),
  reps: z.number(),
  estimated1RM: z.number(),
});
export type PRAchievementDto = z.infer<typeof PRAchievementSchema>;

export const WorkoutSessionResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  routineId: z.string().optional(),
  routineName: z.string(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
  durationMinutes: z.number().int(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  totalVolumeKg: z.number(),
  totalSetsCompleted: z.number(),
  exercises: z.array(SessionExerciseSchema),
  prsAchieved: z.array(PRAchievementSchema),
  notes: z.string().optional(),
  version: z.number().int(),
});
export type WorkoutSessionResponseDto = z.infer<typeof WorkoutSessionResponseSchema>;
export type WorkoutSessionDto = WorkoutSessionResponseDto;

export const StartWorkoutSessionRequestSchema = z.object({
  routineId: z.string().optional(),
  routineName: z.string().min(1),
  exercises: z.array(SessionExerciseSchema),
  clientMutationId: z.string().optional(),
});
export type StartWorkoutSessionRequestDto = z.infer<typeof StartWorkoutSessionRequestSchema>;

export const LogWorkoutSetRequestSchema = z.object({
  exerciseId: z.string(),
  setNumber: z.number().int().min(1),
  type: z.enum(['NORMAL', 'WARMUP', 'DROPSET', 'FAILURE']).default('NORMAL'),
  weightKg: z.number().min(0),
  reps: z.number().int().min(0),
  rpe: z.number().min(1).max(10).optional(),
  isCompleted: z.boolean(),
  version: z.number().int().optional(),
  clientMutationId: z.string().optional(),
});
export type LogWorkoutSetRequestDto = z.infer<typeof LogWorkoutSetRequestSchema>;

export const CompleteWorkoutSessionRequestSchema = z.object({
  endedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
  version: z.number().int().optional(),
  clientMutationId: z.string().optional(),
});
export type CompleteWorkoutSessionRequestDto = z.infer<typeof CompleteWorkoutSessionRequestSchema>;
