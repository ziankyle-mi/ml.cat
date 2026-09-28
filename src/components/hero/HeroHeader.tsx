import React from 'react';
import type { Hero } from '../../types/hero';
import type { TierId } from '../../types/tier';
import { HeroAvatar } from '../common/HeroAvatar';
import { ReasonBadge } from './ReasonBadge';
import { formatTag } from '../../engine/recommender';

interface HeroHeaderProps {
  hero: Hero;
  tier?: TierId;
  tierColor?: string;
  points?: number;
  movement?: 'same' | 'up' | 'down';
  onTagClick?: (tag: string) => void;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  hero,
  tier = 'B',
  tierColor = '#6b8199',
  points,
  movement,
  onTagClick,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 py-6 border-b border-line">
      {/* 128px portrait */}
      <HeroAvatar
        hero={hero}
        size={128}
        ringColor={tierColor}
        className="flex-shrink-0"
      />

      <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
          <h1 className="font-serif text-3xl sm:text-4xl text-paper font-semibold tracking-tight">
            {hero.name}
          </h1>
          <span
            className="text-xs px-2.5 py-0.5 rounded-full border font-medium"
            style={{
              borderColor: `${tierColor}50`,
              color: tierColor,
              backgroundColor: `${tierColor}15`,
            }}
          >
            MLBB.GG: {tier} tier
          </span>
          {points !== undefined && (
            <span className="text-xs px-2.5 py-0.5 rounded-full border border-line text-mist font-mono">
              {points.toFixed(0)} pts
            </span>
          )}
          {movement === 'up' && (
            <span className="text-xs px-2 py-0.5 rounded-full border border-emerald-500/40 text-emerald-400 bg-emerald-500/10 font-mono">
              ▲ Rising
            </span>
          )}
          {movement === 'down' && (
            <span className="text-xs px-2 py-0.5 rounded-full border border-rose-500/40 text-rose-400 bg-rose-500/10 font-mono">
              ▼ Dropping
            </span>
          )}
        </div>

        <p className="text-sm text-mist">
          {hero.role} · {hero.primaryLane}
          {hero.secondaryLane ? ` / ${hero.secondaryLane}` : ''} · {hero.damageType} Damage
        </p>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className="text-xs text-mist mr-1">Tags:</span>
          {hero.tags.map((tag) => (
            <ReasonBadge
              key={tag}
              text={formatTag(tag)}
              onClick={onTagClick ? () => onTagClick(tag) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
