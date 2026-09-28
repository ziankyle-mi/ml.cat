import LZString from 'lz-string';
import type { Lane } from '../types/hero';

export interface SerializedDraft {
  s: number; // step index
  bb: (string | null)[]; // blue bans
  bp: (string | null)[]; // blue picks
  rb: (string | null)[]; // red bans
  rp: (string | null)[]; // red picks
}

export interface SerializedCounter {
  e: string[]; // enemy pick hero IDs
  a?: string[]; // ally pick hero IDs
  l?: Lane | null; // lane filter
}

export function encodeDraftState(draft: SerializedDraft): string {
  try {
    const json = JSON.stringify(draft);
    return LZString.compressToEncodedURIComponent(json);
  } catch {
    return '';
  }
}

export function decodeDraftState(queryParam: string): SerializedDraft | null {
  if (!queryParam) return null;
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(queryParam);
    if (!decompressed) return null;
    const parsed: unknown = JSON.parse(decompressed);

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      's' in parsed &&
      'bb' in parsed &&
      'bp' in parsed &&
      'rb' in parsed &&
      'rp' in parsed
    ) {
      const d = parsed as SerializedDraft;
      if (
        typeof d.s === 'number' &&
        Array.isArray(d.bb) &&
        Array.isArray(d.bp) &&
        Array.isArray(d.rb) &&
        Array.isArray(d.rp)
      ) {
        return d;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function encodeCounterState(counter: SerializedCounter): string {
  try {
    const json = JSON.stringify(counter);
    return LZString.compressToEncodedURIComponent(json);
  } catch {
    return '';
  }
}

export function decodeCounterState(queryParam: string): SerializedCounter | null {
  if (!queryParam) return null;
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(queryParam);
    if (!decompressed) return null;
    const parsed: unknown = JSON.parse(decompressed);

    if (typeof parsed === 'object' && parsed !== null && 'e' in parsed) {
      const c = parsed as SerializedCounter;
      if (Array.isArray(c.e)) {
        return c;
      }
    }
    return null;
  } catch {
    return null;
  }
}
