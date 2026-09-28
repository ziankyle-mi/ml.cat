export type ArchetypeTag =
  | 'heavy_dash'
  | 'projectile_reliant'
  | 'regen_heavy'
  | 'dive'
  | 'burst'
  | 'hard_cc'
  | 'suppress'
  | 'anti_dash'
  | 'projectile_block'
  | 'anti_heal'
  | 'kiting';

export type HeroRole = 'Tank' | 'Fighter' | 'Assassin' | 'Mage' | 'Marksman' | 'Support';
export type Lane = 'EXP' | 'Mid' | 'Roam' | 'Jungle' | 'Gold';
export type DamageType = 'Physical' | 'Magic' | 'True' | 'Hybrid';

export interface Hero {
  id: string;
  name: string;
  role: HeroRole;
  primaryLane: Lane;
  secondaryLane?: Lane;
  damageType: DamageType;
  tags: ArchetypeTag[];
  counterTags: ArchetypeTag[];
  icon: string;
  sourceUrl?: string;
}

export interface CounterEntry {
  id: string;
  reason: string;
}

export interface HeroCounters {
  counteredBy: CounterEntry[];
  strongAgainst: string[];
  counterItems?: string[];
}
