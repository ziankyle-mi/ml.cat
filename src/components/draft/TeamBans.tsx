import React from 'react';
import type { Hero } from '../../types/hero';
import { HeroAvatar } from '../common/HeroAvatar';

interface TeamBansProps {
  bans: (Hero | null)[];
  activeSlotIndex?: number | null;
  side: 'BLUE' | 'RED';
}

export const TeamBans: React.FC<TeamBansProps> = ({
  bans,
  activeSlotIndex = null,
  side,
}) => {
  return (
    <div className="flex items-center gap-2">
      {bans.map((hero, idx) => {
        const isActive = activeSlotIndex === idx;

        return (
          <div
            key={idx}
            className={`w-10 h-10 rounded-full flex items-center justify-center relative transition-all duration-200 ${
              isActive
                ? `ring-2 ${side === 'BLUE' ? 'ring-tier-b' : 'ring-tier-s'} ring-offset-2 ring-offset-ink`
                : 'border border-line/60 bg-ink-raised'
            }`}
          >
            {hero ? (
              <HeroAvatar
                hero={hero}
                size={40}
                isBanned
                className="opacity-75"
              />
            ) : (
              <span className="text-[10px] text-mist/40 font-mono">
                B{idx + 1}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
