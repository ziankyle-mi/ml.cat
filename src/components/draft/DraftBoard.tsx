import React from 'react';
import type { Hero } from '../../types/hero';
import type { DraftStep, TeamDraft } from '../../types/draft';
import { TeamBans } from './TeamBans';
import { TeamPicks } from './TeamPicks';
import { HeroAvatar } from '../common/HeroAvatar';
import { ReasonBadge } from '../hero/ReasonBadge';
import { CopyLinkButton } from '../common/CopyLinkButton';
import { Undo2, RotateCcw } from 'lucide-react';
import type { SuggestionResult } from '../../engine/recommender';

interface DraftBoardProps {
  currentStep: DraftStep | null;
  stepNumber: number;
  blue: TeamDraft;
  red: TeamDraft;
  isComplete: boolean;
  suggestions: SuggestionResult[];
  onSelectHero: (hero: Hero) => void;
  onUndo: () => void;
  onReset: () => void;
  getShareUrl: () => string;
}

export const DraftBoard: React.FC<DraftBoardProps> = ({
  currentStep,
  stepNumber,
  blue,
  red,
  isComplete,
  suggestions,
  onSelectHero,
  onUndo,
  onReset,
  getShareUrl,
}) => {
  const activeBlueBan =
    currentStep?.side === 'BLUE' && currentStep?.type === 'BAN'
      ? currentStep.slotIndex
      : null;
  const activeRedBan =
    currentStep?.side === 'RED' && currentStep?.type === 'BAN'
      ? currentStep.slotIndex
      : null;
  const activeBluePick =
    currentStep?.side === 'BLUE' && currentStep?.type === 'PICK'
      ? currentStep.slotIndex
      : null;
  const activeRedPick =
    currentStep?.side === 'RED' && currentStep?.type === 'PICK'
      ? currentStep.slotIndex
      : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Control & Turn Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-panel bg-ink-raised border border-line">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-mist font-mono">
              {isComplete ? 'DRAFT COMPLETED' : `STEP ${stepNumber} / 20`}
            </span>
            <h2 className="font-serif text-lg text-paper font-semibold">
              {isComplete
                ? 'All Bans & Picks Finalized'
                : `${currentStep?.side === 'BLUE' ? 'Blue Team' : 'Red Team'} ${currentStep?.type}`}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={stepNumber <= 1}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-panel text-xs text-mist hover:text-paper bg-ink border border-line disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Undo previous step"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-panel text-xs text-mist hover:text-paper bg-ink border border-line transition-colors"
            title="Reset draft"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <CopyLinkButton getUrl={getShareUrl} />
        </div>
      </div>

      {/* Top 5 Suggestions Banner */}
      {!isComplete && suggestions.length > 0 && (
        <div className="p-4 rounded-panel bg-ink-raised border border-line">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-line">
            <span className="text-xs font-serif tracking-wide text-paper">
              Recommended for {currentStep?.side === 'BLUE' ? 'Blue' : 'Red'} ({currentStep?.type})
            </span>
            <span className="text-[11px] text-mist">Click to select</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {suggestions.map(({ hero, reasons, score }) => (
              <div
                key={hero.id}
                onClick={() => onSelectHero(hero)}
                className="flex items-center gap-3 p-2.5 rounded-panel bg-ink border border-line hover:border-tier-ss/60 cursor-pointer transition-colors group"
              >
                <HeroAvatar hero={hero} size={40} className="flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-paper group-hover:text-tier-ss transition-colors truncate">
                      {hero.name}
                    </span>
                    <span className="text-[10px] text-tier-ss font-mono">
                      +{Math.round(score)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {reasons.slice(0, 1).map((r, i) => (
                      <ReasonBadge
                        key={i}
                        text={r}
                        variant={r.startsWith('+') ? 'positive' : 'neutral'}
                        className="text-[9px] py-0 px-1.5"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2-Side Teams Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blue Team */}
        <div className="flex flex-col gap-4 p-4 rounded-panel bg-ink-raised border border-line">
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <span className="font-serif text-base text-paper font-medium flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-tier-b inline-block" />
              Blue Team (First Pick)
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] text-mist uppercase tracking-wider">Bans</span>
            <TeamBans bans={blue.bans} activeSlotIndex={activeBlueBan} side="BLUE" />
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <span className="text-[11px] text-mist uppercase tracking-wider">Picks</span>
            <TeamPicks picks={blue.picks} activeSlotIndex={activeBluePick} side="BLUE" />
          </div>
        </div>

        {/* Red Team */}
        <div className="flex flex-col gap-4 p-4 rounded-panel bg-ink-raised border border-line">
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <span className="font-serif text-base text-paper font-medium flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-tier-s inline-block" />
              Red Team (Second Pick)
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] text-mist uppercase tracking-wider">Bans</span>
            <TeamBans bans={red.bans} activeSlotIndex={activeRedBan} side="RED" />
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <span className="text-[11px] text-mist uppercase tracking-wider">Picks</span>
            <TeamPicks picks={red.picks} activeSlotIndex={activeRedPick} side="RED" />
          </div>
        </div>
      </div>
    </div>
  );
};
