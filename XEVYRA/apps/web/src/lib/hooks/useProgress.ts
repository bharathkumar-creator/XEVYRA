'use client';

import { useState, useEffect, useCallback } from 'react';
import { getProgressSummary, logBodyweight } from '@/lib/api/endpoints';
import { ProgressSummaryResponseDto, LogBodyweightRequestDto } from '@xevyra/contracts';

export function useProgress() {
  const [progress, setProgress] = useState<ProgressSummaryResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProgressSummary();
      setProgress(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load athlete progression data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const recordWeight = async (entry: LogBodyweightRequestDto) => {
    await logBodyweight(entry);
    await fetchProgress();
  };

  return {
    progress,
    isLoading,
    error,
    refetch: fetchProgress,
    recordWeight,
  };
}
