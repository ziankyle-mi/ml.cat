import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Hero, Lane } from '../types/hero';
import type { MetaSourceMode, HeroStats } from '../types/tier';
import heroesData from '../data/heroes.json';
import statsData from '../data/stats.json';
import tiersData from '../data/tiers.json';
import { TierRow } from '../components/tiers/TierRow';
import { buildTiersFromStats } from '../engine/tierBuilder';
import { Search, Flame } from 'lucide-react';

const LANES: ('All' | Lane)[] = ['All', 'EXP', 'Gold', 'Mid', 'Jungle', 'Roam'];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLane, setSelectedLane] = useState<'All' | Lane>('All');
  const [sourceMode, setSourceMode] = useState<MetaSourceMode>('consensus');
  const [searchQuery, setSearchQuery] = useState('');

  const heroes = heroesData as Hero[];
  const stats = statsData as HeroStats[];
  const initialTiers = tiersData;

  const heroMap = useMemo(() => new Map<string, Hero>(heroes.map((h) => [h.id, h])), [heroes]);

  // Recalculate tier snapshot dynamically when sourceMode changes
  const activeSnapshot = useMemo(() => {
    return buildTiersFromStats(stats, new Date(initialTiers.updatedAt), sourceMode);
  }, [stats, initialTiers.updatedAt, sourceMode]);

  const handleHeroClick = (hero: Hero) => {
    navigate(`/hero/${hero.id}`);
  };

  // Filter heroes by lane and search query
  const query = searchQuery.trim().toLowerCase();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      {/* Human, Punchy Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-paper tracking-tight uppercase flex items-center gap-2">
              <Flame className="w-6 h-6 text-tier-ss" />
              MLBB Tier List
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded font-mono font-bold bg-ink-raised border border-line text-mist">
              Patch 2.2.16
            </span>
          </div>
          <p className="text-xs text-mist">
            Daily meta rankings based on Mythic+ win rates & MLBB.GG telemetry.
          </p>
        </div>

        {/* Quick Inline Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-mist absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search hero..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-ink-raised border border-line text-xs text-paper placeholder-mist/70 focus:outline-none focus:border-tier-ss transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-mist hover:text-paper"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Clean Filters Bar: Lanes + Simple Ranking Mode Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Lane Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {LANES.map((lane) => {
            const isSelected = selectedLane === lane;
            return (
              <button
                key={lane}
                onClick={() => setSelectedLane(lane)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-paper text-ink shadow-sm'
                    : 'bg-ink-raised/80 text-mist hover:text-paper hover:bg-line/60'
                }`}
              >
                {lane}
              </button>
            );
          })}
        </div>

        {/* Compact Mode Switcher */}
        <div className="flex items-center gap-1 bg-ink-raised p-1 rounded-lg border border-line text-xs">
          <button
            onClick={() => setSourceMode('consensus')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              sourceMode === 'consensus'
                ? 'bg-line/80 text-tier-ss font-bold shadow-sm'
                : 'text-mist hover:text-paper'
            }`}
          >
            MLBB.GG Meta
          </button>
          <button
            onClick={() => setSourceMode('ranked')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              sourceMode === 'ranked'
                ? 'bg-line/80 text-tier-ss font-bold shadow-sm'
                : 'text-mist hover:text-paper'
            }`}
          >
            Win Rate
          </button>
          <button
            onClick={() => setSourceMode('tournament')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              sourceMode === 'tournament'
                ? 'bg-line/80 text-tier-ss font-bold shadow-sm'
                : 'text-mist hover:text-paper'
            }`}
          >
            Tournaments
          </button>
        </div>
      </div>

      {/* Tier Rows */}
      <div className="flex flex-col gap-2 pt-2">
        {activeSnapshot.rows.map((row) => {
          const rowHeroes = row.heroIds
            .map((id) => heroMap.get(id))
            .filter((h): h is Hero => !!h)
            .filter((h) => {
              // Lane filter
              const matchesLane =
                selectedLane === 'All' ||
                h.primaryLane === selectedLane ||
                h.secondaryLane === selectedLane;

              // Search query filter
              const matchesSearch =
                !query ||
                h.name.toLowerCase().includes(query) ||
                h.role.toLowerCase().includes(query);

              return matchesLane && matchesSearch;
            });

          // Skip empty rows when actively searching
          if (query && rowHeroes.length === 0) return null;

          return (
            <TierRow
              key={row.id}
              tierId={row.id}
              color={row.color}
              heroes={rowHeroes}
              onHeroClick={handleHeroClick}
            />
          );
        })}
      </div>
    </div>
  );
};
