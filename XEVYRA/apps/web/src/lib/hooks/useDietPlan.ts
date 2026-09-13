'use client';

import { useState, useEffect, useCallback } from 'react';
import { getActiveDietPlan, generateDietPlan } from '@/lib/api/endpoints';
import { DietPlanResponseDto, GenerateDietPlanRequestDto } from '@xevyra/contracts';

export function useDietPlan() {
  const [dietPlan, setDietPlan] = useState<DietPlanResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getActiveDietPlan();
      setDietPlan(data);
    } catch (err: any) {
      // 404 or empty is normal if no plan generated yet
      setDietPlan(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const generate = async (params: GenerateDietPlanRequestDto) => {
    setIsGenerating(true);
    setError(null);
    try {
      const generated = await generateDietPlan(params);
      setDietPlan(generated);
      return generated;
    } catch (err: any) {
      const msg = err?.message || 'Failed to generate AI diet plan. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    dietPlan,
    isLoading,
    isGenerating,
    error,
    refetch: fetchPlan,
    generate,
    setDietPlan,
  };
}
