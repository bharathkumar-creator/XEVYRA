'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Apple, Plus, Utensils, Flame, Sparkles, ChevronRight } from 'lucide-react';
import { TopHeader } from '@/components/navigation/top-header';
import { CalorieProgress } from '@/components/dashboard/calorie-progress';
import { MacroProgressCard } from '@/components/dashboard/macro-progress-card';

interface LoggedMeal {
  id: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  thumbnailUrl: string;
}

const SAMPLE_MEALS: LoggedMeal[] = [
  {
    id: 'm1',
    category: 'Breakfast',
    name: 'Oats, Banana, Peanut Butter',
    calories: 420,
    protein: 18,
    carbs: 62,
    fats: 12,
    thumbnailUrl: '/images/meal-breakfast.jpg',
  },
  {
    id: 'm2',
    category: 'Lunch',
    name: 'Grilled Chicken Breast, Brown Rice & Broccoli',
    calories: 680,
    protein: 58,
    carbs: 70,
    fats: 14,
    thumbnailUrl: '/images/meal-breakfast.jpg',
  },
  {
    id: 'm3',
    category: 'Dinner',
    name: 'Salmon Fillet with Sweet Potato Mash',
    calories: 550,
    protein: 44,
    carbs: 48,
    fats: 19,
    thumbnailUrl: '/images/meal-breakfast.jpg',
  },
];

export default function NutritionPage() {
  const [meals] = useState<LoggedMeal[]>(SAMPLE_MEALS);

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] pb-24 md:pb-12">
      <TopHeader />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display">
              Nutrition & Macros
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
              Track daily intake, macronutrient distribution, and AI meal recommendations.
            </p>
          </div>

          <button
            onClick={() => alert('Log food modal')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-hover text-background font-bold text-xs sm:text-sm rounded-xl shadow-glow-brand transition-all touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>Log Food</span>
          </button>
        </div>

        {/* Nutrition Summary Cards */}
        <div className="space-y-4">
          <CalorieProgress consumed={1650} target={2200} percentage={75} />
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            <MacroProgressCard type="protein" consumed={120} target={180} percentage={67} />
            <MacroProgressCard type="carbs" consumed={180} target={275} percentage={65} />
            <MacroProgressCard type="fats" consumed={55} target={70} percentage={79} />
          </div>
        </div>

        {/* AI Diet Coach Insight Box */}
        <div className="bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-brand/10 border border-brand/20 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-brand/10 text-brand flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-display">XEVYRA AI Diet Coach</h3>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              You are 60g shy of your daily protein target for optimal muscle protein synthesis. Consider adding a Greek yogurt snack or whey shake before bedtime.
            </p>
          </div>
        </div>

        {/* Logged Meals List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold text-white font-display">Today's Logged Meals</h2>
            <span className="text-xs text-text-muted">{meals.length} meals logged</span>
          </div>

          <div className="space-y-3">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="bg-surface-card border border-border/80 hover:border-border-light rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-4 card-interactive"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-surface-elevated flex-shrink-0 border border-border">
                    <Image
                      src={meal.thumbnailUrl}
                      alt={meal.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                      {meal.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white truncate">
                      {meal.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                      <span className="font-semibold text-text-primary">{meal.calories} kcal</span>
                      <span>·</span>
                      <span className="text-blue-400">{meal.protein}g P</span>
                      <span>·</span>
                      <span className="text-amber-400">{meal.carbs}g C</span>
                      <span>·</span>
                      <span className="text-purple-400">{meal.fats}g F</span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-text-muted flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
