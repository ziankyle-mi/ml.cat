import type {
  HeroStats,
  TierSnapshot,
  TierRowData,
  TierId,
  MetaSourceMode,
  MetaSourceBreakdown,
} from '../types/tier';

export const TIER_COLORS: Record<TierId, string> = {
  SS: '#c9a35b', // Gold / Mythic Peak
  S: '#a8574f',  // Crimson / High Priority
  A: '#c4983b',  // Amber / Strong Pick
  B: '#6b8199',  // Slate / Viable
  C: '#5A5E63',  // Mist / Niche
  D: '#8c6239',  // Bronze / Underperforming
};

export function calculateZScores(values: number[]): number[] {
  if (values.length === 0) return [];
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) {
    return values.map(() => 0);
  }

  return values.map((v) => (v - mean) / stdDev);
}

function distributeTiers(
  scoredHeroes: { heroId: string; score: number }[]
): { rows: TierRowData[]; tierMap: Map<string, TierId> } {
  // Sort descending
  scoredHeroes.sort((a, b) => b.score - a.score);

  const count = scoredHeroes.length;
  // SS: Top ~6% (at least 2)
  // S: Next ~10% (at least 3)
  // A: Next ~27%
  // B: Next ~26%
  // C: Next ~8%
  // D: Rest ~23%
  const ssCount = Math.max(2, Math.round(count * 0.06));
  const sCount = Math.max(3, Math.round(count * 0.10));
  const aCount = Math.max(4, Math.round(count * 0.27));
  const bCount = Math.max(4, Math.round(count * 0.26));
  const cCount = Math.max(2, Math.round(count * 0.08));

  const ssEnd = ssCount;
  const sEnd = ssEnd + sCount;
  const aEnd = sEnd + aCount;
  const bEnd = aEnd + bCount;
  const cEnd = bEnd + cCount;

  const ssHeroes = scoredHeroes.slice(0, ssEnd).map((h) => h.heroId);
  const sHeroes = scoredHeroes.slice(ssEnd, sEnd).map((h) => h.heroId);
  const aHeroes = scoredHeroes.slice(sEnd, aEnd).map((h) => h.heroId);
  const bHeroes = scoredHeroes.slice(aEnd, bEnd).map((h) => h.heroId);
  const cHeroes = scoredHeroes.slice(bEnd, cEnd).map((h) => h.heroId);
  const dHeroes = scoredHeroes.slice(cEnd).map((h) => h.heroId);

  const tierMap = new Map<string, TierId>();
  ssHeroes.forEach((id) => tierMap.set(id, 'SS'));
  sHeroes.forEach((id) => tierMap.set(id, 'S'));
  aHeroes.forEach((id) => tierMap.set(id, 'A'));
  bHeroes.forEach((id) => tierMap.set(id, 'B'));
  cHeroes.forEach((id) => tierMap.set(id, 'C'));
  dHeroes.forEach((id) => tierMap.set(id, 'D'));

  const rows: TierRowData[] = [
    { id: 'SS', color: TIER_COLORS.SS, heroIds: ssHeroes },
    { id: 'S', color: TIER_COLORS.S, heroIds: sHeroes },
    { id: 'A', color: TIER_COLORS.A, heroIds: aHeroes },
    { id: 'B', color: TIER_COLORS.B, heroIds: bHeroes },
    { id: 'C', color: TIER_COLORS.C, heroIds: cHeroes },
    { id: 'D', color: TIER_COLORS.D, heroIds: dHeroes },
  ];

  return { rows, tierMap };
}

