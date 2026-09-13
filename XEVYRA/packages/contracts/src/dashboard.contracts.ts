import { z } from 'zod';

export const DashboardResponseSchema = z.object({
  athlete: z.object({
    name: z.string(),
    streakDays: z.number().int(),
    focusToday: z.string(),
    dailyCalories: z.object({
      consumed: z.number(),
      target: z.number(),
      remaining: z.number(),
    }),
    macros: z.object({
      protein: z.object({ consumed: z.number(), target: z.number() }),
      carbs: z.object({ consumed: z.number(), target: z.number() }),
      fat: z.object({ consumed: z.number(), target: z.number() }),
    }),
    todayWorkout: z.object({
      id: z.string(),
      name: z.string(),
      muscleGroups: z.array(z.string()),
      exerciseCount: z.number(),
      estimatedMinutes: z.number(),
      status: z.enum(['READY', 'IN_PROGRESS', 'COMPLETED']),
      lastCompletedDate: z.string().optional(),
    }).optional(),
    recentPRs: z.array(z.object({
      exerciseName: z.string(),
      weight: z.number(),
      reps: z.number(),
    })),
  }),
});
export type DashboardResponseDto = z.infer<typeof DashboardResponseSchema>;
