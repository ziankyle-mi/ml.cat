import type { Hero } from '../types/hero';
import type { DraftStep, TeamDraft } from '../types/draft';

export const DRAFT_ORDER: DraftStep[] = [
  { stepNumber: 1, phase: 'BAN_PHASE_1', side: 'BLUE', type: 'BAN', slotIndex: 0 },
  { stepNumber: 2, phase: 'BAN_PHASE_1', side: 'RED', type: 'BAN', slotIndex: 0 },
  { stepNumber: 3, phase: 'BAN_PHASE_1', side: 'BLUE', type: 'BAN', slotIndex: 1 },
  { stepNumber: 4, phase: 'BAN_PHASE_1', side: 'RED', type: 'BAN', slotIndex: 1 },
  { stepNumber: 5, phase: 'BAN_PHASE_1', side: 'BLUE', type: 'BAN', slotIndex: 2 },
  { stepNumber: 6, phase: 'BAN_PHASE_1', side: 'RED', type: 'BAN', slotIndex: 2 },
  { stepNumber: 7, phase: 'PICK_PHASE_1', side: 'BLUE', type: 'PICK', slotIndex: 0 },
  { stepNumber: 8, phase: 'PICK_PHASE_1', side: 'RED', type: 'PICK', slotIndex: 0 },
  { stepNumber: 9, phase: 'PICK_PHASE_1', side: 'RED', type: 'PICK', slotIndex: 1 },
  { stepNumber: 10, phase: 'PICK_PHASE_1', side: 'BLUE', type: 'PICK', slotIndex: 1 },
  { stepNumber: 11, phase: 'PICK_PHASE_1', side: 'BLUE', type: 'PICK', slotIndex: 2 },
  { stepNumber: 12, phase: 'PICK_PHASE_1', side: 'RED', type: 'PICK', slotIndex: 2 },
  { stepNumber: 13, phase: 'BAN_PHASE_2', side: 'RED', type: 'BAN', slotIndex: 3 },
  { stepNumber: 14, phase: 'BAN_PHASE_2', side: 'BLUE', type: 'BAN', slotIndex: 3 },
  { stepNumber: 15, phase: 'BAN_PHASE_2', side: 'RED', type: 'BAN', slotIndex: 4 },
  { stepNumber: 16, phase: 'BAN_PHASE_2', side: 'BLUE', type: 'BAN', slotIndex: 4 },
  { stepNumber: 17, phase: 'PICK_PHASE_2', side: 'RED', type: 'PICK', slotIndex: 3 },
  { stepNumber: 18, phase: 'PICK_PHASE_2', side: 'BLUE', type: 'PICK', slotIndex: 3 },
  { stepNumber: 19, phase: 'PICK_PHASE_2', side: 'BLUE', type: 'PICK', slotIndex: 4 },
  { stepNumber: 20, phase: 'PICK_PHASE_2', side: 'RED', type: 'PICK', slotIndex: 4 },
];

export interface DraftSession {
  currentStepIndex: number; // 0 to 20
  blue: TeamDraft;
  red: TeamDraft;
  isComplete: boolean;
}

export function createInitialDraftSession(): DraftSession {
  return {
    currentStepIndex: 0,
    blue: {
      bans: [null, null, null, null, null],
      picks: [null, null, null, null, null],
    },
    red: {
      bans: [null, null, null, null, null],
      picks: [null, null, null, null, null],
    },
    isComplete: false,
  };
}

export function isHeroUnavailable(
  heroId: string,
  session: DraftSession
): boolean {
  const checkTeam = (team: TeamDraft) => {
    return (
      team.bans.some((h) => h?.id === heroId) ||
      team.picks.some((h) => h?.id === heroId)
    );
  };
  return checkTeam(session.blue) || checkTeam(session.red);
}

export function getCurrentStep(session: DraftSession): DraftStep | null {
  if (session.currentStepIndex >= DRAFT_ORDER.length) {
    return null;
  }
  return DRAFT_ORDER[session.currentStepIndex];
}

export function applyDraftHero(
  session: DraftSession,
  hero: Hero
): DraftSession {
  if (session.currentStepIndex >= DRAFT_ORDER.length || session.isComplete) {
    return session;
  }

  if (isHeroUnavailable(hero.id, session)) {
    return session; // Hero already banned or picked
  }

  const step = DRAFT_ORDER[session.currentStepIndex];

  const newBlue: TeamDraft = {
    bans: [...session.blue.bans],
    picks: [...session.blue.picks],
  };
  const newRed: TeamDraft = {
    bans: [...session.red.bans],
    picks: [...session.red.picks],
  };

  const targetTeam = step.side === 'BLUE' ? newBlue : newRed;
  if (step.type === 'BAN') {
    targetTeam.bans[step.slotIndex] = hero;
  } else {
    targetTeam.picks[step.slotIndex] = hero;
  }

  const nextStepIndex = session.currentStepIndex + 1;
  const isComplete = nextStepIndex >= DRAFT_ORDER.length;

  return {
    currentStepIndex: nextStepIndex,
    blue: newBlue,
    red: newRed,
    isComplete,
  };
}

export function undoDraftStep(session: DraftSession): DraftSession {
  if (session.currentStepIndex <= 0) {
    return session;
  }

  const prevStepIndex = session.currentStepIndex - 1;
  const stepToUndo = DRAFT_ORDER[prevStepIndex];

  const newBlue: TeamDraft = {
    bans: [...session.blue.bans],
    picks: [...session.blue.picks],
  };
  const newRed: TeamDraft = {
    bans: [...session.red.bans],
    picks: [...session.red.picks],
  };

  const targetTeam = stepToUndo.side === 'BLUE' ? newBlue : newRed;
  if (stepToUndo.type === 'BAN') {
    targetTeam.bans[stepToUndo.slotIndex] = null;
  } else {
    targetTeam.picks[stepToUndo.slotIndex] = null;
  }

  return {
    currentStepIndex: prevStepIndex,
    blue: newBlue,
    red: newRed,
    isComplete: false,
  };
}
