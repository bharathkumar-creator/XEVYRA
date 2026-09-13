'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getRoutines,
  getExercises,
  getWorkoutSessions,
  startWorkoutSession,
  logWorkoutSet,
  completeWorkoutSession,
} from '@/lib/api/endpoints';
import {
  WorkoutRoutineDto,
  ExerciseDto,
  WorkoutSessionDto,
  StartWorkoutSessionRequestDto,
  LogWorkoutSetRequestDto,
  CompleteWorkoutSessionRequestDto,
} from '@xevyra/contracts';

export function useWorkouts() {
  const [routines, setRoutines] = useState<WorkoutRoutineDto[]>([]);
  const [exercises, setExercises] = useState<ExerciseDto[]>([]);
  const [recentSessions, setRecentSessions] = useState<WorkoutSessionDto[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSessionDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [routinesRes, exercisesRes, sessionsRes] = await Promise.allSettled([
        getRoutines(),
        getExercises(),
        getWorkoutSessions(10, 0),
      ]);

      if (routinesRes.status === 'fulfilled') {
        setRoutines(routinesRes.value.routines || []);
      }
      if (exercisesRes.status === 'fulfilled') {
        setExercises(exercisesRes.value.exercises || []);
      }
      if (sessionsRes.status === 'fulfilled') {
        setRecentSessions(sessionsRes.value.sessions || []);
        // Check if there is an in-progress session
        const inProgress = sessionsRes.value.sessions?.find((s) => s.status === 'IN_PROGRESS');
        if (inProgress) {
          setActiveSession(inProgress);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load workouts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const startSession = async (data: StartWorkoutSessionRequestDto) => {
    const session = await startWorkoutSession(data);
    setActiveSession(session);
    return session;
  };

  const logSet = async (sessionId: string, data: LogWorkoutSetRequestDto) => {
    const updated = await logWorkoutSet(sessionId, data);
    setActiveSession(updated);
    return updated;
  };

  const completeSession = async (sessionId: string, data: CompleteWorkoutSessionRequestDto) => {
    const completed = await completeWorkoutSession(sessionId, data);
    setActiveSession(null);
    setRecentSessions((prev) => [completed, ...prev]);
    return completed;
  };

  return {
    routines,
    exercises,
    recentSessions,
    activeSession,
    setActiveSession,
    isLoading,
    error,
    refetch: loadData,
    startSession,
    logSet,
    completeSession,
  };
}
