import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Hero, HeroCounters } from '../types/hero';
import type { TierSnapshot, TierId } from '../types/tier';
import heroesData from '../data/heroes.json';
import countersData from '../data/counters.json';
import tiersData from '../data/tiers.json';
import { HeroHeader } from '../components/hero/HeroHeader';
import { CounterList, type CounterItem } from '../components/hero/CounterList';
import { CounterEquipment } from '../components/hero/CounterEquipment';
import { HeroAvatar } from '../components/common/HeroAvatar';
import { TAG_COUNTERS, formatTag } from '../engine/recommender';
import { ArrowLeft, Layers, BarChart3, Trophy, Award } from 'lucide-react';

export const HeroPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const heroes = heroesData as Hero[];
  const counters = countersData as Record<string, HeroCounters>;
  const tiers = tiersData as TierSnapshot;

  const heroMap = useMemo(() => new Map<string, Hero>(heroes.map((h) => [h.id, h])), [heroes]);

  const hero = id ? heroMap.get(id) : undefined;

  // Find tier of this hero
  const heroTierInfo = useMemo(() => {
    if (!hero) return { tier: 'B' as TierId, color: '#6b8199' };
    for (const row of tiers.rows) {
      if (row.heroIds.includes(hero.id)) {
        return { tier: row.id, color: row.color };
      }
    }
    return { tier: 'B' as TierId, color: '#6b8199' };
  }, [hero, tiers]);

  // 3-source meta telemetry
  const metaBreakdown = useMemo(() => {
    if (!hero || !tiers.heroMetaMap) return null;
    return tiers.heroMetaMap[hero.id] || null;
  }, [hero, tiers]);

  // Build "Counter with" list (Hand-written + Tag Fallback)
  const counterWithItems = useMemo((): CounterItem[] => {
    if (!hero) return [];

    const result: CounterItem[] = [];
    const seenIds = new Set<string>();

    // 1. Hand-written counters
    const explicit = counters[hero.id]?.counteredBy || [];
    for (const entry of explicit) {
      const counterHero = heroMap.get(entry.id);
      if (counterHero) {
        result.push({
          hero: counterHero,
          reason: entry.reason,
        });
        seenIds.add(counterHero.id);
      }
    }

    // 2. Tag fallback if fewer than 5 counters
    if (result.length < 5) {
      for (const candidate of heroes) {
        if (candidate.id === hero.id || seenIds.has(candidate.id)) continue;

        for (const candidateCounterTag of candidate.counterTags) {
          const targets = TAG_COUNTERS[candidateCounterTag] || [candidateCounterTag];
          const matchedTag = hero.tags.find((t) => targets.includes(t));
          if (matchedTag) {
            result.push({
              hero: candidate,
              reason: `${formatTag(candidateCounterTag)} naturally counters ${hero.name}'s ${formatTag(matchedTag)}.`,
            });
            seenIds.add(candidate.id);
            break;
          }
        }

        if (result.length >= 5) break;
      }
    }

    return result.slice(0, 5);
  }, [hero, counters, heroes, heroMap]);

  // Recommended Counter Equipment
  const counterItemIds = useMemo(() => {
    if (!hero) return [];
    return counters[hero.id]?.counterItems || ['dominance-ice', 'winter-crown', 'antique-cuirass'];
  }, [hero, counters]);

  // "Strong against" (Heroes this hero counters - strictly excluding heroes in counterWithItems)
  const strongAgainstHeroes = useMemo((): Hero[] => {
    if (!hero) return [];
    const directIds = counters[hero.id]?.strongAgainst || [];
    const counterHeroIds = new Set(counterWithItems.map((c) => c.hero.id));
    counterHeroIds.add(hero.id);

    const direct = directIds
      .map((hid) => heroMap.get(hid))
      .filter((h): h is Hero => !!h && !counterHeroIds.has(h.id));

    if (direct.length >= 4) return direct.slice(0, 5);

    // Fallback: find heroes countered by this hero's counterTags
    const extra: Hero[] = [];
    for (const other of heroes) {
      if (counterHeroIds.has(other.id) || direct.some((d) => d.id === other.id)) continue;
      for (const tag of hero.counterTags) {
        const targets = TAG_COUNTERS[tag] || [tag];
        if (other.tags.some((t) => targets.includes(t))) {
          extra.push(other);
          break;
        }
      }
      if (direct.length + extra.length >= 5) break;
    }

    return [...direct, ...extra].slice(0, 5);
  }, [hero, counters, heroes, heroMap, counterWithItems]);

  if (!hero) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="font-serif text-2xl text-paper mb-4">Hero Not Found</h1>
        <p className="text-sm text-mist mb-6">
          The requested hero does not exist in the database.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-panel text-sm text-paper bg-ink-raised border border-line hover:border-mist"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tiers</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
      {/* Back link */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-mist hover:text-paper transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Heroes & Tiers</span>
        </Link>
      </div>

      {/* Hero Header */}
      <HeroHeader
        hero={hero}
        tier={heroTierInfo.tier}
        tierColor={heroTierInfo.color}
        points={metaBreakdown?.mlbbGgPoints}
        movement={metaBreakdown?.movement}
      />

      {/* 3-Source Meta Analysis Breakdown */}
      {metaBreakdown && (
        <div className="flex flex-col gap-3 p-4 rounded-panel bg-ink-raised border border-line">
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <span className="font-serif text-sm font-semibold text-paper flex items-center gap-2">
              <Layers className="w-4 h-4 text-tier-ss" />
              Live Telemetry & MLBB.GG Consensus
            </span>
            <span className="text-[11px] text-mist font-mono">Source: MLBB.GG</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Source 1: Mythic Ranked */}
            <div className="p-3 rounded-panel bg-ink border border-line/60 flex flex-col gap-1.5">
              <span className="text-[11px] text-mist uppercase tracking-wider font-medium flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-tier-ss" />
                1. Mythic Ranked
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-serif text-paper font-semibold">
                  {(metaBreakdown.ranked.winRate * 100).toFixed(1)}% WR
                </span>
                <span className="text-xs text-tier-s font-mono">
                  {(metaBreakdown.ranked.banRate * 100).toFixed(1)}% Ban
                </span>
              </div>
              <span className="text-[11px] text-mist">
                Pick Rate: {(metaBreakdown.ranked.pickRate * 100).toFixed(1)}% · Ranked Tier: <strong>{metaBreakdown.ranked.tier}</strong>
              </span>
            </div>

            {/* Source 2: Competitive / MPL */}
            <div className="p-3 rounded-panel bg-ink border border-line/60 flex flex-col gap-1.5">
              <span className="text-[11px] text-mist uppercase tracking-wider font-medium flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-tier-b" />
                2. MPL Tournaments
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-serif text-paper font-semibold">
                  {(metaBreakdown.tournament.contestRate * 100).toFixed(0)}% P/B
                </span>
                <span className="text-xs text-tier-a font-mono">
                  {(metaBreakdown.tournament.winRate * 100).toFixed(1)}% Win
                </span>
              </div>
              <span className="text-[11px] text-mist">
                Contest presence · Pro Tier: <strong>{metaBreakdown.tournament.tier}</strong>
              </span>
            </div>

            {/* Source 3: Analyst & Pro Consensus */}
            <div className="p-3 rounded-panel bg-ink border border-line/60 flex flex-col gap-1.5">
              <span className="text-[11px] text-mist uppercase tracking-wider font-medium flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-tier-a" />
                3. Pro Coach Consensus
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-serif text-paper font-semibold">
                  {metaBreakdown.analyst.rating} / 100
                </span>
                <span className="text-xs text-tier-ss font-mono">
                  Tier: <strong>{metaBreakdown.analyst.tier}</strong>
                </span>
              </div>
              <p className="text-[11px] text-mist line-clamp-2">
                {metaBreakdown.analyst.verdict}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Block: Counter With */}
      <CounterList
        title={`Heroes That Counter ${hero.name}`}
        items={counterWithItems}
        onHeroClick={(target) => navigate(`/hero/${target.id}`)}
        priority
      />

      {/* Recommended Counter Equipment */}
      <CounterEquipment
        itemIds={counterItemIds}
        heroName={hero.name}
      />

      {/* Favorable Matchups: Strong against */}
      <div className="flex flex-col gap-3 p-5 rounded-panel bg-ink-raised border border-line">
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <h3 className="font-serif text-base font-semibold text-paper tracking-tight">
            Heroes Countered by {hero.name} (Favorable Matchups)
          </h3>
          <span className="text-[11px] text-mist font-mono uppercase tracking-wider">
            Matchup Advantages
          </span>
        </div>
        <p className="text-xs text-mist leading-relaxed">
          {hero.name} excels against these picks due to kit advantages, crowd control timing, and damage profile.
        </p>
        <div className="flex items-center gap-4 flex-wrap pt-2">
          {strongAgainstHeroes.map((h) => (
            <HeroAvatar
              key={h.id}
              hero={h}
              size={64}
              showName
              onClick={() => navigate(`/hero/${h.id}`)}
            />
          ))}
          {strongAgainstHeroes.length === 0 && (
            <span className="text-xs text-mist/60 italic">No specific favorable matchups recorded</span>
          )}
        </div>
      </div>
    </div>
  );
};
