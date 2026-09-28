export type TierId = 'SS' | 'S' | 'A' | 'B' | 'C' | 'D';

export type MetaSourceMode = 'consensus' | 'ranked' | 'tournament' | 'analyst';

export interface MetaSourceBreakdown {
  ranked: {
    winRate: number; // e.g. 0.548
    pickRate: number; // e.g. 0.038
    banRate: number; // e.g. 0.685
    score: number;
    tier: TierId;
  };
  tournament: {
    contestRate: number; // e.g. 0.88 (P/B in MPL / MSC)
    winRate: number; // e.g. 0.56
    score: number;
    tier: TierId;
  };
  analyst: {
    rating: number; // 0 - 100
    tier: TierId;
    verdict: string;
  };
  compositeScore: number;
  mlbbGgPoints?: number;
  movement?: 'same' | 'up' | 'down';
}

export interface TierRowData {
  id: TierId;
  color: string;
  heroIds: string[];
}

export interface TierSnapshot {
  updatedAt: string;
  nextUpdateAt: string;
  activeSourceMode?: MetaSourceMode;
  rows: TierRowData[];
  heroMetaMap?: Record<string, MetaSourceBreakdown>;
}

export interface HeroStats {
  heroId: string;
  // Source 1: Mythic+ Ranked Match Telemetry (from MLBB.GG)
  winRate: number;
  pickRate: number;
  banRate: number;

  // MLBB.GG Official Tier & Points
  tier?: TierId;
  points?: number;
  movement?: 'same' | 'up' | 'down';

  // Source 2: Competitive Tournament Meta (MPL / M-Series / MSC)
  tourneyContestRate?: number; // P/B presence
  tourneyWinRate?: number;

  // Source 3: Pro Coach / Analyst Tier Rating (0 - 100)
  analystRating?: number;
  analystVerdict?: string;
}

