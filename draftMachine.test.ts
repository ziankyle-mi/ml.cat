import { describe, it, expect } from 'vitest';
import {
  createInitialDraftSession,
  applyDraftHero,
  undoDraftStep,
  isHeroUnavailable,
  DRAFT_ORDER,
} from '../src/engine/draftMachine';
import type { Hero } from '../src/types/hero';

const dummyHero = (id: string, name: string): Hero => ({
  id,
  name,
  role: 'Fighter',
  primaryLane: 'EXP',
  damageType: 'Physical',
  tags: ['heavy_dash'],
  counterTags: ['anti_dash'],
  icon: `/heroes/${id}.webp`,
});

describe('draftMachine', () => {
  it('initializes with 0 steps and empty teams', () => {
    const session = createInitialDraftSession();
    expect(session.currentStepIndex).toBe(0);
    expect(session.blue.bans.every((b) => b === null)).toBe(true);
    expect(session.red.picks.every((p) => p === null)).toBe(true);
    expect(session.isComplete).toBe(false);
  });

  it('progresses through ban and pick phases following DRAFT_ORDER', () => {
    let session = createInitialDraftSession();
    const hero1 = dummyHero('hero1', 'Hero 1');
    const hero2 = dummyHero('hero2', 'Hero 2');

    // Step 1: BLUE BAN slot 0
    session = applyDraftHero(session, hero1);
    expect(session.currentStepIndex).toBe(1);
    expect(session.blue.bans[0]?.id).toBe('hero1');
    expect(isHeroUnavailable('hero1', session)).toBe(true);

    // Step 2: RED BAN slot 0
    session = applyDraftHero(session, hero2);
    expect(session.currentStepIndex).toBe(2);
    expect(session.red.bans[0]?.id).toBe('hero2');
  });

  it('prevents selecting a hero that is already picked or banned', () => {
    let session = createInitialDraftSession();
    const hero1 = dummyHero('hero1', 'Hero 1');

    session = applyDraftHero(session, hero1);
    expect(session.currentStepIndex).toBe(1);

    // Try selecting hero1 again
    const sameSession = applyDraftHero(session, hero1);
    expect(sameSession.currentStepIndex).toBe(1);
  });

  it('handles undo correctly at step 1 and step 0 (edge cases)', () => {
    let session = createInitialDraftSession();
    // Undo at step 0
    const undoAtZero = undoDraftStep(session);
    expect(undoAtZero.currentStepIndex).toBe(0);

    // Apply 1 hero
    const hero1 = dummyHero('hero1', 'Hero 1');
    session = applyDraftHero(session, hero1);
    expect(session.currentStepIndex).toBe(1);
    expect(session.blue.bans[0]).not.toBeNull();

    // Undo at step 1
    session = undoDraftStep(session);
    expect(session.currentStepIndex).toBe(0);
    expect(session.blue.bans[0]).toBeNull();
    expect(isHeroUnavailable('hero1', session)).toBe(false);
  });

  it('completes after exactly 20 steps', () => {
    let session = createInitialDraftSession();
    for (let i = 0; i < 20; i++) {
      const h = dummyHero(`h-${i}`, `Hero ${i}`);
      session = applyDraftHero(session, h);
    }
    expect(session.currentStepIndex).toBe(20);
    expect(session.isComplete).toBe(true);

    // Attempting further picks should do nothing
    const extra = dummyHero('h-extra', 'Extra');
    const after = applyDraftHero(session, extra);
    expect(after.currentStepIndex).toBe(20);
  });
});
