import { create } from 'zustand';
import type { Hero } from '../types/hero';
import {
  createInitialDraftSession,
  applyDraftHero,
  undoDraftStep,
  DRAFT_ORDER,
  type DraftSession,
} from '../engine/draftMachine';
import type { SerializedDraft } from '../engine/serializer';

interface DraftStoreState extends DraftSession {
  selectHero: (hero: Hero) => void;
  undo: () => void;
  reset: () => void;
  loadFromSerialized: (serialized: SerializedDraft, allHeroes: Hero[]) => void;
  getSerialized: () => SerializedDraft;
}

export const useDraftStore = create<DraftStoreState>((set, get) => ({
  ...createInitialDraftSession(),

  selectHero: (hero: Hero) => {
    const current = get();
    const nextSession = applyDraftHero(
      {
        currentStepIndex: current.currentStepIndex,
        blue: current.blue,
        red: current.red,
        isComplete: current.isComplete,
      },
      hero
    );
    set(nextSession);
  },

  undo: () => {
    const current = get();
    const nextSession = undoDraftStep({
      currentStepIndex: current.currentStepIndex,
      blue: current.blue,
      red: current.red,
      isComplete: current.isComplete,
    });
    set(nextSession);
  },

  reset: () => {
    set(createInitialDraftSession());
  },

  loadFromSerialized: (serialized: SerializedDraft, allHeroes: Hero[]) => {
    const heroMap = new Map<string, Hero>(allHeroes.map((h) => [h.id, h]));

    const blueBans: (Hero | null)[] = serialized.bb.map((id) => (id ? heroMap.get(id) || null : null));
    const bluePicks: (Hero | null)[] = serialized.bp.map((id) => (id ? heroMap.get(id) || null : null));
    const redBans: (Hero | null)[] = serialized.rb.map((id) => (id ? heroMap.get(id) || null : null));
    const redPicks: (Hero | null)[] = serialized.rp.map((id) => (id ? heroMap.get(id) || null : null));

    const stepIndex = Math.min(DRAFT_ORDER.length, Math.max(0, serialized.s));

    set({
      currentStepIndex: stepIndex,
      blue: {
        bans: blueBans.length === 5 ? blueBans : [null, null, null, null, null],
        picks: bluePicks.length === 5 ? bluePicks : [null, null, null, null, null],
      },
      red: {
        bans: redBans.length === 5 ? redBans : [null, null, null, null, null],
        picks: redPicks.length === 5 ? redPicks : [null, null, null, null, null],
      },
      isComplete: stepIndex >= DRAFT_ORDER.length,
    });
  },

  getSerialized: (): SerializedDraft => {
    const state = get();
    return {
      s: state.currentStepIndex,
      bb: state.blue.bans.map((h) => h?.id || null),
      bp: state.blue.picks.map((h) => h?.id || null),
      rb: state.red.bans.map((h) => h?.id || null),
      rp: state.red.picks.map((h) => h?.id || null),
    };
  },
}));
