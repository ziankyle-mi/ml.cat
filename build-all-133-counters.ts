import fs from 'fs';
import path from 'path';
import type { Hero, HeroCounters, CounterEntry } from '../src/types/hero';

const HEROES_FILE = path.resolve(process.cwd(), 'src/data/heroes.json');
const COUNTERS_FILE = path.resolve(process.cwd(), 'src/data/counters.json');

const heroes: Hero[] = JSON.parse(fs.readFileSync(HEROES_FILE, 'utf-8'));
const heroMap = new Map<string, Hero>(heroes.map((h) => [h.id, h]));

// Specific hand-crafted counters for key MLBB meta heroes
const SPECIFIC_MATCHUPS: Record<
  string,
  {
    counteredBy: { id: string; reason: string }[];
    strongAgainst: string[];
    counterItems: string[];
  }
> = {
  barats: {
    counteredBy: [
      { id: 'karrie', reason: "Lightwheel Mark true damage shreds Barats's massive HP and hybrid defense stacks." },
      { id: 'dyrroth', reason: "Spectre Step removes up to 75% of Barats's physical armor, neutralizing his bulk." },
      { id: 'claude', reason: "High-mobility Dexter kiting with Demon Hunter Sword melts Barats from a safe distance." },
      { id: 'valir', reason: "Burst Fireball knockback and perma-slow prevents Barats from closing gap or stacking." },
      { id: 'baxia', reason: "Baxia Mark reduces Barats's passive self-healing and regeneration by 50%." },
    ],
    strongAgainst: ['saber', 'gusion', 'aamon', 'fanny', 'ling'],
    counterItems: ['demon-hunter-sword', 'sea-halberd', 'dominance-ice', 'malefic-roar'],
  },
  hylos: {
    counteredBy: [
      { id: 'karrie', reason: "Percentage true damage completely ignores Hylos's colossal maximum HP pool." },
      { id: 'claude', reason: "Demon Hunter Sword basic attacks melt Hylos rapidly while dodging Ring of Punishment." },
      { id: 'dyrroth', reason: 'High armor shred and Burst strike breaks Hylos in early-to-mid game river fights.' },
      { id: 'valir', reason: 'Continuous slow and knockback neutralizes Glorious Pathway movement acceleration.' },
      { id: 'baxia', reason: 'Innate anti-heal severely curbs Hylos revitalizing regen.' },
    ],
    strongAgainst: ['suyou', 'ling', 'nolan', 'hayabusa', 'saber'],
    counterItems: ['demon-hunter-sword', 'sea-halberd', 'dominance-ice', 'malefic-roar'],
  },
  fanny: {
    counteredBy: [
      { id: 'khufra', reason: 'Bouncing Ball completely cancels Steel Cable dashes and knocks Fanny down.' },
      { id: 'kaja', reason: 'Divine Judgement suppresses Fanny mid-flight with zero reaction time.' },
      { id: 'franco', reason: 'Bloody Hunt suppression stops cable momentum instantly inside teamfights.' },
      { id: 'minsitthar', reason: "King's Calling creates a golden domain that disables all Steel Cable dashes." },
      { id: 'saber', reason: 'Triple Sweep locks Fanny in place before she can complete wall-cut loops.' },
    ],
    strongAgainst: ['layla', 'miya', 'hanabi', 'gord', 'xavier'],
    counterItems: ['antique-cuirass', 'wind-of-nature', 'winter-crown', 'blade-armor'],
  },
  ling: {
    counteredBy: [
      { id: 'khufra', reason: 'Bouncing Ball interrupts Finch Poise leaps and grounds Ling during Tempest of Blades.' },
      { id: 'kaja', reason: 'Suppression grabs Ling immediately when he descends from walls.' },
      { id: 'ruby', reason: "Be good! and Don't run, Wolf King! pull Ling and cancel his blade collection." },
      { id: 'franco', reason: 'Iron Hook pulls Ling off walls, and Bloody Hunt suppresses him instantly.' },
      { id: 'phoveus', reason: 'Astaros smashes trigger repeatedly each time Ling jumps between walls.' },
    ],
    strongAgainst: ['layla', 'eudora', 'hanabi', 'novaria', 'pharsa'],
    counterItems: ['antique-cuirass', 'wind-of-nature', 'winter-crown', 'blade-armor'],
  },
  hayabusa: {
    counteredBy: [
      { id: 'kaja', reason: 'Suppression catches Hayabusa between quad shadows before Shadow Kill triggers.' },
      { id: 'franco', reason: 'Point-blank suppression completely locks Hayabusa out of shadow escapes.' },
      { id: 'khufra', reason: 'Bouncing Ball blocks Quad Shadow dashes and ruins dive angles.' },
      { id: 'ruby', reason: 'Continuous AoE stuns interrupt Hayabusa before he can re-enter shadows.' },
      { id: 'saber', reason: 'Instantly locks Hayabusa with Triple Sweep as soon as he dives.' },
    ],
    strongAgainst: ['gord', 'eudora', 'layla', 'xavier', 'pharsa'],
    counterItems: ['wind-of-nature', 'winter-crown', 'antique-cuirass', 'blade-armor'],
  },
  suyou: {
    counteredBy: [
      { id: 'franco', reason: 'Bloody Hunt suppression shuts down dual-form combo switching completely.' },
      { id: 'kaja', reason: 'Suppression drags Suyou out of mortal form charge before burst executes.' },
      { id: 'khufra', reason: 'Bouncing Ball grounds Suyou during dash attacks and interrupts channel.' },
      { id: 'minsitthar', reason: 'Suppression arena forbids Suyou from utilizing dash mobility.' },
      { id: 'dyrroth', reason: 'Armor shred overpowers Suyou in 1v1 river skirmishes.' },
    ],
    strongAgainst: ['beatrix', 'novaria', 'pharsa', 'claude', 'miya'],
    counterItems: ['antique-cuirass', 'wind-of-nature', 'winter-crown', 'blade-armor'],
  },
  zhuxin: {
    counteredBy: [
      { id: 'hayabusa', reason: 'Shadow Kill untargetability dives past Crimson Beacon and executes Zhuxin.' },
      { id: 'ling', reason: 'High-altitude mobility avoids the airborne lantern domain and dives her backline.' },
      { id: 'fanny', reason: 'Cable velocity dashes right through Zhuxin before airborne stacks reach full.' },
      { id: 'saber', reason: 'Triple Sweep locks Zhuxin down before she can stack displacement lantern.' },
      { id: 'lancelot', reason: 'Thorned Rose invulnerability frames dodge Zhuxin airborne pull.' },
    ],
    strongAgainst: ['tigreal', 'akai', 'fredrinn', 'carmilla', 'barats'],
    counterItems: ['athenas-shield', 'radiant-armor', 'winter-crown', 'rose-gold-meteor'],
  },
  lukas: {
    counteredBy: [
      { id: 'baxia', reason: 'Baxia Mark cuts Lukas Sacred Beast life regen and sustain by 50%.' },
      { id: 'karrie', reason: 'True damage melts Lukas transformed beast armor and massive HP.' },
      { id: 'dyrroth', reason: 'Armor break crushes Lukas before full energy transformation.' },
      { id: 'valir', reason: 'Fireball knockback and stun keeps transformed Lukas at arm length.' },
      { id: 'kaja', reason: 'Suppression locks Lukas down during ultimate activation.' },
    ],
    strongAgainst: ['miya', 'layla', 'hanabi', 'zilong', 'alucard'],
    counterItems: ['sea-halberd', 'dominance-ice', 'demon-hunter-sword', 'malefic-roar'],
  },
  hirara: {
    counteredBy: [
      { id: 'kaja', reason: 'Suppression halts Hirara elusive multi-dash chain instantly.' },
      { id: 'franco', reason: 'Bloody Hunt stops Hirara scarlet executes before reset triggers.' },
      { id: 'khufra', reason: 'Bouncing Ball grounds Hirara dashes and interrupts execute burst.' },
      { id: 'minsitthar', reason: 'Spear domain completely shuts down Hirara dash mobility.' },
      { id: 'saber', reason: 'Point-and-click Triple Sweep locks Hirara down before she can dash.' },
    ],
    strongAgainst: ['layla', 'miya', 'gord', 'eudora', 'xavier'],
    counterItems: ['wind-of-nature', 'winter-crown', 'antique-cuirass', 'blade-armor'],
  },
  eudora: {
    counteredBy: [
      { id: 'athenas-shield' /* item */, reason: '' },
      { id: 'lolita', reason: 'Guardian Reflection blocks Eudora Forked Lightning and Ball Lightning stun.' },
      { id: 'saber', reason: 'Outranges Eudora bush camp by locking her first with Triple Sweep.' },
      { id: 'lancelot', reason: 'Thorned Rose immunities absorb Eudora Thunderstruck combo.' },
      { id: 'hayabusa', reason: 'Shadow Kill untargetable state dodges Eudora fatal burst.' },
      { id: 'helcurt', reason: 'Silence prevents Eudora from casting stun combo from bush.' },
    ],
    strongAgainst: ['miya', 'layla', 'hanabi', 'alucard', 'zilong'],
    counterItems: ['athenas-shield', 'winter-crown', 'radiant-armor', 'rose-gold-meteor'],
  },
  estes: {
    counteredBy: [
      { id: 'baxia', reason: 'Baxia Mark halves Moonlight Immersion healing output across teamfights.' },
      { id: 'luo-yi', reason: 'Yin-yang geometric AoE deals massive splash damage to clustered Estes deathballs.' },
      { id: 'karrie', reason: 'True damage melts the frontline heroes Estes attempts to tether heal.' },
      { id: 'dyrroth', reason: 'Armor shred and burst eliminates Estes before healing ticks complete.' },
      { id: 'akai', reason: 'Heavy Spin disperses Estes deathball formation and scatters teammates.' },
    ],
    strongAgainst: ['balmond', 'barats', 'uranus', 'hilda'],
    counterItems: ['dominance-ice', 'sea-halberd', 'glowing-wand', 'demon-hunter-sword'],
  },
  tigreal: {
    counteredBy: [
      { id: 'diggie', reason: "Time Journey cleanses Tigreal Implosion pull and shields entire team." },
      { id: 'wanwan', reason: 'Needles in Flowers cleanses Sacred Hammer and easily kites Tigreal.' },
      { id: 'valir', reason: 'Searing Torrent pushes Tigreal away before Implosion channel completes.' },
      { id: 'akai', reason: 'Heavy Spin knocks Tigreal out of Implosion animation.' },
      { id: 'claude', reason: 'Blazing Duet with Dexter blink escapes Tigreal crowd control easily.' },
    ],
    strongAgainst: ['miya', 'layla', 'alucard', 'zilong', 'hanabi'],
    counterItems: ['demon-hunter-sword', 'malefic-roar', 'sea-halberd', 'dominance-ice'],
  },
  miya: {
    counteredBy: [
      { id: 'saber', reason: 'Triple Sweep bursts Miya before she can trigger Hidden Moonlight.' },
      { id: 'hayabusa', reason: 'Shadow Kill tracks Miya even after she uses ultimate cleanse.' },
      { id: 'natalia', reason: 'The Hunt silence prevents Miya from ulting or fighting back.' },
      { id: 'ling', reason: 'Dives from walls with high burst before Miya reaches lifesteal range.' },
      { id: 'helcurt', reason: 'Silence and Dark Night Falls blinds Miya and disables basic attack flow.' },
    ],
    strongAgainst: ['barats', 'hylos', 'uranus', 'belerick'],
    counterItems: ['blade-armor', 'dominance-ice', 'wind-of-nature', 'antique-cuirass'],
  },
  layla: {
    counteredBy: [
      { id: 'saber', reason: 'Triple Sweep instant gap-close and airborne deletes Layla instantly.' },
      { id: 'fanny', reason: 'Wall cables reach Layla behind turret line and burst her down.' },
      { id: 'ling', reason: 'Wall mobility bypasses frontline tanks to assassinate Layla in backline.' },
      { id: 'hayabusa', reason: 'Shadow Kill dives Layla with zero chance of escape.' },
      { id: 'lancelot', reason: 'Puncture chains gap-close across minions to execute Layla.' },
    ],
    strongAgainst: ['barats', 'hylos', 'terizla', 'belerick'],
    counterItems: ['blade-armor', 'dominance-ice', 'wind-of-nature', 'antique-cuirass'],
  },
};

