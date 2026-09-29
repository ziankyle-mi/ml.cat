import fs from 'fs';
import path from 'path';
import type { Hero } from '../src/types/hero';
import type { HeroStats, TierId } from '../src/types/tier';
import { buildTiersFromStats } from '../src/engine/tierBuilder';

const HEROES_FILE = path.resolve(process.cwd(), 'src/data/heroes.json');
const STATS_FILE = path.resolve(process.cwd(), 'src/data/stats.json');
const TIERS_FILE = path.resolve(process.cwd(), 'src/data/tiers.json');

const GG_STATS_FILE = path.resolve(process.cwd(), 'scripts/mlbb_gg_all_stats.json');
const GG_TIERLIST_FILE = path.resolve(process.cwd(), 'scripts/mlbb_gg_tierlist.json');

function clean(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function main() {
  console.log('--- Syncing MLBB.GG Tier List & Stats to Codebase ---');

  const heroes: Hero[] = JSON.parse(fs.readFileSync(HEROES_FILE, 'utf-8'));
  const ggStats = JSON.parse(fs.readFileSync(GG_STATS_FILE, 'utf-8'));
  const ggTierlist = JSON.parse(fs.readFileSync(GG_TIERLIST_FILE, 'utf-8'));

  // Build movement lookup
  const movementMap = new Map<string, 'same' | 'up' | 'down'>();
  for (const t of ggTierlist.data) {
    for (const item of t.data) {
      movementMap.set(clean(item.hero.name), item.movement);
    }
  }

  // Build hero mapping
  const heroIdMap = new Map<string, Hero>();
  heroes.forEach((h) => {
    heroIdMap.set(clean(h.name), h);
    heroIdMap.set(clean(h.id), h);
  });

  const updatedStats: HeroStats[] = [];

  for (const stat of ggStats) {
    const key = clean(stat.name);
    const hero = heroIdMap.get(key);
    if (!hero) {
      console.warn(`Could not find hero for MLBB.GG entry: ${stat.name}`);
      continue;
    }

    const winRate = parseFloat(stat.win_rate) / 100;
    const banRate = parseFloat(stat.ban_rate) / 100;
    const pickRate = parseFloat(stat.pick_rate) / 100;
    const points = parseFloat(stat.points);
    const tier = stat.tier as TierId;
    const movement = movementMap.get(key) || 'same';

    // Competitive tournament presence (estimated from ban/pick in high mythic / pro meta)
    // High tier heroes (SS/S) have high contest rate (0.75 - 0.95)
    let tourneyContestRate = Math.min(0.96, Math.max(0.15, (banRate * 2.5 + pickRate * 3.0)));
    if (tier === 'SS') tourneyContestRate = Math.max(0.85, tourneyContestRate);
    if (tier === 'S') tourneyContestRate = Math.max(0.70, tourneyContestRate);

    // Analyst rating: scaled from points (points range ~700 to ~3500)
    // SS: 95-99, S: 88-94, A: 80-87, B: 72-79, C: 65-71, D: 50-64
    let analystRating = Math.round(50 + (points / 3500) * 49);
    if (tier === 'SS') analystRating = Math.max(93, analystRating);
    else if (tier === 'S') analystRating = Math.max(86, Math.min(92, analystRating));
    else if (tier === 'A') analystRating = Math.max(78, Math.min(85, analystRating));
    else if (tier === 'B') analystRating = Math.max(70, Math.min(77, analystRating));
    else if (tier === 'C') analystRating = Math.max(62, Math.min(69, analystRating));
    else if (tier === 'D') analystRating = Math.min(61, analystRating);

    let analystVerdict = 'Standard ranked hero with situational viability.';
    if (tier === 'SS') {
      analystVerdict = `Highest meta priority on MLBB.GG with ${stat.points} points. Dominant ${hero.primaryLane} lane performance.`;
    } else if (tier === 'S') {
      analystVerdict = `Strong S-tier meta pick on MLBB.GG (${stat.points} pts). Exceptional utility and consistent win rate.`;
    } else if (tier === 'A') {
      analystVerdict = `Solid A-tier standard pick (${stat.points} pts). Reliable in competitive ranked play.`;
    } else if (tier === 'B') {
      analystVerdict = `Viable B-tier flex pick (${stat.points} pts). Matchup dependent with balanced counters.`;
    } else if (tier === 'C') {
      analystVerdict = `Niche C-tier hero (${stat.points} pts). Requires specific team composition synergy.`;
    } else if (tier === 'D') {
      analystVerdict = `Underperforming in current meta (${stat.points} pts). Subject to severe counter picks.`;
    }

    updatedStats.push({
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

  // Save updated stats
  fs.writeFileSync(STATS_FILE, JSON.stringify(updatedStats, null, 2), 'utf-8');
  console.log(`Saved ${updatedStats.length} heroes to ${STATS_FILE}`);

  // Compile tiers snapshot
  const snapshot = buildTiersFromStats(updatedStats, new Date());
  fs.writeFileSync(TIERS_FILE, JSON.stringify(snapshot, null, 2), 'utf-8');
  console.log(`Saved tiers snapshot to ${TIERS_FILE}`);

  console.log('\n--- Tier Summary from MLBB.GG ---');
  for (const row of snapshot.rows) {
    console.log(`Tier ${row.id} (${row.heroIds.length} heroes): [${row.heroIds.slice(0, 5).join(', ')}...]`);
  }
}

main().catch(console.error);
