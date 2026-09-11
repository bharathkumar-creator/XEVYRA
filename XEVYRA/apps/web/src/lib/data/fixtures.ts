export interface AthleteDashboardData {
  user: {
    id: string;
    displayName: string;
    avatarUrl: string;
    greeting: string;
    motivationalMessage: string;
  };
  date: {
    dateString: string;
    displayDate: string;
  };
  calories: {
    consumed: number;
    target: number;
    percentage: number;
  };
  macros: {
    protein: { consumed: number; target: number; percentage: number };
    carbs: { consumed: number; target: number; percentage: number };
    fats: { consumed: number; target: number; percentage: number };
  };
  weight: {
    currentKg: number;
    previousWeekDiffKg: number;
    weeklyTrend: Array<{ day: string; weightKg: number }>;
  };
  streak: {
    days: number;
    message: string;
  };
  todayWorkout: {
    id: string;
    title: string;
    muscles: string;
    exerciseCount: number;
    estimatedMinutes: number;
    thumbnailUrl: string;
    isCompleted: boolean;
  };
  todayMeal: {
    id: string;
    mealType: string;
    description: string;
    calories: number;
    thumbnailUrl: string;
  };
}

export const INITIAL_DASHBOARD_FIXTURE: AthleteDashboardData = {
  user: {
    id: 'usr_athlete_bharath',
    displayName: 'Bharath',
    avatarUrl: '/images/athlete-avatar.jpg',
    greeting: 'Good morning,',
    motivationalMessage: 'Small steps. Big results. Keep going! 💪',
  },
  date: {
    dateString: '2026-09-10',
    displayDate: 'Wed, 10 Sep 2026',
  },
  calories: {
    consumed: 1650,
    target: 2200,
    percentage: 75,
  },
  macros: {
    protein: { consumed: 120, target: 180, percentage: 67 },
    carbs: { consumed: 180, target: 275, percentage: 65 },
    fats: { consumed: 55, target: 70, percentage: 79 },
  },
  weight: {
    currentKg: 70.2,
    previousWeekDiffKg: -0.8,
    weeklyTrend: [
      { day: 'Thu', weightKg: 71.0 },
      { day: 'Fri', weightKg: 70.9 },
      { day: 'Sat', weightKg: 70.6 },
      { day: 'Sun', weightKg: 70.7 },
      { day: 'Mon', weightKg: 70.4 },
      { day: 'Tue', weightKg: 70.3 },
      { day: 'Wed', weightKg: 70.2 },
    ],
  },
  streak: {
    days: 12,
    message: 'Keep it up! 🔥',
  },
  todayWorkout: {
    id: 'wk_push_a',
    title: 'Push Day A',
    muscles: 'Chest · Shoulders · Triceps',
    exerciseCount: 6,
    estimatedMinutes: 45,
    thumbnailUrl: '/images/workout-push.jpg',
    isCompleted: false,
  },
  todayMeal: {
    id: 'meal_breakfast_1',
    mealType: 'Breakfast',
    description: 'Oats, Banana, Peanut Butter',
    calories: 420,
    thumbnailUrl: '/images/meal-breakfast.jpg',
  },
};
