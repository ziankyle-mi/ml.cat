import React from 'react';
import type { Hero } from '../../types/hero';
import type { TierId } from '../../types/tier';

interface TierRowProps {
  tierId: TierId;
  color?: string;
  heroes: Hero[];
  onHeroClick: (hero: Hero) => void;
}

const TIER_THEMES: Record<
  TierId,
  {
    bg: string;
    text: string;
    label: string;
  }
> = {
  SS: {
    bg: 'bg-[#ff9900]',
    text: 'text-black',
    label: 'GOD TIER',
  },
  S: {
    bg: 'bg-[#ff4d4d]',
    text: 'text-white',
    label: 'TOP META',
  },
  A: {
    bg: 'bg-[#ff8533]',
    text: 'text-white',
    label: 'STRONG',
  },
  B: {
    bg: 'bg-[#3b82f6]',
    text: 'text-white',
    label: 'VIABLE',
  },
  C: {
    bg: 'bg-[#10b981]',
    text: 'text-white',
    label: 'SITUATIONAL',
  },
  D: {
    bg: 'bg-[#6b7280]',
    text: 'text-white',
    label: 'WEAK',
  },
};

export const TierRow: React.FC<TierRowProps> = ({
  tierId,
  heroes,
  onHeroClick,
}) => {
  const theme = TIER_THEMES[tierId] || TIER_THEMES.B;

  return (
    <div className="flex flex-col sm:flex-row items-stretch rounded-xl border border-line bg-ink-raised/60 overflow-hidden mb-3.5 shadow-sm hover:border-line/90 transition-all">
      {/* Bold Tier Head Block (Gaming TierMaker Style) */}
      <div
        className={`w-full sm:w-20 min-h-[50px] sm:min-h-[105px] flex sm:flex-col items-center justify-center flex-shrink-0 ${theme.bg} py-2.5 sm:py-0 px-4 sm:px-0`}
      >
        <span className={`text-2xl sm:text-3xl font-black tracking-tight ${theme.text}`}>
          {tierId}
        </span>
        <span
          className={`text-[9px] uppercase tracking-wider font-extrabold opacity-85 sm:mt-0.5 ml-2.5 sm:ml-0 ${theme.text}`}
        >
          {theme.label}
        </span>
      </div>

      {/* Hero Cards Container */}
      <div className="flex-1 p-3 sm:p-4 flex items-center gap-3 sm:gap-3.5 flex-wrap bg-ink/40">
        {heroes.map((hero) => (
          <div
            key={hero.id}
            onClick={() => onHeroClick(hero)}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 border-line group-hover:border-paper/80 group-hover:scale-105 group-hover:shadow-lg transition-all duration-150 bg-ink">
              <img
                src={hero.icon || `/heroes/${hero.id}.webp`}
                alt={hero.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-paper/0 group-hover:bg-paper/5 transition-colors" />
            </div>
            <span className="text-[11px] font-semibold text-mist group-hover:text-paper transition-colors max-w-[64px] text-center truncate">
              {hero.name}
            </span>
          </div>
        ))}

        {heroes.length === 0 && (
          <div className="flex items-center justify-center py-4 px-3 text-xs text-mist/60 italic w-full sm:w-auto">
            No heroes in this lane
          </div>
        )}
      </div>
    </div>
  );
};
