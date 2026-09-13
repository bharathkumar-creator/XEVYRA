'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getNutritionSummary,
  searchFoods,
  logFoodEntry,
  deleteMealEntry,
  createCustomFood,
} from '@/lib/api/endpoints';
import {
  DailyNutritionSummaryResponseDto,
  FoodItemResponseDto,
  LogFoodEntryRequestDto,
} from '@xevyra/contracts';

export function useNutrition(dateString?: string) {
  const [summary, setSummary] = useState<DailyNutritionSummaryResponseDto | null>(null);
  const [searchResults, setSearchResults] = useState<FoodItemResponseDto[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getNutritionSummary(dateString);
      setSummary(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load daily nutrition summary');
    } finally {
      setIsLoading(false);
    }
  }, [dateString]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const search = async (query: string, category?: string) => {
    if (!query && !category) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await searchFoods(query, category);
      setSearchResults(res.items || []);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const logFood = async (entry: LogFoodEntryRequestDto) => {
    await logFoodEntry(entry);
    await fetchSummary();
  };

  const removeFood = async (date: string, entryId: string) => {
    await deleteMealEntry(date, entryId);
    await fetchSummary();
  };

  const addCustomFood = async (foodData: any) => {
    const created = await createCustomFood(foodData);
    return created;
  };

  return {
    summary,
    searchResults,
    isSearching,
    isLoading,
    error,
    refetch: fetchSummary,
    search,
    logFood,
    removeFood,
    addCustomFood,
  };
}
