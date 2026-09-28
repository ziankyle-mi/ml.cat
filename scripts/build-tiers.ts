import fs from 'fs';
import path from 'path';
import { buildTiersFromStats } from '../src/engine/tierBuilder';
import type { Hero } from '../src/types/hero';
import type { HeroStats, TierId } from '../src/types/tier';

const HEROES_FILE = path.resolve(process.cwd(), 'src/data/heroes.json');
const STATS_FILE = path.resolve(process.cwd(), 'src/data/stats.json');
const TIERS_FILE = path.resolve(process.cwd(), 'src/data/tiers.json');

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

function clean(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function tryFetchMlbbGgData(): Promise<HeroStats[] | null> {
  try {
    console.log('Fetching live daily tier list & stats from https://mlbb.gg...');

    // 1. Fetch Tier List (for movements)
    const tierlistRes = await fetch('https://mlbb.gg/tierlist', {
      headers: HEADERS,
      signal: AbortSignal.timeout(10000),
    });

    if (!tierlistRes.ok) {
      console.warn(`MLBB.GG tierlist returned status ${tierlistRes.status}`);
      return null;
    }

    const tierlistHtml = await tierlistRes.text();
    const movementMap = new Map<string, 'same' | 'up' | 'down'>();

    const tlMatches = [...tierlistHtml.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g)];
    let tlCombined = '';
    for (const m of tlMatches) {
      try {
        tlCombined += JSON.parse(`"${m[1]}"`);
      } catch {
        tlCombined += m[1];
      }
    }

    const tlMarker = '"tierListData":';
    const tlIdx = tlCombined.indexOf(tlMarker);
    if (tlIdx !== -1) {
      const startIdx = tlCombined.indexOf('{', tlIdx);
      let depth = 0;
      let endIdx = -1;
      for (let i = startIdx; i < tlCombined.length; i++) {
        if (tlCombined[i] === '{') depth++;
        else if (tlCombined[i] === '}') {
          depth--;
          if (depth === 0) {
            endIdx = i;
            break;
          }
        }
      }
      if (endIdx !== -1) {
        const tlData = JSON.parse(tlCombined.substring(startIdx, endIdx + 1));
        for (const t of tlData.data || []) {
          for (const item of t.data || []) {
            if (item.hero?.name) {
              movementMap.set(clean(item.hero.name), item.movement || 'same');
            }
          }
        }
      }
    }

    // 2. Fetch Statistics (for points, win rates, ban rates, pick rates, tiers)
    const statsRes = await fetch('https://mlbb.gg/statistics', {
      headers: HEADERS,
      signal: AbortSignal.timeout(10000),
    });

    if (!statsRes.ok) {
      console.warn(`MLBB.GG statistics returned status ${statsRes.status}`);
      return null;
    }

    const statsHtml = await statsRes.text();
    const stMatches = [...statsHtml.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g)];
    let stCombined = '';
    for (const m of stMatches) {
      try {
        stCombined += JSON.parse(`"${m[1]}"`);
      } catch {
        stCombined += m[1];
      }
    }

    const stMarker = '[{"hero_id":';
    const stIdx = stCombined.indexOf(stMarker);
    if (stIdx === -1) {
      console.warn('Could not locate hero statistics array in MLBB.GG response');
      return null;
    }

    let depth = 0;
    let endIdx = -1;
    for (let i = stIdx; i < stCombined.length; i++) {
      if (stCombined[i] === '[') depth++;
      else if (stCombined[i] === ']') {
        depth--;
        if (depth === 0) {
          endIdx = i;
          break;
        }
      }
    }

    if (endIdx === -1) {
      console.warn('Could not parse end of hero statistics array');
      return null;
    }

    const ggStats = JSON.parse(stCombined.substring(stIdx, endIdx + 1));
    console.log(`Successfully fetched live data for ${ggStats.length} heroes from MLBB.GG!`);

    const heroes: Hero[] = JSON.parse(fs.readFileSync(HEROES_FILE, 'utf-8'));
    const heroMap = new Map<string, Hero>();
    heroes.forEach((h) => {
      heroMap.set(clean(h.name), h);
      heroMap.set(clean(h.id), h);
    });

    const liveStats: HeroStats[] = [];

    for (const stat of ggStats) {
      const key = clean(stat.name);
      const hero = heroMap.get(key);
      if (!hero) continue;

      const winRate = parseFloat(stat.win_rate) / 100;
      const banRate = parseFloat(stat.ban_rate) / 100;
      const pickRate = parseFloat(stat.pick_rate) / 100;
      const points = parseFloat(stat.points);
      const tier = stat.tier as TierId;
      const movement = movementMap.get(key) || 'same';

      let tourneyContestRate = Math.min(0.96, Math.max(0.15, banRate * 2.5 + pickRate * 3.0));
      if (tier === 'SS') tourneyContestRate = Math.max(0.85, tourneyContestRate);
      if (tier === 'S') tourneyContestRate = Math.max(0.70, tourneyContestRate);

      let analystRating = Math.round(50 + (points / 3500) * 49);
      if (tier === 'SS') analystRating = Math.max(93, analystRating);
      else if (tier === 'S') analystRating = Math.max(86, Math.min(92, analystRating));
      else if (tier === 'A') analystRating = Math.max(78, Math.min(85, analystRating));
      else if (tier === 'B') analystRating = Math.max(70, Math.min(77, analystRating));
      else if (tier === 'C') analystRating = Math.max(62, Math.min(69, analystRating));
      else if (tier === 'D') analystRating = Math.min(61, analystRating);

      let analystVerdict = `MLBB.GG ${tier}-Tier meta pick (${points} pts).`;
      if (tier === 'SS') {
        analystVerdict = `Highest meta priority on MLBB.GG with ${points} points. Dominant ${hero.primaryLane} lane performance.`;
      } else if (tier === 'S') {
        analystVerdict = `Strong S-tier meta pick on MLBB.GG (${points} pts). Exceptional utility and consistent win rate.`;
      } else if (tier === 'A') {
        analystVerdict = `Solid A-tier standard pick (${points} pts). Reliable in competitive ranked play.`;
      } else if (tier === 'B') {
        analystVerdict = `Viable B-tier flex pick (${points} pts). Matchup dependent with balanced counters.`;
      } else if (tier === 'C') {
        analystVerdict = `Niche C-tier hero (${points} pts). Requires specific team composition synergy.`;
      } else if (tier === 'D') {
        analystVerdict = `Underperforming in current meta (${points} pts). Subject to severe counter picks.`;
      }

      liveStats.push({
        heroId: hero.id,
        winRate: Math.round(winRate * 1000) / 1000,
        pickRate: Math.round(pickRate * 1000) / 1000,
        banRate: Math.round(banRate * 1000) / 1000,
        points,
        tier,
        movement,
        tourneyContestRate: Math.round(tourneyContestRate * 100) / 100,
        tourneyWinRate: Math.round(winRate * 1000) / 1000,
        analystRating,
        analystVerdict,
      });
    }

    if (liveStats.length >= 100) {
      fs.writeFileSync(STATS_FILE, JSON.stringify(liveStats, null, 2), 'utf-8');
      console.log(`Updated local ${STATS_FILE} with ${liveStats.length} live heroes from MLBB.GG.`);
      return liveStats;
    }

    return null;
  } catch (err: any) {
    console.warn('Could not fetch live MLBB.GG data (using local stats cache):', err.message);
    return null;
  }
}

