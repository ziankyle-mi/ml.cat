import React from 'react';
import type { Hero, Lane } from '../../types/hero';
import { HeroAvatar } from '../common/HeroAvatar';
import { X, RotateCcw } from 'lucide-react';

interface EnemyPickerProps {
  enemyPicks: Hero[];
  allyPicks: Hero[];
  laneFilter: Lane | null;
  onRemoveEnemy: (heroId: string) => void;
  onRemoveAlly: (heroId: string) => void;
  onSelectLane: (lane: Lane | null) => void;
  onReset: () => void;
}

const LANES: ('All' | Lane)[] = ['All', 'EXP', 'Gold', 'Mid', 'Jungle', 'Roam'];

export const EnemyPicker: React.FC<EnemyPickerProps> = ({
  enemyPicks,
  allyPicks,
  laneFilter,
  onRemoveEnemy,
  onRemoveAlly,
  onSelectLane,
  onReset,
}) => {
  return (
    <div className="flex flex-col gap-6 p-4 rounded-panel bg-ink-raised border border-line">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
        <div>
          <h2 className="font-serif text-lg text-paper font-semibold">
            Draft Composition
          </h2>
          <p className="text-xs text-mist">
            Select up to 5 enemy heroes to analyze counter responses.
          </p>
        </div>

        <button
          onClick={onReset}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-panel text-xs text-mist hover:text-paper bg-ink border border-line transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Enemy Team Slots (Required, up to 5) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-tier-s flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-tier-s" />
            Enemy Heroes ({enemyPicks.length}/5)
          </span>
          <span className="text-[11px] text-mist">Click portrait to remove</span>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, idx) => {
            const hero = enemyPicks[idx];
            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center p-3 rounded-panel border border-line/70 bg-ink min-h-[96px] relative group"
              >
                {hero ? (
                  <>
                    <button
                      onClick={() => onRemoveEnemy(hero.id)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-tier-s text-paper flex items-center justify-center shadow hover:opacity-90"
                      aria-label={`Remove ${hero.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <HeroAvatar hero={hero} size={56} showName />
                  </>
                ) : (
                  <span className="text-xs text-mist/40 font-mono text-center">
                    Enemy {idx + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ally Team Slots (Optional, up to 5) */}
      <div className="flex flex-col gap-2 pt-2 border-t border-line/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-tier-b flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-tier-b" />
            Your Ally Heroes ({allyPicks.length}/5 - Optional)
          </span>
          <span className="text-[11px] text-mist">Adds lane & damage synergy</span>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, idx) => {
            const hero = allyPicks[idx];
            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center p-2 rounded-panel border border-line/50 bg-ink min-h-[80px] relative group"
              >
                {hero ? (
                  <>
                    <button
                      onClick={() => onRemoveAlly(hero.id)}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-tier-s text-paper flex items-center justify-center shadow hover:opacity-90"
                      aria-label={`Remove ally ${hero.name}`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                    <HeroAvatar hero={hero} size={40} showName />
                  </>
                ) : (
                  <span className="text-[11px] text-mist/30 font-mono text-center">
                    Ally {idx + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Lane Filter */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line/50">
        <span className="text-xs text-mist">Filter answers by lane:</span>
        <div className="flex items-center gap-1 bg-ink p-1 rounded-panel border border-line">
          {LANES.map((lane) => {
            const isSelected = (lane === 'All' && laneFilter === null) || laneFilter === lane;
            return (
              <button
                key={lane}
                onClick={() => onSelectLane(lane === 'All' ? null : lane)}
                className={`px-2.5 py-0.5 rounded text-xs transition-colors ${
                  isSelected
                    ? 'bg-line text-paper font-medium'
                    : 'text-mist hover:text-paper'
                }`}
              >
                {lane}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
