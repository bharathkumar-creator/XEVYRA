'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMaintenanceAnalysis } from '@/lib/api/endpoints';
import { MaintenanceCalorieAnalysisResponseDto } from '@xevyra/contracts';

export function useMaintenance() {
  const [analysis, setAnalysis] = useState<MaintenanceCalorieAnalysisResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMaintenanceAnalysis();
      setAnalysis(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load maintenance calorie analysis');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  return {
    analysis,
    isLoading,
    error,
    refetch: fetchAnalysis,
  };
}
