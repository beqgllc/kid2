import { create } from 'zustand';
import type { PlayerSong, RepeatMode } from '../types/models';

interface PlayerState {
  currentSong: PlayerSong | null;
  queue: PlayerSong[];
  currentIndex: number;
  isPlaying: boolean;
  status: 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'ended' | 'error';
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  muted: boolean;
  repeatMode: RepeatMode;
  shuffle: boolean;
  error: string | null;
  set: (patch: Partial<Omit<PlayerState, 'set' | 'reset'>>) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentSong: null,
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  status: 'idle',
  currentTime: 0,
  duration: 0,
  buffered: 0,
  volume: 0.85,
  muted: false,
  repeatMode: 'none',
  shuffle: false,
  error: null,
  set: (patch) => set(patch),
  reset: () => set({ currentSong: null, queue: [], currentIndex: -1, isPlaying: false, status: 'idle', currentTime: 0, duration: 0, buffered: 0, error: null }),
}));
