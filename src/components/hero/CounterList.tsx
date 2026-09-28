import React from 'react';
import type { Hero } from '../../types/hero';
import { HeroAvatar } from '../common/HeroAvatar';

export interface CounterItem {
  hero: Hero;
  reason: string;
}

interface CounterListProps {
  title: string;
  items: CounterItem[];
  onHeroClick: (hero: Hero) => void;
  emptyText?: string;
  priority?: boolean;
}

export const CounterList: React.FC<CounterListProps> = ({
  title,
  items,
  onHeroClick,
  emptyText = 'No specific counters recorded.',
  priority = false,
}) => {
  return (
    <div className={`flex flex-col gap-3 ${priority ? 'py-4' : 'py-3'}`}>
      <h2
        className={`font-serif tracking-wide text-paper ${
          priority ? 'text-xl font-semibold' : 'text-base font-medium text-paper/90'
        }`}
      >
        {title}
      </h2>

      {items.length === 0 ? (
        <p className="text-xs text-mist italic">{emptyText}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(({ hero, reason }) => (
            <div
              key={hero.id}
              onClick={() => onHeroClick(hero)}
              className="flex items-start gap-3 p-3 rounded-panel bg-ink-raised border border-line hover:border-mist/40 transition-colors cursor-pointer group"
            >
              <HeroAvatar hero={hero} size={56} className="flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-paper group-hover:text-tier-ss transition-colors truncate">
                    {hero.name}
                  </span>
                  <span className="text-[11px] text-mist flex-shrink-0">
                    {hero.primaryLane}
                  </span>
                </div>
                <p className="text-xs text-mist mt-1 leading-snug line-clamp-2">
                  {reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
