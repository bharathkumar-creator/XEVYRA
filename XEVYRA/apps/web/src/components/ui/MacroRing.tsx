import React from 'react';

export interface MacroRingProps {
  protein: { consumed: number; target: number };
  carbs: { consumed: number; target: number };
  fat: { consumed: number; target: number };
  size?: number;
  className?: string;
}

export const MacroRing: React.FC<MacroRingProps> = ({
  protein,
  carbs,
  fat,
  size = 140,
  className = '',
}) => {
  const center = size / 2;
  const strokeWidth = 8;
  const gap = 3;

  // Concentric 3 rings
  const proteinRadius = center - strokeWidth / 2 - 2;
  const carbsRadius = proteinRadius - strokeWidth - gap;
  const fatRadius = carbsRadius - strokeWidth - gap;

  const getOffset = (radius: number, consumed: number, target: number) => {
    const circumference = 2 * Math.PI * radius;
    const progress = target > 0 ? Math.min(100, Math.max(0, (consumed / target) * 100)) : 0;
    return {
      circumference,
      offset: circumference - (progress / 100) * circumference,
    };
  };

  const pData = getOffset(proteinRadius, protein.consumed, protein.target);
  const cData = getOffset(carbsRadius, carbs.consumed, carbs.target);
  const fData = getOffset(fatRadius, fat.consumed, fat.target);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 transform"
      >
        {/* Protein Track & Arc */}
        <circle cx={center} cy={center} r={proteinRadius} stroke="#1A243B" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={center}
          cy={center}
          r={proteinRadius}
          stroke="#3B82F6"
          strokeWidth={strokeWidth}
          strokeDasharray={pData.circumference}
          strokeDashoffset={pData.offset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-500 ease-out"
        />

        {/* Carbs Track & Arc */}
        <circle cx={center} cy={center} r={carbsRadius} stroke="#1A243B" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={center}
          cy={center}
          r={carbsRadius}
          stroke="#F59E0B"
          strokeWidth={strokeWidth}
          strokeDasharray={cData.circumference}
          strokeDashoffset={cData.offset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-500 ease-out"
        />

        {/* Fat Track & Arc */}
        <circle cx={center} cy={center} r={fatRadius} stroke="#1A243B" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={center}
          cy={center}
          r={fatRadius}
          stroke="#A855F7"
          strokeWidth={strokeWidth}
          strokeDasharray={fData.circumference}
          strokeDashoffset={fData.offset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-extrabold tracking-widest text-text-tertiary uppercase">MACROS</span>
      </div>
    </div>
  );
};
