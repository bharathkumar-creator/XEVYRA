import React from 'react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export interface MacroItemData {
  consumed: number;
  target: number;
}

export interface MacroSummaryProps {
  protein: MacroItemData;
  carbs: MacroItemData;
  fat: MacroItemData;
  className?: string;
}

export const MacroSummary: React.FC<MacroSummaryProps> = ({
  protein,
  carbs,
  fat,
  className = '',
}) => {
  return (
    <Card variant="default" className={`flex flex-col gap-3 ${className}`}>
      <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
        Daily Macro Targets
      </span>

      {/* Protein */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5 font-bold text-macro-protein">
            <span className="w-2 h-2 rounded-full bg-macro-protein" />
            <span>PROTEIN</span>
          </div>
          <span className="font-semibold text-text-primary">
            {Math.round(protein.consumed)}g / {protein.target}g
          </span>
        </div>
        <ProgressBar
          value={protein.consumed}
          max={protein.target}
          colorVariant="protein"
          size="sm"
        />
      </div>

      {/* Carbs */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5 font-bold text-macro-carbs">
            <span className="w-2 h-2 rounded-full bg-macro-carbs" />
            <span>CARBS</span>
          </div>
          <span className="font-semibold text-text-primary">
            {Math.round(carbs.consumed)}g / {carbs.target}g
          </span>
        </div>
        <ProgressBar
          value={carbs.consumed}
          max={carbs.target}
          colorVariant="carbs"
          size="sm"
        />
      </div>

      {/* Fat */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5 font-bold text-macro-fat">
            <span className="w-2 h-2 rounded-full bg-macro-fat" />
            <span>FAT</span>
          </div>
          <span className="font-semibold text-text-primary">
            {Math.round(fat.consumed)}g / {fat.target}g
          </span>
        </div>
        <ProgressBar
          value={fat.consumed}
          max={fat.target}
          colorVariant="fat"
          size="sm"
        />
      </div>
    </Card>
  );
};
