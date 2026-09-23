import type { RepeatMode } from '../types/models';

export function getNextQueueIndex(
  queueLength: number,
  currentIndex: number,
  repeatMode: RepeatMode,
  shuffle: boolean,
  random = Math.random,
) {
  if (queueLength <= 0) return -1;

  if (shuffle && queueLength > 1) {
    const candidates = Array.from({ length: queueLength }, (_, index) => index)
      .filter((index) => index !== currentIndex);
    const choice = Math.floor(Math.max(0, Math.min(0.999999, random())) * candidates.length);
    return candidates[choice] ?? -1;
  }

  const nextIndex = currentIndex + 1;
  if (nextIndex < queueLength) return nextIndex;
  return repeatMode === 'queue' ? 0 : -1;
}