async function buildTiers() {
  console.log('Building MLBB daily meta tiers based on MLBB.GG...');

  // Try live fetch from mlbb.gg first
  let stats: HeroStats[] | null = await tryFetchMlbbGgData();

  if (!stats) {
    if (!fs.existsSync(STATS_FILE)) {
      throw new Error(`Stats file not found at ${STATS_FILE}`);
    }
    const rawStats = fs.readFileSync(STATS_FILE, 'utf-8');
    stats = JSON.parse(rawStats);
    console.log(`Loaded cached stats for ${stats?.length} heroes.`);
  }

  const snapshot = buildTiersFromStats(stats || [], new Date());

  fs.writeFileSync(TIERS_FILE, JSON.stringify(snapshot, null, 2), 'utf-8');

  console.log(`Wrote tiers snapshot to ${TIERS_FILE}`);
  console.log(`Updated at: ${snapshot.updatedAt}`);
  console.log(`Next update: ${snapshot.nextUpdateAt}`);
  for (const row of snapshot.rows) {
    console.log(
      `Tier ${row.id} (${row.color}): ${row.heroIds.length} heroes [${row.heroIds.slice(0, 5).join(', ')}${
        row.heroIds.length > 5 ? '...' : ''
      }]`
    );
  }
}

buildTiers().catch((err) => {
  console.error('Failed to build tiers:', err);
  process.exit(1);
});
