import type { Hero } from './hero';

export type DraftPhase = 'BAN_PHASE_1' | 'PICK_PHASE_1' | 'BAN_PHASE_2' | 'PICK_PHASE_2' | 'COMPLETED';
export type Side = 'BLUE' | 'RED';
export type ActionType = 'BAN' | 'PICK';

export interface DraftStep {
  stepNumber: number;
  phase: DraftPhase;
  side: Side;
  type: ActionType;
  slotIndex: number;
}

export interface TeamDraft {
  bans: (Hero | null)[];
  picks: (Hero | null)[];
}
