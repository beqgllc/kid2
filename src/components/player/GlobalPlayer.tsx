import { useEffect, useMemo, useRef, type ChangeEvent } from 'react';
import { usePlayerStore } from '../../stores/playerStore';
import { formatDuration } from '../../lib/utils';
import { recordPlay } from '../../services/analytics';
import type { PlayerSong } from '../../types/models';
import './player.css';

export function GlobalPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const counted = useRef(false);
  const sessionId = useRef(crypto.randomUUID());
  const { currentSong, queue, currentIndex, isPlaying, status, currentTime, duration, volume, muted, repeatMode, shuffle, error, set } = usePlayerStore();

  useEffect(() => { if (audioRef.current) { audioRef.current.volume = volume; audioRef.current.muted = muted; } }, [volume, muted]);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    audio.src = currentSong.audio_url;
    audio.load(); counted.current = false;
    set({ status: 'loading', currentTime: 0 });
  }, [currentSong?.id, set]);
  useEffect(() => { if (!currentSong) return; if (isPlaying && audioRef.current?.paused) audioRef.current.play().catch(() => set({ isPlaying: false, error: 'Playback was blocked. Press play to start.' })); }, [isPlaying, currentSong, set]);
  const onTime = () => {
    const audio = audioRef.current; if (!audio || !currentSong) return;
    set({ currentTime: audio.currentTime, duration: Number.isFinite(audio.duration) ? audio.duration : 0 });
    const threshold = Math.min(8, Math.max(3, (audio.duration || 30) * 0.08));
    if (!counted.current && audio.currentTime >= threshold) { counted.current = true; recordPlay(currentSong.id, sessionId.current).catch(() => undefined); }
  };
  const nextIndex = useMemo(() => {
    if (!queue.length) return -1;
    if (shuffle && queue.length > 1) { const candidates = queue.map((_, i) => i).filter((i) => i !== currentIndex); return candidates[Math.floor(Math.random() * candidates.length)] ?? currentIndex; }
    return currentIndex + 1;
  }, [queue, currentIndex, shuffle]);
  const playSong = async (song: PlayerSong, idx: number, queueOverride?: PlayerSong[]) => {
    const audio = audioRef.current; if (!audio) return;
    const same = currentSong?.id === song.id;
    if (!same) { set({ currentSong: song, queue: queueOverride ?? [song], currentIndex: idx, status: 'loading', error: null }); return; }
    await audio.play().then(() => set({ isPlaying: true, status: 'playing' })).catch(() => set({ error: 'Playback was blocked. Press play again.' }));
  };
  const toggle = async () => { const audio = audioRef.current; if (!audio || !currentSong) return; if (audio.paused) await audio.play().then(() => set({ isPlaying: true, status: 'playing', error: null })).catch(() => set({ error: 'Playback was blocked.' })); else audio.pause(); };
  const next = () => { if (!queue.length) return; const idx = nextIndex >= queue.length ? (repeatMode === 'queue' ? 0 : -1) : nextIndex; if (idx >= 0) playSong(queue[idx], idx, queue); };
  const previous = () => { const audio = audioRef.current; if (!queue.length) return; if (audio && audio.currentTime > 4) { audio.currentTime = 0; return; } const idx = Math.max(0, currentIndex - 1); playSong(queue[idx], idx, queue); };
  const onEnded = () => { if (repeatMode === 'track') { const audio = audioRef.current; if (audio) { audio.currentTime = 0; void audio.play(); } return; } const idx = nextIndex >= queue.length ? (repeatMode === 'queue' ? 0 : -1) : nextIndex; if (idx >= 0) playSong(queue[idx], idx, queue); else set({ isPlaying: false, status: 'ended' }); };
  const seek = (e: ChangeEvent<HTMLInputElement>) => { const audio = audioRef.current; if (!audio) return; const value = Number(e.target.value); audio.currentTime = value; set({ currentTime: value }); };
  const setVol = (e: ChangeEvent<HTMLInputElement>) => set({ volume: Number(e.target.value), muted: false });
  const repeat = () => set({ repeatMode: repeatMode === 'none' ? 'queue' : repeatMode === 'queue' ? 'track' : 'none' });
  return <>
    <audio ref={audioRef} data-attikid-player="true" preload="metadata" onLoadedMetadata={(e) => set({ duration: e.currentTarget.duration, status: 'ready' })} onTimeUpdate={onTime} onPlay={() => set({ isPlaying: true, status: 'playing' })} onPause={() => set({ isPlaying: false, status: 'paused' })} onEnded={onEnded} onError={() => set({ isPlaying: false, status: 'error', error: 'Unable to play this track.' })} />
    <section className="global-player" aria-label="Music player">
      <div className="player-track">
        <div className="player-art">{currentSong?.artwork_url ? <img src={currentSong.artwork_url} alt="" /> : <span>AK</span>}</div>
        <div className="player-meta"><strong>{currentSong?.title ?? 'Select a track'}</strong><span>{currentSong?.artist_name ?? 'ATTIKID'}</span></div>
      </div>
      <div className="player-main">
        <div className="player-controls"><button onClick={previous} disabled={!currentSong} aria-label="Previous track">◀</button><button className="play-button" onClick={() => void toggle()} disabled={!currentSong} aria-label={isPlaying ? 'Pause' : 'Play'}>{isPlaying ? '❚❚' : '▶'}</button><button onClick={next} disabled={!currentSong} aria-label="Next track">▶</button></div>
        <div className="player-progress"><span>{formatDuration(currentTime)}</span><input type="range" min="0" max={duration || 0} step="0.1" value={Math.min(currentTime, duration || 0)} onChange={seek} aria-label="Seek" /><span>{formatDuration(duration)}</span></div>
      </div>
      <div className="player-options"><button onClick={repeat} aria-label="Repeat mode">↻{repeatMode === 'track' ? '1' : ''}</button><button onClick={() => set({ shuffle: !shuffle })} aria-label="Shuffle" className={shuffle ? 'active-control' : ''}>⤨</button><button onClick={() => set({ muted: !muted })} aria-label={muted ? 'Unmute' : 'Mute'}>{muted ? '🔇' : '🔊'}</button><input type="range" min="0" max="1" step="0.01" value={muted ? 0 : volume} onChange={setVol} aria-label="Volume" /></div>
      {error && <div className="player-error" role="status">{error}</div>}
    </section>
  </>;
}
