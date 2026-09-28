import { describe, it, expect } from 'vitest';
import { getRecommendations } from '../src/engine/recommender';
import type { Hero } from '../src/types/hero';
import type { TierRowData } from '../src/types/tier';

const heroes: Hero[] = [
  {
    id: 'hero-a',
    name: 'Hero A',
    role: 'Fighter',
    primaryLane: 'EXP',
    damageType: 'Physical',
    tags: ['heavy_dash'],
    counterTags: ['hard_cc'],
    icon: '/heroes/hero-a.webp',
  },
  {
    id: 'hero-b',
    name: 'Hero B',
    role: 'Tank',
    primaryLane: 'Roam',
    damageType: 'Magic',
    tags: ['hard_cc'],
    counterTags: ['anti_dash'],
    icon: '/heroes/hero-b.webp',
  },
  {
    id: 'hero-c',
    name: 'Hero C',
    role: 'Mage',
    primaryLane: 'Mid',
    damageType: 'Magic',
    tags: ['burst'],
    counterTags: ['anti_heal'],
    icon: '/heroes/hero-c.webp',
  },
  {
    id: 'hero-d',
    name: 'Hero D',
    role: 'Fighter',
    primaryLane: 'EXP',
    damageType: 'Physical',
    tags: ['regen_heavy'],
    counterTags: ['kiting'],
    icon: '/heroes/hero-d.webp',
  },
];

const tierRows: TierRowData[] = [
  { id: 'SS', color: '#c9a35b', heroIds: ['hero-b'] },
  { id: 'S', color: '#a8574f', heroIds: ['hero-a'] },
  { id: 'A', color: '#7d8f6a', heroIds: ['hero-c'] },
  { id: 'B', color: '#6b8199', heroIds: ['hero-d'] },
];

describe('recommender', () => {
  it('handles empty teams without errors and returns sorted results', () => {
    const results = getRecommendations({
      allHeroes: heroes,
      enemyPicks: [],
      allyPicks: [],
      tierRows,
    });

    expect(results.length).toBeGreaterThanOrEqual(3);
    // hero-b is SS tier so it gets +6 meta bonus
    expect(results[0].hero.id).toBe('hero-b');
  });

  it('rewards counter tags and hard counters', () => {
    const results = getRecommendations({
      allHeroes: heroes,
      enemyPicks: [heroes[0]], // Enemy has heavy_dash
      allyPicks: [],
      countersData: {
        'hero-a': {
          counteredBy: [{ id: 'hero-b', reason: 'Hard counter' }],
          strongAgainst: [],
        },
      },
      tierRows,
    });

    // hero-b has anti_dash counter tag (+12) and is hard counter (+25) and SS (+6) = 43
    expect(results[0].hero.id).toBe('hero-b');
    expect(results[0].reasons.some((r) => r.includes('Hard counter'))).toBe(true);
    expect(results[0].reasons.some((r) => r.includes('Anti-Dash') || r.includes('Anti-dash'))).toBe(true);
  });

  it('penalizes duplicate lane and balances physical/magic damage', () => {
    // 3 physical ally picks on EXP, Roam, Jungle
    const allyPicks: Hero[] = [
      heroes[0], // EXP physical
      { ...heroes[0], id: 'p2', primaryLane: 'Gold', damageType: 'Physical' },
      { ...heroes[0], id: 'p3', primaryLane: 'Jungle', damageType: 'Physical' },
    ];

    const results = getRecommendations({
      allHeroes: heroes,
      enemyPicks: [],
      allyPicks,
      tierRows,
    });

    // hero-d is EXP (already taken by hero-a: -50, and 4th physical: -15)
    const heroDResult = results.find((r) => r.hero.id === 'hero-d');
    expect(heroDResult?.score).toBeLessThan(0);

    // hero-c is Mid (new lane: +30, magic damage bonus: +20, tier A: +2)
    const heroCResult = results.find((r) => r.hero.id === 'hero-c');
    expect(heroCResult?.score).toBeGreaterThan(40);
  });

  it('excludes already picked and banned heroes', () => {
    const results = getRecommendations({
      allHeroes: [heroes[0], heroes[1], heroes[2]],
      enemyPicks: [heroes[0]],
      allyPicks: [heroes[1]],
      bannedHeroes: [heroes[2]],
    });

    expect(results).toHaveLength(0);
  });
});
