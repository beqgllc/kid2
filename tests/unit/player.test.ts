import { describe, expect, it } from 'vitest';
import { getNextQueueIndex } from '../../src/lib/player';

describe('getNextQueueIndex', () => {
  it('advances through a normal queue', () => {
    expect(getNextQueueIndex(4, 1, 'none', false)).toBe(2);
    expect(getNextQueueIndex(4, 3, 'none', false)).toBe(-1);
  });

  it('wraps a queue when repeat queue is enabled', () => {
    expect(getNextQueueIndex(4, 3, 'queue', false)).toBe(0);
  });

  it('never selects the current track during shuffle', () => {
    expect(getNextQueueIndex(4, 2, 'none', true, () => 0)).toBe(0);
    expect(getNextQueueIndex(4, 2, 'none', true, () => 0.99)).toBe(3);
  });

  it('returns no next track for an empty queue', () => {
    expect(getNextQueueIndex(0, -1, 'none', false)).toBe(-1);
  });
});
