import React, { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDraftStore } from '../store/draftStore';
import { DraftBoard } from '../components/draft/DraftBoard';
import { HeroGrid } from '../components/common/HeroGrid';
import heroesData from '../data/heroes.json';
import countersData from '../data/counters.json';
import tiersData from '../data/tiers.json';
import type { Hero, HeroCounters } from '../types/hero';
import type { TierSnapshot } from '../types/tier';
import { getCurrentStep, isHeroUnavailable } from '../engine/draftMachine';
import { getRecommendations } from '../engine/recommender';
import { decodeDraftState, encodeDraftState } from '../engine/serializer';

export const Draft: React.FC = () => {
  const [searchParams] = useSearchParams();
  const heroes = heroesData as Hero[];
  const counters = countersData as Record<string, HeroCounters>;
  const tiers = tiersData as TierSnapshot;

  const {
    currentStepIndex,
    blue,
    red,
    isComplete,
    selectHero,
    undo,
    reset,
    loadFromSerialized,
    getSerialized,
  } = useDraftStore();

  // Restore from URL query (?d=...) on mount if present
  useEffect(() => {
    const dParam = searchParams.get('d');
    if (dParam) {
      const decoded = decodeDraftState(dParam);
      if (decoded) {
        loadFromSerialized(decoded, heroes);
      }
    }
  }, [searchParams, heroes, loadFromSerialized]);

  const currentStep = useMemo(() => {
    return getCurrentStep({ currentStepIndex, blue, red, isComplete });
  }, [currentStepIndex, blue, red, isComplete]);

  // Compute top 5 recommendations for active turn
  const suggestions = useMemo(() => {
    if (isComplete || !currentStep) return [];

    const isBlueTurn = currentStep.side === 'BLUE';
    const activeTeamPicks = (isBlueTurn ? blue.picks : red.picks).filter((h): h is Hero => !!h);
    const opposingTeamPicks = (isBlueTurn ? red.picks : blue.picks).filter((h): h is Hero => !!h);
    const allBans = [...blue.bans, ...red.bans].filter((h): h is Hero => !!h);

    return getRecommendations({
      allHeroes: heroes,
      enemyPicks: opposingTeamPicks,
      allyPicks: activeTeamPicks,
      bannedHeroes: allBans,
      countersData: counters,
      tierRows: tiers.rows,
      limit: 5,
    });
  }, [currentStep, isComplete, blue, red, heroes, counters, tiers]);

  const checkIsDisabled = (heroId: string) => {
    return isHeroUnavailable(heroId, { currentStepIndex, blue, red, isComplete });
  };

  const getShareUrl = () => {
    const serialized = getSerialized();
    const encoded = encodeDraftState(serialized);
    const base = window.location.href.split('?')[0].split('#')[0];
    return `${base}#/draft?d=${encoded}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-10">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl text-paper font-semibold tracking-tight">
          Draft Simulator
        </h1>
        <p className="text-xs text-mist mt-1">
          Simulate official ranked ban and pick order with real-time counter recommendations.
        </p>
      </div>

      <DraftBoard
        currentStep={currentStep}
        stepNumber={Math.min(20, currentStepIndex + 1)}
        blue={blue}
        red={red}
        isComplete={isComplete}
        suggestions={suggestions}
        onSelectHero={selectHero}
        onUndo={undo}
        onReset={reset}
        getShareUrl={getShareUrl}
      />

      {/* Hero Selection Grid */}
      <div className="p-4 rounded-panel bg-ink-raised border border-line">
        <HeroGrid
          heroes={heroes}
          onSelectHero={selectHero}
          isHeroDisabled={checkIsDisabled}
          title={
            isComplete
              ? 'Draft Completed'
              : `Select Hero for ${currentStep?.side === 'BLUE' ? 'Blue' : 'Red'} ${currentStep?.type}`
          }
        />
      </div>
    </div>
  );
};
