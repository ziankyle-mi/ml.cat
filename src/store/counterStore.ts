import { create } from 'zustand';
import type { Hero, Lane } from '../types/hero';
import type { SerializedCounter } from '../engine/serializer';

interface CounterStoreState {
  enemyPicks: Hero[];
  allyPicks: Hero[];
  bannedHeroes: Hero[];
  laneFilter: Lane | null;

  toggleEnemy: (hero: Hero) => void;
  toggleAlly: (hero: Hero) => void;
  removeEnemy: (heroId: string) => void;
  removeAlly: (heroId: string) => void;
  setLaneFilter: (lane: Lane | null) => void;
  reset: () => void;
  loadFromSerialized: (serialized: SerializedCounter, allHeroes: Hero[]) => void;
  getSerialized: () => SerializedCounter;
}

export const useCounterStore = create<CounterStoreState>((set, get) => ({
  enemyPicks: [],
  allyPicks: [],
  bannedHeroes: [],
  laneFilter: null,

  toggleEnemy: (hero: Hero) => {
    const { enemyPicks, allyPicks } = get();
    if (enemyPicks.some((h) => h.id === hero.id)) {
      set({ enemyPicks: enemyPicks.filter((h) => h.id !== hero.id) });
      return;
    }
    if (allyPicks.some((h) => h.id === hero.id)) {
      return; // Already an ally pick
    }
    if (enemyPicks.length >= 5) {
      return;
    }
    set({ enemyPicks: [...enemyPicks, hero] });
  },

  toggleAlly: (hero: Hero) => {
    const { allyPicks, enemyPicks } = get();
    if (allyPicks.some((h) => h.id === hero.id)) {
      set({ allyPicks: allyPicks.filter((h) => h.id !== hero.id) });
      return;
    }
    if (enemyPicks.some((h) => h.id === hero.id)) {
      return; // Already an enemy pick
    }
    if (allyPicks.length >= 5) {
      return;
    }
    set({ allyPicks: [...allyPicks, hero] });
  },

  removeEnemy: (heroId: string) => {
    set({ enemyPicks: get().enemyPicks.filter((h) => h.id !== heroId) });
  },

  removeAlly: (heroId: string) => {
    set({ allyPicks: get().allyPicks.filter((h) => h.id !== heroId) });
  },

  setLaneFilter: (lane: Lane | null) => {
    set({ laneFilter: lane });
  },

  reset: () => {
    set({
      enemyPicks: [],
      allyPicks: [],
      bannedHeroes: [],
      laneFilter: null,
    });
  },

  loadFromSerialized: (serialized: SerializedCounter, allHeroes: Hero[]) => {
    const heroMap = new Map<string, Hero>(allHeroes.map((h) => [h.id, h]));
    const enemies = (serialized.e || [])
      .map((id) => heroMap.get(id))
      .filter((h): h is Hero => !!h)
      .slice(0, 5);

    const allies = (serialized.a || [])
      .map((id) => heroMap.get(id))
      .filter((h): h is Hero => !!h)
      .slice(0, 5);

    set({
      enemyPicks: enemies,
      allyPicks: allies,
      laneFilter: serialized.l || null,
    });
  },

  getSerialized: (): SerializedCounter => {
    const state = get();
    return {
      e: state.enemyPicks.map((h) => h.id),
      a: state.allyPicks.length > 0 ? state.allyPicks.map((h) => h.id) : undefined,
      l: state.laneFilter,
    };
  },
}));
