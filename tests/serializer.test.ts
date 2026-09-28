import { describe, it, expect } from 'vitest';
import {
  encodeDraftState,
  decodeDraftState,
  encodeCounterState,
  decodeCounterState,
  type SerializedDraft,
  type SerializedCounter,
} from '../src/engine/serializer';

describe('serializer', () => {
  it('encodes and decodes draft state faithfully', () => {
    const original: SerializedDraft = {
      s: 7,
      bb: ['hirara', 'marcel', null, null, null],
      bp: [null, null, null, null, null],
      rb: ['fanny', 'ling', null, null, null],
      rp: [null, null, null, null, null],
    };

    const encoded = encodeDraftState(original);
    expect(encoded).toBeTruthy();

    const decoded = decodeDraftState(encoded);
    expect(decoded).toEqual(original);
  });

  it('encodes and decodes counter state faithfully', () => {
    const original: SerializedCounter = {
      e: ['hirara', 'fanny', 'claude'],
      a: ['khufra', 'lolita'],
      l: 'Gold',
    };

    const encoded = encodeCounterState(original);
    expect(encoded).toBeTruthy();

    const decoded = decodeCounterState(encoded);
    expect(decoded).toEqual(original);
  });

  it('handles bad/corrupted query parameter safely without throwing', () => {
    expect(decodeDraftState('')).toBeNull();
    expect(decodeDraftState('invalid-gibberish-string')).toBeNull();
    expect(decodeDraftState('12345')).toBeNull();

    expect(decodeCounterState('')).toBeNull();
    expect(decodeCounterState('invalid-gibberish-string')).toBeNull();
  });
});
