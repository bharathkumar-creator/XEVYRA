'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface AvailableExercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
}

export interface ExerciseSelectorProps {
  isOpen: boolean;
  exercises: AvailableExercise[];
  onSelect: (exercise: AvailableExercise) => void;
  onClose: () => void;
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  isOpen,
  exercises,
  onSelect,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('ALL');

  if (!isOpen) return null;

  const muscles = ['ALL', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

  const filtered = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = selectedMuscle === 'ALL' || ex.muscleGroup.toLowerCase() === selectedMuscle.toLowerCase();
    return matchesSearch && matchesMuscle;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background-deep/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="w-full sm:max-w-lg bg-surface-elevated border border-border-light rounded-t-xl sm:rounded-lg max-h-[85vh] flex flex-col shadow-cardElevated">
        {/* Header */}
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <h3 className="text-base font-bold text-text-primary uppercase tracking-wide font-display">
            Select Exercise
          </h3>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary"
            aria-label="Close selector"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search & Muscle Filters */}
        <div className="p-4 border-b border-border-subtle flex flex-col gap-3">
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-muted text-text-primary text-sm rounded-md border border-border-subtle px-3.5 py-2.5 outline-none focus:border-primary"
          />

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {muscles.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMuscle(m)}
                className={`px-2.5 py-1 text-xs font-bold uppercase rounded-sm whitespace-nowrap transition-colors ${
                  selectedMuscle === m
                    ? 'bg-primary text-background-deep'
                    : 'bg-surface-muted text-text-tertiary hover:text-text-primary'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-text-tertiary">
              No exercises match your search
            </div>
          ) : (
            filtered.map((ex) => (
              <div
                key={ex.id}
                onClick={() => onSelect(ex)}
                className="p-3 rounded-md bg-surface border border-border-subtle hover:border-primary/40 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div>
                  <h4 className="text-sm font-bold text-text-primary uppercase tracking-wide">
                    {ex.name}
                  </h4>
                  <span className="text-[11px] text-text-tertiary">{ex.equipment}</span>
                </div>
                <Badge variant="neutral" size="sm">
                  {ex.muscleGroup}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
