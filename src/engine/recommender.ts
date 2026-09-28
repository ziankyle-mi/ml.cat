import type { Hero, Lane, HeroCounters } from '../types/hero';
import type { TierRowData } from '../types/tier';

export interface SuggestionResult {
  hero: Hero;
  score: number;
  reasons: string[];
}

export interface RecommenderOptions {
  allHeroes: Hero[];
  enemyPicks: Hero[];
  allyPicks?: Hero[];
  bannedHeroes?: Hero[];
  laneFilter?: Lane | null;
  countersData?: Record<string, HeroCounters>;
  tierRows?: TierRowData[];
  limit?: number;
}

export const TAG_COUNTERS: Record<string, string[]> = {
  anti_dash: ['heavy_dash'],
  hard_cc: ['heavy_dash', 'dive'],
  suppress: ['heavy_dash', 'burst', 'dive'],
  anti_heal: ['regen_heavy'],
  projectile_block: ['projectile_reliant'],
  kiting: ['regen_heavy', 'dive'],
  dive: ['projectile_reliant'],
  burst: ['projectile_reliant'],
};

export function formatTag(tag: string): string {
  return tag
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('-');
}

function doesCounterTagMatch(counterTag: string, targetTags: string[]): boolean {
  if (targetTags.includes(counterTag)) {
    return true;
  }
  const counteredTags = TAG_COUNTERS[counterTag];
  if (counteredTags && counteredTags.some((t) => targetTags.includes(t))) {
    return true;
  }
  return false;
}

export function getRecommendations(options: RecommenderOptions): SuggestionResult[] {
  const {
    allHeroes,
    enemyPicks = [],
    allyPicks = [],
    bannedHeroes = [],
    laneFilter = null,
    countersData = {},
    tierRows = [],
    limit = 5,
  } = options;

  const unavailableHeroIds = new Set<string>([
    ...enemyPicks.map((h) => h.id),
    ...allyPicks.map((h) => h.id),
    ...bannedHeroes.map((h) => h.id),
  ]);

  // Pre-calculate ally lanes and damage composition
  const allyLanes = new Set<Lane>(allyPicks.map((h) => h.primaryLane));
  const physicalAllyCount = allyPicks.filter(
    (h) => h.damageType === 'Physical'
  ).length;

  // Pre-calculate tier mapping for heroes
  const heroTierMap = new Map<string, string>();
  for (const row of tierRows) {
    for (const hId of row.heroIds) {
      heroTierMap.set(hId, row.id);
    }
  }

  const results: SuggestionResult[] = [];

  for (const candidate of allHeroes) {
    if (unavailableHeroIds.has(candidate.id)) {
      continue;
    }

    if (laneFilter && candidate.primaryLane !== laneFilter && candidate.secondaryLane !== laneFilter) {
      continue;
    }

    let score = 0;
    const reasons: string[] = [];

    // 1. Lane Scoring
    if (allyPicks.length > 0) {
      if (allyLanes.has(candidate.primaryLane)) {
        score -= 50;
        reasons.push(`Duplicate ${candidate.primaryLane}`);
      } else {
        score += 30;
        reasons.push(`Fills ${candidate.primaryLane}`);
      }
    }

    // 2. Counter tags & 3. Hard Counters vs Enemies
    for (const enemy of enemyPicks) {
      // 2a. Candidate's counterTags match enemy's tags (+12 each)
      for (const counterTag of candidate.counterTags) {
        if (doesCounterTagMatch(counterTag, enemy.tags)) {
          score += 12;
          reasons.push(`+${formatTag(counterTag)} vs ${enemy.name}`);
        }
      }

      // 2b. Enemy's counterTags match candidate's tags (-10 each)
      for (const enemyCounterTag of enemy.counterTags) {
        if (doesCounterTagMatch(enemyCounterTag, candidate.tags)) {
          score -= 10;
          reasons.push(`-${formatTag(enemyCounterTag)} vs ${enemy.name}`);
        }
      }

      // 3. Hard counter (+25)
      const enemyCounterList = countersData[enemy.id]?.counteredBy || [];
      const isHardCounter = enemyCounterList.some((c) => c.id === candidate.id);
      if (isHardCounter) {
        score += 25;
        reasons.push(`+Hard counter vs ${enemy.name}`);
      }
    }

    // 4. Damage mix
    if (physicalAllyCount >= 3) {
      if (candidate.damageType === 'Physical') {
        score -= 15;
        reasons.push('-Heavy physical team');
      } else if (candidate.damageType === 'Magic') {
        score += 20;
        reasons.push('+Magic damage balance');
      }
    }

    // 5. Meta Tier
    const tier = heroTierMap.get(candidate.id);
    if (tier === 'SS') {
      score += 6;
      reasons.push('+SS Tier');
    } else if (tier === 'S') {
      score += 4;
      reasons.push('+S Tier');
    } else if (tier === 'A') {
      score += 2;
      reasons.push('+A Tier');
    }

    results.push({
      hero: candidate,
      score,
      reasons,
    });
  }

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}