export function buildTiersFromStats(
  stats: HeroStats[],
  now: Date = new Date(),
  sourceMode: MetaSourceMode = 'consensus'
): TierSnapshot {
  const tiersOrder: TierId[] = ['SS', 'S', 'A', 'B', 'C', 'D'];

  if (stats.length === 0) {
    const nextDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return {
      updatedAt: now.toISOString(),
      nextUpdateAt: nextDate.toISOString(),
      activeSourceMode: sourceMode,
      rows: tiersOrder.map((id) => ({ id, color: TIER_COLORS[id], heroIds: [] })),
      heroMetaMap: {},
    };
  }

  // --- Source 1: Mythic+ Ranked Match Telemetry ---
  const winRates = stats.map((s) => s.winRate);
  const pickRates = stats.map((s) => s.pickRate);
  const banRates = stats.map((s) => s.banRate);

  const zWin = calculateZScores(winRates);
  const zPick = calculateZScores(pickRates);
  const zBan = calculateZScores(banRates);

  const rankedScores = stats.map((_, i) => 0.5 * zWin[i] + 0.3 * zPick[i] + 0.2 * zBan[i]);
  const rankedDist = distributeTiers(
    stats.map((s, i) => ({ heroId: s.heroId, score: rankedScores[i] }))
  );

  // --- Source 2: Competitive Tournament Presence (MPL / M-Series) ---
  const contestRates = stats.map((s) => s.tourneyContestRate ?? s.banRate);
  const tourneyWinRates = stats.map((s) => s.tourneyWinRate ?? s.winRate);

  const zContest = calculateZScores(contestRates);
  const zTourneyWin = calculateZScores(tourneyWinRates);

  const tournamentScores = stats.map((_, i) => 0.6 * zContest[i] + 0.4 * zTourneyWin[i]);
  const tournamentDist = distributeTiers(
    stats.map((s, i) => ({ heroId: s.heroId, score: tournamentScores[i] }))
  );

  // --- Source 3: Pro Coach & Analyst Tier Ratings ---
  const analystRatings = stats.map((s) => s.analystRating ?? 75);
  const zAnalyst = calculateZScores(analystRatings);

  const analystScores = zAnalyst;
  const analystDist = distributeTiers(
    stats.map((s, i) => ({ heroId: s.heroId, score: analystScores[i] }))
  );

  // --- 3-Source Composite Consensus Score ---
  // Weights: 40% Mythic Ranked, 35% Pro Tournament, 25% Pro Analyst Consensus
  const compositeScores = stats.map((_, i) => {
    return 0.40 * rankedScores[i] + 0.35 * tournamentScores[i] + 0.25 * analystScores[i];
  });

  const consensusDist = distributeTiers(
    stats.map((s, i) => ({ heroId: s.heroId, score: compositeScores[i] }))
  );

  // Build hero metadata map
  const heroMetaMap: Record<string, MetaSourceBreakdown> = {};

  stats.forEach((s, i) => {
    heroMetaMap[s.heroId] = {
      ranked: {
        winRate: s.winRate,
        pickRate: s.pickRate,
        banRate: s.banRate,
        score: rankedScores[i],
        tier: rankedDist.tierMap.get(s.heroId) || 'B',
      },
      tournament: {
        contestRate: s.tourneyContestRate ?? 0.5,
        winRate: s.tourneyWinRate ?? 0.5,
        score: tournamentScores[i],
        tier: tournamentDist.tierMap.get(s.heroId) || 'B',
      },
      analyst: {
        rating: s.analystRating ?? 75,
        tier: analystDist.tierMap.get(s.heroId) || 'B',
        verdict: s.analystVerdict || 'Solid pick in current meta.',
      },
      compositeScore: s.points ?? compositeScores[i],
      mlbbGgPoints: s.points,
      movement: s.movement ?? 'same',
    };
  });

  // Choose rows based on selected source mode
  let activeRows: TierRowData[];

  const hasGgTiers = stats.some((s) => s.tier !== undefined);

  if (sourceMode === 'consensus' && hasGgTiers) {
    // Exactly matches MLBB.GG official tier ranking
    activeRows = tiersOrder.map((tId) => {
      const heroesInTier = stats
        .filter((s) => (s.tier ?? consensusDist.tierMap.get(s.heroId)) === tId)
        .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
        .map((s) => s.heroId);

      return {
        id: tId,
        color: TIER_COLORS[tId],
        heroIds: heroesInTier,
      };
    });
  } else if (sourceMode === 'ranked') {
    activeRows = rankedDist.rows;
  } else if (sourceMode === 'tournament') {
    activeRows = tournamentDist.rows;
  } else if (sourceMode === 'analyst') {
    activeRows = analystDist.rows;
  } else {
    activeRows = consensusDist.rows;
  }

  const nextUpdate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return {
    updatedAt: now.toISOString(),
    nextUpdateAt: nextUpdate.toISOString(),
    activeSourceMode: sourceMode,
    rows: activeRows,
    heroMetaMap,
  };
}
