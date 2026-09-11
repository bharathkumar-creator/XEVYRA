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
import { useToast } from '@/components/feedback/Toast';

export default function WorkoutsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('ROUTINES'); // ROUTINES | ACTIVE_SESSION | HISTORY
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // Active workout session state
  const [activeWorkout, setActiveWorkout] = useState({
    name: 'Push Hypertrophy & Delts',
    durationMinutes: 42,
    exercises: [
      {
        id: 'ex_incline_db',
        name: 'Incline Dumbbell Press',
        targetMuscle: 'Upper Chest',
        equipment: 'Dumbbells',
        sets: [
          { setNumber: 1, previous: '34 kg × 10', weight: 36 as number | '', reps: 10 as number | '', isCompleted: true },
          { setNumber: 2, previous: '36 kg × 8', weight: 36 as number | '', reps: 8 as number | '', isCompleted: true },
          { setNumber: 3, previous: '36 kg × 7', weight: 38 as number | '', reps: 6 as number | '', isCompleted: false },
        ],
      },
      {
        id: 'ex_cable_fly',
        name: 'Cable Chest Fly (Mid-Height)',
        targetMuscle: 'Pectorals',
        equipment: 'Cable Machine',
        sets: [
          { setNumber: 1, previous: '15 kg × 12', weight: 17.5 as number | '', reps: 12 as number | '', isCompleted: true },
          { setNumber: 2, previous: '17.5 kg × 10', weight: 17.5 as number | '', reps: 10 as number | '', isCompleted: false },
        ],
      },
      {
        id: 'ex_lateral_raise',
        name: 'Dumbbell Lateral Raise',
        targetMuscle: 'Side Delts',
        equipment: 'Dumbbells',
        sets: [
          { setNumber: 1, previous: '12 kg × 15', weight: 14 as number | '', reps: 12 as number | '', isCompleted: false },
          { setNumber: 2, previous: '12 kg × 14', weight: 14 as number | '', reps: 12 as number | '', isCompleted: false },
        ],
      },
    ],
  });

  const availableExercises: AvailableExercise[] = [
    { id: 'ex_bench', name: 'Barbell Flat Bench Press', muscleGroup: 'Chest', equipment: 'Barbell' },
    { id: 'ex_squat', name: 'Barbell Back Squat', muscleGroup: 'Legs', equipment: 'Barbell' },
    { id: 'ex_deadlift', name: 'Conventional Deadlift', muscleGroup: 'Back', equipment: 'Barbell' },
    { id: 'ex_overhead_press', name: 'Overhead Standing Military Press', muscleGroup: 'Shoulders', equipment: 'Barbell' },
    { id: 'ex_tricep_pushdown', name: 'Cable Rope Tricep Pushdown', muscleGroup: 'Arms', equipment: 'Cable' },
    { id: 'ex_bicep_curl', name: 'Incline Dumbbell Bicep Curl', muscleGroup: 'Arms', equipment: 'Dumbbells' },
  ];

  const routinesList = [
    {
      id: 'rt_push',
      name: 'Push Hypertrophy & Delts',
      muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
      exerciseCount: 5,
      estimatedMinutes: 55,
      status: 'READY' as const,
      lastCompletedDate: '3 days ago',
    },
    {
      id: 'rt_pull',
      name: 'Pull Strength & Heavy Rows',
      muscleGroups: ['Back', 'Biceps', 'Rear Delts'],
      exerciseCount: 6,
      estimatedMinutes: 60,
      status: 'READY' as const,
      lastCompletedDate: '4 days ago',
    },
    {
      id: 'rt_legs',
      name: 'Legs Quad & Hamstring Focus',
      muscleGroups: ['Quads', 'Hamstrings', 'Calves'],
      exerciseCount: 5,
      estimatedMinutes: 50,
      status: 'READY' as const,
      lastCompletedDate: '1 week ago',
    },
  ];

  const handleToggleSet = (exIndex: number, setIndex: number) => {
    setActiveWorkout((prev) => {
      const updated = { ...prev };
      const set = updated.exercises[exIndex].sets[setIndex];
      set.isCompleted = !set.isCompleted;
      if (set.isCompleted) {
        showToast({
          type: 'success',
          title: 'Set Logged',
          message: `${updated.exercises[exIndex].name} • Set ${set.setNumber} saved!`,
        });
      }
      return updated;
    });
  };

  const handleAddSet = (exIndex: number) => {
    setActiveWorkout((prev) => {
      const updated = { ...prev };
      const currentSets = updated.exercises[exIndex].sets;
      const lastSet = currentSets[currentSets.length - 1];
      const newSetNumber = currentSets.length + 1;

      currentSets.push({
        setNumber: newSetNumber,
        previous: lastSet ? `${lastSet.weight} kg × ${lastSet.reps}` : '—',
        weight: lastSet ? lastSet.weight : 20,
        reps: lastSet ? lastSet.reps : 10,
        isCompleted: false,
      });

      return updated;
    });
  };

  const handleSelectNewExercise = (exercise: AvailableExercise) => {
    setActiveWorkout((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          id: exercise.id,
          name: exercise.name,
          targetMuscle: exercise.muscleGroup,
          equipment: exercise.equipment,
          sets: [
            { setNumber: 1, previous: '—', weight: 20, reps: 10, isCompleted: false },
            { setNumber: 2, previous: '—', weight: 20, reps: 10, isCompleted: false },
            { setNumber: 3, previous: '—', weight: 20, reps: 10, isCompleted: false },
          ],
        },
      ],
    }));
    setIsExerciseSelectorOpen(false);
    showToast({
      type: 'info',
      title: 'Exercise Added',
      message: `${exercise.name} added to session.`,
    });
  };

  const handleFinishWorkout = () => {
    setIsSummaryOpen(true);
  };

  return (
    <PageContainer maxWidth="xl" className="flex flex-col gap-6">
      {/* Navigation Tabs */}
      <div className="flex items-center justify-between">
        <Tabs
          tabs={[
            { id: 'ACTIVE_SESSION', label: 'Active Session' },
            { id: 'ROUTINES', label: 'Routines' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          size="sm"
        />

        {activeTab === 'ACTIVE_SESSION' && (
          <Button variant="primary" size="sm" onClick={handleFinishWorkout}>
            Finish Workout ⚡
          </Button>
        )}
      </div>

      {activeTab === 'ACTIVE_SESSION' ? (
        /* Active Gym Session UI */
        <div className="flex flex-col gap-5">
          {/* Active Workout Header & Rest Timer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-surface border border-border-subtle">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest">
                  LIVE WORKOUT SESSION
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-text-primary uppercase tracking-tight font-display mt-0.5">
                {activeWorkout.name}
              </h1>
            </div>

            <div className="w-full sm:w-auto">
              <RestTimer initialSeconds={90} />
            </div>
          </div>

          {/* Exercises List */}
          <div className="flex flex-col gap-4">
            {activeWorkout.exercises.map((exercise, exIndex) => {
              const completedCount = exercise.sets.filter((s) => s.isCompleted).length;

              return (
                <ExerciseCard
                  key={exercise.id}
                  id={exercise.id}
                  name={exercise.name}
                  targetMuscle={exercise.targetMuscle}
                  equipment={exercise.equipment}
                  completedSetsCount={completedCount}
                  totalSetsTarget={exercise.sets.length}
                  onAddSet={() => handleAddSet(exIndex)}
                >
                  {exercise.sets.map((set, setIndex) => (
                    <SetRow
                      key={set.setNumber}
                      setNumber={set.setNumber}
                      previousPerformance={set.previous}
                      weight={set.weight}
                      reps={set.reps}
                      isCompleted={set.isCompleted}
                      onWeightChange={(val) => {
                        setActiveWorkout((prev) => {
                          const updated = { ...prev };
                          updated.exercises[exIndex].sets[setIndex].weight = val;
                          return updated;
                        });
                      }}
                      onRepsChange={(val) => {
                        setActiveWorkout((prev) => {
                          const updated = { ...prev };
                          updated.exercises[exIndex].sets[setIndex].reps = val;
                          return updated;
                        });
                      }}
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
      ) : (
        /* Routines View */
        <div className="flex flex-col gap-4">
          <SectionHeader
            title="Saved Workout Templates"
            subtitle="Select a routine to begin your training session"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routinesList.map((routine) => (
              <WorkoutCard
                key={routine.id}
                id={routine.id}
                name={routine.name}
                muscleGroups={routine.muscleGroups}
                exerciseCount={routine.exerciseCount}
                estimatedMinutes={routine.estimatedMinutes}
                status={routine.status}
                lastCompletedDate={routine.lastCompletedDate}
                onStart={() => {
                  setActiveTab('ACTIVE_SESSION');
                  showToast({
                    type: 'info',
                    title: 'Session Started',
                    message: `Loaded ${routine.name}`,
                  });
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Exercise Selector Modal */}
      <ExerciseSelector
        isOpen={isExerciseSelectorOpen}
        exercises={availableExercises}
        onSelect={handleSelectNewExercise}
        onClose={() => setIsExerciseSelectorOpen(false)}
      />

      {/* Workout Completion Summary Modal */}
      {isSummaryOpen && (
        <WorkoutSummary
          workoutName={activeWorkout.name}
          durationMinutes={48}
          totalVolumeKg={8420}
          setsCompleted={12}
          prsAchieved={[
            { exerciseName: 'Incline Dumbbell Press', weight: 38, reps: 6 },
          ]}
          onClose={() => {
            setIsSummaryOpen(false);
            setActiveTab('ROUTINES');
            showToast({
              type: 'success',
              title: 'Workout Saved',
              message: 'Session volume synced to progressive overload analytics.',
            });
          }}
        />
      )}
    </PageContainer>
  );
}
