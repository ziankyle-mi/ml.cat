import React from 'react';
import type { Hero } from '../../types/hero';
import { HeroAvatar } from '../common/HeroAvatar';

interface TeamPicksProps {
  picks: (Hero | null)[];
  activeSlotIndex?: number | null;
  side: 'BLUE' | 'RED';
}

export const TeamPicks: React.FC<TeamPicksProps> = ({
  picks,
  activeSlotIndex = null,
  side,
}) => {
  return (
    <div className="flex flex-col gap-3">
      {picks.map((hero, idx) => {
        const isActive = activeSlotIndex === idx;

        return (
          <div
            key={idx}
            className={`flex items-center gap-3.5 p-2 rounded-panel border transition-all duration-200 ${
              isActive
                ? `${side === 'BLUE' ? 'border-tier-b' : 'border-tier-s'} bg-ink-raised shadow-sm`
                : 'border-line/70 bg-ink-raised/50'
            }`}
          >
            <div className="flex-shrink-0">
              {hero ? (
                <HeroAvatar hero={hero} size={56} />
              ) : (
                <div className="w-14 h-14 rounded-full border border-dashed border-line flex items-center justify-center bg-ink">
                  <span className="text-xs text-mist/40 font-mono">
                    P{idx + 1}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              {hero ? (
                <>
                  <span className="text-sm font-medium text-paper truncate">
                    {hero.name}
                  </span>
                  <span className="text-xs text-mist">
                    {hero.primaryLane} · {hero.role}
                  </span>
                </>
              ) : (
                <span className="text-xs text-mist/60 italic">
                  {isActive ? 'Selecting pick...' : 'Empty pick slot'}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
