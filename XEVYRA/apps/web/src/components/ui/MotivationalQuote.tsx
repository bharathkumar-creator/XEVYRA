'use client';

import React, { useState, useEffect } from 'react';

export interface MotivationalQuoteProps {
  category?: 'training' | 'discipline' | 'nutrition' | 'progress' | 'all';
  variant?: 'banner' | 'card' | 'compact';
  className?: string;
}

const quotesPool = {
  training: [
    { text: 'One more rep separates the good from the elite.', author: 'Arnold Schwarzenegger' },
    { text: 'Pain is temporary. Pride is forever.', author: 'Athlete Maxim' },
    { text: 'The only bad workout is the one that didn’t happen.', author: 'Gym Lore' },
    { text: 'Iron never lies to you. 200 pounds will always be 200 pounds.', author: 'Henry Rollins' },
    { text: 'The clock is ticking. Are you becoming the person you want to be?', author: 'Greg Plitt' },
    { text: 'Obsessed is just a word the lazy use to describe dedicated.', author: 'Russell Westbrook' },
  ],
  discipline: [
    { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
    { text: 'Don’t count the days, make the days count.', author: 'Muhammad Ali' },
    { text: 'Consistency is the DNA of mastery.', author: 'Robin Sharma' },
    { text: 'You don’t have to be extreme, just consistent.', author: 'Performance Creed' },
    { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Will Durant' },
    { text: 'Discipline equals freedom.', author: 'Jocko Willink' },
  ],
  nutrition: [
    { text: 'You cannot out-train a poor diet. Fuel with precision and purpose.', author: 'Nutrition Science' },
    { text: 'Food is fuel, not therapy. Train hard, eat smart.', author: 'Athlete Principle' },
    { text: 'Every meal is an opportunity to nourish your athletic performance.', author: 'Sports Dietetics' },
    { text: 'Respect your body when it asks for fuel. Master your macros.', author: 'Elite Physiology' },
  ],
  progress: [
    { text: 'Success isn’t always about greatness. It’s about consistency.', author: 'Dwayne Johnson' },
    { text: 'Look in the mirror. That’s your only real competition.', author: 'Mindset Maxim' },
    { text: 'Small daily improvements over time lead to stunning physical transformations.', author: 'Robin Sharma' },
    { text: 'Trust the process. Progressive overload never fails.', author: 'Overload Principle' },
  ],
};

export const MotivationalQuote: React.FC<MotivationalQuoteProps> = ({
  category = 'discipline',
  variant = 'card',
  className = '',
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);

  const selectedList =
    category === 'all'
      ? [...quotesPool.training, ...quotesPool.discipline, ...quotesPool.nutrition, ...quotesPool.progress]
      : quotesPool[category] || quotesPool.discipline;

  useEffect(() => {
    // Pick deterministic or daily random index
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    setQuoteIndex(dayOfYear % selectedList.length);
  }, [selectedList.length]);

  const quote = selectedList[quoteIndex] || selectedList[0];

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 text-xs text-text-tertiary italic ${className}`}>
        <span className="text-primary font-black not-italic">⚡</span>
        <span>&ldquo;{quote.text}&rdquo;</span>
        <span className="not-italic text-text-muted">— {quote.author}</span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={`p-3.5 rounded-lg bg-surface-elevated/70 border border-border-subtle flex items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
            ⚡
          </div>
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-text-primary italic">
              &ldquo;{quote.text}&rdquo;
            </p>
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider mt-0.5">
              — {quote.author}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-lg bg-surface border border-border-subtle uiverse-card relative overflow-hidden flex flex-col gap-2 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest flex items-center gap-1.5">
          <span>⚡</span> ATHLETE MINDSET
        </span>
      </div>
      <blockquote className="text-xs sm:text-sm font-semibold text-text-primary italic leading-relaxed">
        &ldquo;{quote.text}&rdquo;
      </blockquote>
      <div className="text-right">
        <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">
          — {quote.author}
        </span>
      </div>
    </div>
  );
};
