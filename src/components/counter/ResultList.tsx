import React from 'react';
import type { Hero } from '../../types/hero';
import type { SuggestionResult } from '../../engine/recommender';
import { HeroAvatar } from '../common/HeroAvatar';
import { ReasonBadge } from '../hero/ReasonBadge';

interface ResultListProps {
  results: SuggestionResult[];
  onHeroClick: (hero: Hero) => void;
}

export const ResultList: React.FC<ResultListProps> = ({
  results,
  onHeroClick,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between pb-2 border-b border-line">
        <h2 className="font-serif text-lg text-paper font-semibold">
          Top Counter Answers
        </h2>
        <span className="text-xs text-mist font-mono">
          {results.length} suggestions
        </span>
      </div>

      {results.length === 0 ? (
        <div className="p-8 text-center rounded-panel bg-ink-raised border border-line text-sm text-mist">
          Pick at least one enemy hero above to calculate the best counter answers.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {results.map(({ hero, score, reasons }, idx) => (
            <div
              key={hero.id}
              onClick={() => onHeroClick(hero)}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-panel bg-ink-raised border border-line hover:border-mist/40 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-4">
                <span className="font-serif text-xl font-semibold text-mist/60 w-6">
                  #{idx + 1}
                </span>

                <HeroAvatar hero={hero} size={56} className="flex-shrink-0" />

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-paper group-hover:text-tier-ss transition-colors">
                      {hero.name}
                    </span>
                    <span className="text-xs text-mist">
                      {hero.role} · {hero.primaryLane} · {hero.damageType}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {reasons.map((reason, rIdx) => (
                      <ReasonBadge
                        key={rIdx}
                        text={reason}
                        variant={
                          reason.startsWith('+')
                            ? 'positive'
                            : reason.startsWith('-')
                            ? 'negative'
                            : 'neutral'
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="sm:self-center flex sm:flex-col items-center sm:items-end gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-line/40">
                <span className="text-[11px] text-mist uppercase tracking-wider">Score</span>
                <span className="font-mono text-sm font-semibold text-tier-ss">
                  +{Math.round(score)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
