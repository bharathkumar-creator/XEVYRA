'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/navigation/PageContainer';
import { SectionHeader } from '@/components/navigation/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { WorkoutCard } from '@/components/workouts/WorkoutCard';
import { ExerciseCard } from '@/components/workouts/ExerciseCard';
import { SetRow } from '@/components/workouts/SetRow';
import { RestTimer } from '@/components/workouts/RestTimer';
import { ExerciseSelector, AvailableExercise } from '@/components/workouts/ExerciseSelector';
import { WorkoutSummary } from '@/components/workouts/WorkoutSummary';
import { MotivationalQuote } from '@/components/ui/MotivationalQuote';
import { Skeleton } from '@/components/feedback/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useToast } from '@/components/feedback/Toast';
import { useWorkouts } from '@/lib/hooks/useWorkouts';
import { ExerciseDto, WorkoutRoutineDto, WorkoutSessionDto } from '@xevyra/contracts';

export default function WorkoutsPage() {
  const { showToast } = useToast();
  const {
    routines,
    exercises,
    recentSessions,
    activeSession,
    isLoading,
    error,
    refetch,
    startSession,
    logSet,
    completeSession,
  } = useWorkouts();

  const [activeTab, setActiveTab] = useState<'ROUTINES' | 'ACTIVE_SESSION' | 'HISTORY'>(
    activeSession ? 'ACTIVE_SESSION' : 'ROUTINES'
  );
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);
  const [completedSummary, setCompletedSummary] = useState<WorkoutSessionDto | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  // Fallback available exercises converted for selector
  const availableExerciseList: AvailableExercise[] = exercises.map((ex) => ({
    id: ex.id,
    name: ex.name,
    muscleGroup: ex.muscleGroup,
    equipment: ex.equipment,
  }));

  const handleStartRoutine = async (routine: WorkoutRoutineDto) => {
    try {
      showToast({
        type: 'info',
        title: 'Starting Workout',
        message: `Initializing ${routine.name}...`,
      });

      const sessionExercises = routine.exercises.map((rx) => ({
        exerciseId: rx.exerciseId,
        name: rx.exerciseName,
        targetMuscle: 'Target Area',
        equipment: 'Standard',
        sets: Array.from({ length: rx.targetSets }, (_, i) => ({
          setNumber: i + 1,
          type: 'NORMAL' as const,
          weightKg: 20,
          reps: rx.targetReps,
          isCompleted: false,
          previousPerformance: '—',
        })),
      }));

      await startSession({
        routineId: routine.id,
        routineName: routine.name,
        exercises: sessionExercises,
      });

      setActiveTab('ACTIVE_SESSION');
      showToast({
        type: 'success',
        title: 'Session Live',
        message: `${routine.name} is now active. Time to lift!`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Failed to Start Session',
        message: err?.message || 'Could not start workout session.',
      });
    }
  };

  const handleToggleSet = async (exIndex: number, setIndex: number) => {
    if (!activeSession) return;
    const exercise = activeSession.exercises[exIndex];
    if (!exercise) return;
    const set = exercise.sets[setIndex];
    if (!set) return;

    const newCompleted = !set.isCompleted;

    try {
      await logSet(activeSession.id, {
        exerciseId: exercise.exerciseId,
        setNumber: set.setNumber,
        type: set.type,
        weightKg: set.weightKg,
        reps: set.reps,
        rpe: set.rpe,
        isCompleted: newCompleted,
        version: activeSession.version,
      });

      if (newCompleted) {
        showToast({
          type: 'success',
          title: 'Set Logged',
          message: `${exercise.name} • Set ${set.setNumber} saved (${set.weightKg}kg × ${set.reps})`,
        });
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Set Sync Error',
        message: err?.message || 'Failed to update set status.',
      });
    }
  };

  const handleUpdateWeight = (exIndex: number, setIndex: number, newWeight: number | '') => {
    if (!activeSession) return;
    const exercise = activeSession.exercises[exIndex];
    if (!exercise || !exercise.sets[setIndex]) return;
    exercise.sets[setIndex].weightKg = typeof newWeight === 'number' ? newWeight : 0;
  };

  const handleUpdateReps = (exIndex: number, setIndex: number, newReps: number | '') => {
    if (!activeSession) return;
    const exercise = activeSession.exercises[exIndex];
    if (!exercise || !exercise.sets[setIndex]) return;
    exercise.sets[setIndex].reps = typeof newReps === 'number' ? newReps : 0;
  };

  const handleAddSet = (exIndex: number) => {
    if (!activeSession) return;
    const exercise = activeSession.exercises[exIndex];
    if (!exercise) return;
    const currentSets = exercise.sets;
    const lastSet = currentSets[currentSets.length - 1];
    const newSetNumber = currentSets.length + 1;

    currentSets.push({
      setNumber: newSetNumber,
      type: 'NORMAL',
      weightKg: lastSet ? lastSet.weightKg : 20,
      reps: lastSet ? lastSet.reps : 10,
      isCompleted: false,
      previousPerformance: lastSet ? `${lastSet.weightKg} kg × ${lastSet.reps}` : '—',
    });
  };

  const handleAddExerciseToSession = (selected: AvailableExercise) => {
    if (!activeSession) return;
    activeSession.exercises.push({
      exerciseId: selected.id,
      name: selected.name,
      targetMuscle: selected.muscleGroup,
      equipment: selected.equipment,
      sets: [
        { setNumber: 1, type: 'NORMAL', weightKg: 20, reps: 10, isCompleted: false, previousPerformance: '—' },
        { setNumber: 2, type: 'NORMAL', weightKg: 20, reps: 10, isCompleted: false, previousPerformance: '—' },
        { setNumber: 3, type: 'NORMAL', weightKg: 20, reps: 10, isCompleted: false, previousPerformance: '—' },
      ],
    });
    setIsExerciseSelectorOpen(false);
    showToast({
      type: 'info',
      title: 'Exercise Added',
      message: `${selected.name} added to session.`,
    });
  };

  const handleFinishWorkout = async () => {
    if (!activeSession) return;
    setIsCompleting(true);
    try {
      const completed = await completeSession(activeSession.id, {
        endedAt: new Date().toISOString(),
        version: activeSession.version,
      });
      setCompletedSummary(completed);
      showToast({
        type: 'success',
        title: 'Workout Completed! ⚡',
        message: `Volume: ${completed.totalVolumeKg.toLocaleString()} kg • ${completed.totalSetsCompleted} sets logged.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Completion Error',
        message: err?.message || 'Could not complete workout session.',
      });
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer maxWidth="xl" className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Skeleton height={36} width={240} className="rounded-lg" />
          <Skeleton height={36} width={120} className="rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton height={140} className="rounded-lg" />
          <Skeleton height={140} className="rounded-lg" />
        </div>
      </PageContainer>
    );
  }

  if (error && routines.length === 0) {
    return (
      <PageContainer maxWidth="xl" className="flex flex-col gap-6">
        <ErrorState
          title="Workouts Unavailable"
          message={error}
          onRetry={refetch}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="xl" className="flex flex-col gap-6">
      {/* 1. Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Tabs
          tabs={[
            ...(activeSession ? [{ id: 'ACTIVE_SESSION', label: '🔴 Live Session' }] : []),
            { id: 'ROUTINES', label: 'Routines Library' },
            { id: 'HISTORY', label: 'Past Logs' },
          ]}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as any)}
          size="sm"
        />

        {activeTab === 'ACTIVE_SESSION' && activeSession && (
          <Button
            variant="primary"
            size="sm"
            isLoading={isCompleting}
            onClick={handleFinishWorkout}
          >
            Finish Workout ⚡
          </Button>
        )}
      </div>

      {/* 2. Active Session View */}
      {activeTab === 'ACTIVE_SESSION' && activeSession && (
        <div className="flex flex-col gap-5">
          {/* Header & Rest Timer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-surface border border-border-subtle">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest">
                  LIVE GYM SESSION • {activeSession.durationMinutes} MIN ELAPSED
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-text-primary uppercase tracking-tight font-display mt-0.5">
                {activeSession.routineName}
              </h1>
            </div>

            <div className="w-full sm:w-auto">
              <RestTimer initialSeconds={90} />
            </div>
          </div>

          {/* Motivational banner */}
          <MotivationalQuote category="training" variant="banner" />

          {/* Exercise Sets List */}
          <div className="flex flex-col gap-4">
            {activeSession.exercises.map((exercise, exIndex) => {
              const completedSetsCount = exercise.sets.filter((s) => s.isCompleted).length;

              return (
                <ExerciseCard
                  key={exercise.exerciseId || exIndex}
                  id={exercise.exerciseId}
                  name={exercise.name}
                  targetMuscle={exercise.targetMuscle}
                  equipment={exercise.equipment}
                  completedSetsCount={completedSetsCount}
                  totalSetsTarget={exercise.sets.length}
                  onAddSet={() => handleAddSet(exIndex)}
                >
                  {exercise.sets.map((set, setIndex) => (
                    <SetRow
                      key={set.setNumber}
                      setNumber={set.setNumber}
                      previousPerformance={set.previousPerformance || '—'}
                      weight={set.weightKg}
                      reps={set.reps}
                      isCompleted={set.isCompleted}
                      onWeightChange={(val) => handleUpdateWeight(exIndex, setIndex, val)}
                      onRepsChange={(val) => handleUpdateReps(exIndex, setIndex, val)}
                      onToggleComplete={() => handleToggleSet(exIndex, setIndex)}
                    />
                  ))}
                </ExerciseCard>
              );
            })}
          </div>

          {/* Add Exercise CTA */}
          <Button
            variant="secondary"
            fullWidth
            size="md"
            onClick={() => setIsExerciseSelectorOpen(true)}
          >
            + Add Exercise to Session
          </Button>
        </div>
      )}

      {/* 3. Routines Library View */}
      {activeTab === 'ROUTINES' && (
        <div className="flex flex-col gap-4">
          <SectionHeader
            title="Workout Routines"
            subtitle="Select a routine to begin your training session"
          />

          {routines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routines.map((routine) => (
                <WorkoutCard
                  key={routine.id}
                  id={routine.id}
                  name={routine.name}
                  muscleGroups={routine.muscleGroups}
                  exerciseCount={routine.exercises?.length || 5}
                  estimatedMinutes={routine.estimatedMinutes}
                  status="READY"
                  lastCompletedDate={routine.lastCompletedDate}
                  onStart={() => handleStartRoutine(routine)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Workout Routines Found"
              description="Create your first workout routine to start logging progressive overload."
              actionLabel="Create Routine"
              onAction={() => setIsExerciseSelectorOpen(true)}
            />
          )}

          <MotivationalQuote category="training" variant="card" className="mt-2" />
        </div>
      )}

      {/* 4. Past Logs History View */}
      {activeTab === 'HISTORY' && (
        <div className="flex flex-col gap-4">
          <SectionHeader
            title="Completed Training Sessions"
            subtitle="Review recent workouts and progressive overload volume"
          />

          {recentSessions.length > 0 ? (
            <div className="flex flex-col gap-3">
              {recentSessions.map((session) => (
                <Card key={session.id} variant="default" className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="primary" size="sm">
                        {session.status}
                      </Badge>
                      <span className="text-[11px] text-text-tertiary">
                        {new Date(session.startedAt).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-text-primary uppercase font-display">
                      {session.routineName}
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {session.exercises?.length || 0} exercises • {session.totalSetsCompleted} sets completed • {session.durationMinutes} min
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-[10px] font-bold text-text-tertiary uppercase block">
                        Total Volume
                      </span>
                      <span className="text-lg font-black text-primary font-display">
                        {session.totalVolumeKg?.toLocaleString() || 0} kg
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Completed Workouts Yet"
              description="Start a training session today to record your first completed workout."
              actionLabel="View Routines"
              onAction={() => setActiveTab('ROUTINES')}
            />
          )}
        </div>
      )}

      {/* Exercise Selector Modal */}
      <ExerciseSelector
        isOpen={isExerciseSelectorOpen}
        exercises={availableExerciseList}
        onSelect={handleAddExerciseToSession}
        onClose={() => setIsExerciseSelectorOpen(false)}
      />

      {/* Workout Completion Summary Modal */}
      {completedSummary && (
        <WorkoutSummary
          workoutName={completedSummary.routineName}
          durationMinutes={completedSummary.durationMinutes}
          totalVolumeKg={completedSummary.totalVolumeKg}
          setsCompleted={completedSummary.totalSetsCompleted}
          prsAchieved={completedSummary.prsAchieved.map((pr) => ({
            exerciseName: pr.exerciseName,
            weight: pr.weightKg,
            reps: pr.reps,
          }))}
          onClose={() => {
            setCompletedSummary(null);
            setActiveTab('ROUTINES');
          }}
        />
      )}
    </PageContainer>
  );
}
