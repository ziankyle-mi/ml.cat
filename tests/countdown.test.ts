import { describe, it, expect } from 'vitest';
import { formatCountdown, getTimeRemaining, formatTimeAgo } from '../src/engine/countdown';

describe('countdown', () => {
  it('formats remaining hours and minutes correctly', () => {
    const now = new Date('2026-09-28T12:00:00Z');
    const target = new Date('2026-09-28T14:15:00Z');

    const formatted = formatCountdown(target, now);
    expect(formatted).toBe('2h 15m');
  });

  it('formats minutes and seconds when under 1 hour', () => {
    const now = new Date('2026-09-28T12:00:00Z');
    const target = new Date('2026-09-28T12:20:45Z');

    const formatted = formatCountdown(target, now);
    expect(formatted).toBe('20m 45s');
  });

  it('handles past target date gracefully', () => {
    const now = new Date('2026-09-28T12:00:00Z');
    const target = new Date('2026-09-28T11:00:00Z');

    const remaining = getTimeRemaining(target, now);
    expect(remaining.isPast).toBe(true);

    const formatted = formatCountdown(target, now);
    expect(formatted).toBe('updating soon');
  });

  it('formats time ago correctly', () => {
    const now = new Date('2026-09-28T15:00:00Z');
    const past = new Date('2026-09-28T12:00:00Z');

    expect(formatTimeAgo(past, now)).toBe('3h ago');
  });
});