// Clean filter out dummy entries
if (SPECIFIC_MATCHUPS.eudora) {
  SPECIFIC_MATCHUPS.eudora.counteredBy = SPECIFIC_MATCHUPS.eudora.counteredBy.filter((c) => c.id !== 'athenas-shield');
}

// Archetype generator for all 133 heroes
function generateCountersForHero(hero: Hero): HeroCounters {
  // If specific hand-crafted matchup exists, use it
  if (SPECIFIC_MATCHUPS[hero.id]) {
    const sm = SPECIFIC_MATCHUPS[hero.id];
    return {
      counteredBy: sm.counteredBy,
      strongAgainst: sm.strongAgainst,
      counterItems: sm.counterItems,
    };
  }

  const counteredBy: CounterEntry[] = [];
  const strongAgainst: string[] = [];
  const counterItems: string[] = [];

  const seenCounterIds = new Set<string>([hero.id]);

  // Determine hero archetype
  const isTank = hero.role === 'Tank' || hero.tags.includes('regen_heavy');
  const isAssassin = hero.role === 'Assassin' || hero.tags.includes('heavy_dash');
  const isMarksman = hero.role === 'Marksman';
  const isMage = hero.role === 'Mage';
  const isFighter = hero.role === 'Fighter';
  const isSupport = hero.role === 'Support';

  // 1. Determine Counter Items
  if (hero.tags.includes('regen_heavy') || hero.role === 'Support' || hero.id === 'esmeralda' || hero.id === 'uranus' || hero.id === 'alice') {
    counterItems.push('dominance-ice', 'sea-halberd', 'glowing-wand');
  }
  if (isTank || hero.id === 'belerick' || hero.id === 'guerin') {
    counterItems.push('demon-hunter-sword', 'malefic-roar', 'divine-glaive');
  }
  if (isMarksman) {
    counterItems.push('blade-armor', 'dominance-ice', 'wind-of-nature');
  }
  if (isAssassin || (isFighter && hero.damageType === 'Physical')) {
    counterItems.push('antique-cuirass', 'wind-of-nature', 'winter-crown');
  }
  if (isMage || hero.damageType === 'Magic') {
    counterItems.push('athenas-shield', 'radiant-armor', 'winter-crown');
  }

  // Ensure 3-4 items max
  const uniqueItems = [...new Set(counterItems)].slice(0, 4);
  if (uniqueItems.length < 3) {
    uniqueItems.push('winter-crown', 'dominance-ice');
  }

  // 2. Select Diverse Counter Heroes
  if (isTank) {
    // Countered by tank busters
    const pool = [
      { id: 'karrie', reason: `Lightwheel Mark percentage true damage bypasses ${hero.name}'s high defense and HP.` },
      { id: 'claude', reason: `Agile Dexter basic attack kiting with Demon Hunter Sword melts ${hero.name}.` },
      { id: 'dyrroth', reason: `Spectre Step strips up to 75% of ${hero.name}'s physical defense in duel.` },
      { id: 'valir', reason: `Continuous knockback and fireball slows prevent ${hero.name} from engaging.` },
      { id: 'lunox', reason: `Chaos Assault percentage magic penetration melts ${hero.name} rapidly.` },
    ];
    pool.forEach((p) => {
      if (p.id !== hero.id && !seenCounterIds.has(p.id)) {
        counteredBy.push(p);
        seenCounterIds.add(p.id);
      }
    });

    // Strong against squishy assassins and divers
    ['saber', 'aamon', 'gusion', 'karina', 'zilong', 'miya'].forEach((id) => {
      if (id !== hero.id && !seenCounterIds.has(id)) strongAgainst.push(id);
    });
  } else if (isAssassin) {
    // Countered by suppression and anti-dash
    const pool = [
      { id: 'khufra', reason: `Bouncing Ball grounds and interrupts ${hero.name}'s dashes and dives.` },
      { id: 'kaja', reason: `Divine Judgement suppression disables ${hero.name} with zero counterplay.` },
      { id: 'franco', reason: `Bloody Hunt suppresses ${hero.name} point-blank to halt dive combos.` },
      { id: 'minsitthar', reason: `King's Calling creates a domain that forbids ${hero.name} from dashing.` },
      { id: 'ruby', reason: `Chained micro-stuns disrupt ${hero.name}'s combo rotations.` },
    ];
    pool.forEach((p) => {
      if (p.id !== hero.id && !seenCounterIds.has(p.id)) {
        counteredBy.push(p);
        seenCounterIds.add(p.id);
      }
    });

    // Strong against immobile marksmen and mages
    ['layla', 'miya', 'hanabi', 'gord', 'xavier', 'eudora'].forEach((id) => {
      if (id !== hero.id && !seenCounterIds.has(id)) strongAgainst.push(id);
    });
  } else if (isMarksman) {
    // Countered by backline divers and burst assassins
    const pool = [
      { id: 'saber', reason: `Triple Sweep airborne lock deletes ${hero.name} before basic attacks start.` },
      { id: 'hayabusa', reason: `Shadow Kill dives ${hero.name} with untargetable burst execution.` },
      { id: 'ling', reason: `Wall mobility allows Ling to jump frontline tanks and assassinate ${hero.name}.` },
      { id: 'fanny', reason: `High-speed cable rotations dive ${hero.name} under turret.` },
      { id: 'helcurt', reason: `Silence and darkness blind ${hero.name}, disabling counter-fire.` },
    ];
    pool.forEach((p) => {
      if (p.id !== hero.id && !seenCounterIds.has(p.id)) {
        counteredBy.push(p);
        seenCounterIds.add(p.id);
      }
    });

    // Strong against immobile tanks and brawlers
    ['balmond', 'terizla', 'uranus', 'belerick', 'hilda'].forEach((id) => {
      if (id !== hero.id && !seenCounterIds.has(id)) strongAgainst.push(id);
    });
  } else if (isMage) {
    // Countered by assassins and spell blockers
    const pool = [
      { id: 'lolita', reason: `Guardian's Bulwark blocks ${hero.name}'s projectile spells and skill shots.` },
      { id: 'lancelot', reason: `Thorned Rose invulnerability frames dodge ${hero.name}'s burst combos.` },
      { id: 'hayabusa', reason: `Shadow Kill dives past frontlines to burst ${hero.name} down.` },
      { id: 'saber', reason: `Instant Triple Sweep airborne locks ${hero.name} before spells cast.` },
      { id: 'chou', reason: `Shunpo immune dash and Way of Dragon kicks ${hero.name} out of position.` },
    ];
    pool.forEach((p) => {
      if (p.id !== hero.id && !seenCounterIds.has(p.id)) {
        counteredBy.push(p);
        seenCounterIds.add(p.id);
      }
    });

    // Strong against low-range squishies
    ['layla', 'miya', 'alucard', 'zilong', 'sun'].forEach((id) => {
      if (id !== hero.id && !seenCounterIds.has(id)) strongAgainst.push(id);
    });
  } else if (isSupport) {
    // Countered by anti-heal and AoE collapse
    const pool = [
      { id: 'baxia', reason: `Baxia Mark passive reduces ${hero.name}'s healing and shielding by 50%.` },
      { id: 'luo-yi', reason: `Yin-Yang geometric explosions punish ${hero.name}'s deathball team grouping.` },
      { id: 'karrie', reason: `Melts the frontline targets that ${hero.name} attempts to protect.` },
      { id: 'dyrroth', reason: `Armor shred and burst eliminates ${hero.name} before utility activates.` },
      { id: 'akai', reason: `Heavy Spin knocks ${hero.name} away and scatters paired teammates.` },
    ];
    pool.forEach((p) => {
      if (p.id !== hero.id && !seenCounterIds.has(p.id)) {
        counteredBy.push(p);
        seenCounterIds.add(p.id);
      }
    });

    // Strong against poke skirmishers
    ['balmond', 'uranus', 'hilda', 'jawhead'].forEach((id) => {
      if (id !== hero.id && !seenCounterIds.has(id)) strongAgainst.push(id);
    });
  } else {
    // Fighter
    const pool = [
      { id: 'valir', reason: `Continuous fireball knockbacks prevent ${hero.name} from closing into melee.` },
      { id: 'baxia', reason: `Innate anti-heal cuts ${hero.name}'s spell vamp and recovery in duels.` },
      { id: 'dyrroth', reason: `75% physical armor shred overpowers ${hero.name} in lane trades.` },
      { id: 'karrie', reason: `True damage melts ${hero.name} when building hybrid defensive items.` },
      { id: 'claude', reason: `Fast Dexter kiting out-ranges ${hero.name}'s melee capabilities.` },
    ];
    pool.forEach((p) => {
      if (p.id !== hero.id && !seenCounterIds.has(p.id)) {
        counteredBy.push(p);
        seenCounterIds.add(p.id);
      }
    });

    // Strong against squishy carries
    ['layla', 'miya', 'hanabi', 'gord', 'eudora'].forEach((id) => {
      if (id !== hero.id && !seenCounterIds.has(id)) strongAgainst.push(id);
    });
  }

  // Ensure strongAgainst does NOT overlap with counteredBy
  const filteredStrong = strongAgainst.filter((id) => !seenCounterIds.has(id)).slice(0, 5);

  return {
    counteredBy: counteredBy.slice(0, 5),
    strongAgainst: filteredStrong,
    counterItems: uniqueItems.slice(0, 4),
  };
}

async function main() {
  console.log(`Generating comprehensive counters for all ${heroes.length} heroes...`);

  const fullCounters: Record<string, HeroCounters> = {};

  for (const hero of heroes) {
    fullCounters[hero.id] = generateCountersForHero(hero);
  }

  fs.writeFileSync(COUNTERS_FILE, JSON.stringify(fullCounters, null, 2), 'utf-8');

  console.log(`Successfully saved ${Object.keys(fullCounters).length} hero counters to ${COUNTERS_FILE}`);

  // Test Barats
  console.log('\n--- Test: Barats Counters ---');
  console.log('Countered By:', fullCounters.barats.counteredBy.map((c) => c.id));
  console.log('Strong Against:', fullCounters.barats.strongAgainst);
  console.log('Counter Items:', fullCounters.barats.counterItems);

  // Test Fanny
  console.log('\n--- Test: Fanny Counters ---');
  console.log('Countered By:', fullCounters.fanny.counteredBy.map((c) => c.id));
  console.log('Strong Against:', fullCounters.fanny.strongAgainst);
  console.log('Counter Items:', fullCounters.fanny.counterItems);
}

main().catch(console.error);
