import { describe, it, expect } from 'vitest';
import { calculateZScores, buildTiersFromStats } from '../src/engine/tierBuilder';
import type { HeroStats } from '../src/types/tier';

describe('tierBuilder', () => {
  it('calculates z-scores correctly', () => {
    const values = [10, 20, 30];
    const z = calculateZScores(values);
    expect(z[1]).toBeCloseTo(0);
    expect(z[0]).toBeLessThan(0);
    expect(z[2]).toBeGreaterThan(0);
  });

  it('handles empty stats gracefully', () => {
    const tiers = buildTiersFromStats([]);
    expect(tiers.rows).toHaveLength(6);
    expect(tiers.rows[0].id).toBe('SS');
    expect(tiers.rows[5].id).toBe('D');
    expect(tiers.rows[0].heroIds).toEqual([]);
  });

  it('ranks heroes and distributes them into SS, S, A, B, C, D tiers', () => {
    const stats: HeroStats[] = Array.from({ length: 30 }, (_, i) => ({
      heroId: `hero-${i}`,
      winRate: 0.45 + i * 0.005,
      pickRate: 0.01 + i * 0.001,
      banRate: 0.05 + i * 0.01,
    }));

    const result = buildTiersFromStats(stats);
    expect(result.rows).toHaveLength(6);
    // Highest ranked hero should be in SS
    expect(result.rows[0].heroIds).toContain('hero-29');
    // Lowest ranked hero should be in D
    const dTier = result.rows.find((r) => r.id === 'D');
    expect(dTier?.heroIds).toContain('hero-0');
  });

  it('respects MLBB.GG exact tier and points when provided', () => {
    const stats: HeroStats[] = [
      { heroId: 'hirara', winRate: 0.55, pickRate: 0.03, banRate: 0.72, tier: 'SS', points: 3450 },
      { heroId: 'aulus', winRate: 0.52, pickRate: 0.02, banRate: 0.15, tier: 'S', points: 2800 },
      { heroId: 'kadita', winRate: 0.51, pickRate: 0.02, banRate: 0.08, tier: 'A', points: 2200 },
      { heroId: 'suyou', winRate: 0.50, pickRate: 0.02, banRate: 0.05, tier: 'B', points: 1800 },
      { heroId: 'akai', winRate: 0.47, pickRate: 0.01, banRate: 0.02, tier: 'C', points: 1400 },
      { heroId: 'layla', winRate: 0.44, pickRate: 0.01, banRate: 0.01, tier: 'D', points: 900 },
    ];

    const result = buildTiersFromStats(stats, new Date(), 'consensus');
    expect(result.rows).toHaveLength(6);
    expect(result.rows[0].heroIds).toEqual(['hirara']);
    expect(result.rows[1].heroIds).toEqual(['aulus']);
    expect(result.rows[2].heroIds).toEqual(['kadita']);
    expect(result.rows[3].heroIds).toEqual(['suyou']);
    expect(result.rows[4].heroIds).toEqual(['akai']);
    expect(result.rows[5].heroIds).toEqual(['layla']);
  });
});
