import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCounterStore } from '../store/counterStore';
import { EnemyPicker } from '../components/counter/EnemyPicker';
import { ResultList } from '../components/counter/ResultList';
import { CounterEquipment } from '../components/hero/CounterEquipment';
import { HeroGrid } from '../components/common/HeroGrid';
import { CopyLinkButton } from '../components/common/CopyLinkButton';
import heroesData from '../data/heroes.json';
import countersData from '../data/counters.json';
import tiersData from '../data/tiers.json';
import type { Hero, HeroCounters } from '../types/hero';
import type { TierSnapshot } from '../types/tier';
import { getRecommendations } from '../engine/recommender';
import { decodeCounterState, encodeCounterState } from '../engine/serializer';

export const Counter: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const heroes = heroesData as Hero[];
  const counters = countersData as Record<string, HeroCounters>;
  const tiers = tiersData as TierSnapshot;

  const [pickingTarget, setPickingTarget] = useState<'enemy' | 'ally'>('enemy');

  const {
    enemyPicks,
    allyPicks,
    laneFilter,
    toggleEnemy,
    toggleAlly,
    removeEnemy,
    removeAlly,
    setLaneFilter,
    reset,
    loadFromSerialized,
    getSerialized,
  } = useCounterStore();

  // Restore from URL query (?c=...)
  useEffect(() => {
    const cParam = searchParams.get('c');
    if (cParam) {
      const decoded = decodeCounterState(cParam);
      if (decoded) {
        loadFromSerialized(decoded, heroes);
      }
    }
  }, [searchParams, heroes, loadFromSerialized]);

  // Compute top 5 recommendations
  const recommendations = useMemo(() => {
    if (enemyPicks.length === 0) return [];

    return getRecommendations({
      allHeroes: heroes,
      enemyPicks,
      allyPicks,
      laneFilter,
      countersData: counters,
      tierRows: tiers.rows,
      limit: 5,
    });
  }, [enemyPicks, allyPicks, laneFilter, heroes, counters, tiers]);

  // Compute aggregated counter items vs. enemy team
  const recommendedItemIds = useMemo(() => {
    if (enemyPicks.length === 0) return [];
    const itemFreq: Record<string, number> = {};

    enemyPicks.forEach((enemy) => {
      const heroItems = counters[enemy.id]?.counterItems || [];
      heroItems.forEach((itemId) => {
        itemFreq[itemId] = (itemFreq[itemId] || 0) + 1;
      });
    });

    return Object.entries(itemFreq)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id)
      .slice(0, 4);
  }, [enemyPicks, counters]);

  const handleHeroGridSelect = (hero: Hero) => {
    if (pickingTarget === 'enemy') {
      toggleEnemy(hero);
    } else {
      toggleAlly(hero);
    }
  };

  const isHeroDisabled = (heroId: string) => {
    if (pickingTarget === 'enemy') {
      return (
        allyPicks.some((h) => h.id === heroId) ||
        (enemyPicks.length >= 5 && !enemyPicks.some((h) => h.id === heroId))
      );
    } else {
      return (
        enemyPicks.some((h) => h.id === heroId) ||
        (allyPicks.length >= 5 && !allyPicks.some((h) => h.id === heroId))
      );
    }
  };

  const selectedHeroIds = useMemo(() => {
    return pickingTarget === 'enemy'
      ? enemyPicks.map((h) => h.id)
      : allyPicks.map((h) => h.id);
  }, [pickingTarget, enemyPicks, allyPicks]);

  const getShareUrl = () => {
    const serialized = getSerialized();
    const encoded = encodeCounterState(serialized);
    const base = window.location.href.split('?')[0].split('#')[0];
    return `${base}#/counter?c=${encoded}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
      {/* Header and Share Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-paper font-semibold tracking-tight">
            Counter This Draft
          </h1>
          <p className="text-xs text-mist mt-1">
            Input enemy team picks to uncover the highest win-rate responses and lane counters.
          </p>
        </div>

        <CopyLinkButton getUrl={getShareUrl} label="Share counter draft" />
      </div>

      {/* Top Section: Enemy Picker & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <EnemyPicker
          enemyPicks={enemyPicks}
          allyPicks={allyPicks}
          laneFilter={laneFilter}
          onRemoveEnemy={removeEnemy}
          onRemoveAlly={removeAlly}
          onSelectLane={setLaneFilter}
          onReset={reset}
        />

        <ResultList
          results={recommendations}
          onHeroClick={(hero) => navigate(`/hero/${hero.id}`)}
        />

        {recommendedItemIds.length > 0 && (
          <CounterEquipment
            itemIds={recommendedItemIds}
            heroName="Enemy Composition"
          />
        )}
      </div>

      {/* Hero Selection Grid */}
      <div className="p-4 rounded-panel bg-ink-raised border border-line flex flex-col gap-4">
        {/* Toggle Target */}
        <div className="flex items-center gap-3 pb-3 border-b border-line">
          <span className="text-xs text-mist">Currently picking for:</span>
          <div className="flex items-center gap-1 bg-ink p-1 rounded-panel border border-line">
            <button
              onClick={() => setPickingTarget('enemy')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                pickingTarget === 'enemy'
                  ? 'bg-tier-s/20 text-tier-s font-semibold border border-tier-s/40'
                  : 'text-mist hover:text-paper'
              }`}
            >
              Enemy Team ({enemyPicks.length}/5)
            </button>
            <button
              onClick={() => setPickingTarget('ally')}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                pickingTarget === 'ally'
                  ? 'bg-tier-b/20 text-tier-b font-semibold border border-tier-b/40'
                  : 'text-mist hover:text-paper'
              }`}
            >
              Ally Team ({allyPicks.length}/5)
            </button>
          </div>
        </div>

        <HeroGrid
          heroes={heroes}
          onSelectHero={handleHeroGridSelect}
          isHeroDisabled={isHeroDisabled}
          selectedHeroIds={selectedHeroIds}
          title={pickingTarget === 'enemy' ? 'Select Enemy Heroes' : 'Select Ally Heroes'}
        />
      </div>
    </div>
  );
};
