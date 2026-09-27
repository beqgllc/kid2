import { useEffect, useRef, type ChangeEvent, type SyntheticEvent } from 'react';
import { usePlayerStore } from '../../stores/playerStore';
import { formatDuration } from '../../lib/utils';
import { getNextQueueIndex } from '../../lib/player';
import { recordPlay } from '../../services/analytics';
import type { PlayerSong } from '../../types/models';
import './player.css';

function createSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function playbackErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === 'AbortError') return null;
  if (error instanceof DOMException && error.name === 'NotAllowedError') {
    return 'Playback was blocked. Press play again.';
  }
  return 'Playback could not start. Try again.';
}

export function GlobalPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const counted = useRef(false);
  const sessionId = useRef(createSessionId());
  const switchingSource = useRef(false);
  const fallbackTried = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const meterFrameRef = useRef<number | null>(null);
  const meterBarsRef = useRef<Array<HTMLSpanElement | null>>([]);
  const { currentSong, queue, currentIndex, isPlaying, currentTime, duration, volume, muted, repeatMode, shuffle, error, status, set } = usePlayerStore();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.crossOrigin = 'anonymous';

    return () => {
      if (meterFrameRef.current !== null) cancelAnimationFrame(meterFrameRef.current);
      meterFrameRef.current = null;
      sourceNodeRef.current?.disconnect();
      analyserRef.current?.disconnect();
      sourceNodeRef.current = null;
      analyserRef.current = null;
      if (audioContextRef.current) {
        void audioContextRef.current.close().catch(() => undefined);
        audioContextRef.current = null;
      }
    };
  }, []);

  const startMeter = () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (!audioContextRef.current) {
        const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextCtor) return;

        const context = new AudioContextCtor();
        const analyser = context.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.72;

        const source = context.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(context.destination);

        audioContextRef.current = context;
        analyserRef.current = analyser;
        sourceNodeRef.current = source;
      }

      const context = audioContextRef.current;
      const analyser = analyserRef.current;
      if (!context || !analyser) return;

      void context.resume().catch(() => undefined);

      if (meterFrameRef.current !== null) cancelAnimationFrame(meterFrameRef.current);

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const bars = meterBarsRef.current;
        const count = bars.length;
        for (let index = 0; index < count; index += 1) {
          const start = Math.floor((index / count) * data.length);
          const end = Math.max(start + 1, Math.floor(((index + 1) / count) * data.length));
          let sum = 0;
          for (let i = start; i < end; i += 1) sum += data[i];
          const normalized = Math.min(1, (sum / (end - start)) / 255);
          const floor = 0.08 + (index % 3) * 0.025;
          const level = Math.min(1, floor + normalized * 0.92);
          bars[index]?.style.setProperty('--meter-level', level.toFixed(3));
        }
        meterFrameRef.current = requestAnimationFrame(tick);
      };

      tick();
    } catch {
      // A browser may block Web Audio analysis for a cross-origin source.
      // Playback remains functional; the meter simply stays idle.
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentSong) {
      switchingSource.current = false;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      counted.current = false;
      set({ status: 'idle', currentTime: 0, duration: 0, buffered: 0, error: null });
      return;
    }

    if (audio.src !== currentSong.audio_url) {
      switchingSource.current = true;
      audio.src = currentSong.audio_url;
      audio.load();
    }

    counted.current = false;
    fallbackTried.current = false;
    set({ status: 'loading', currentTime: 0, duration: 0, buffered: 0, error: null });
  }, [currentSong, set]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      startMeter();
      void audio.play().catch((playbackError) => {
        const message = playbackErrorMessage(playbackError);
        if (message) set({ isPlaying: false, status: 'error', error: message });
      });
      return;
    }

    if (!audio.paused) audio.pause();
  }, [currentSong, isPlaying, set]);

  const onTime = () => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
    set({
      currentTime: audio.currentTime,
      duration: nextDuration,
    });

    const threshold = Math.min(8, Math.max(3, nextDuration > 0 ? nextDuration * 0.08 : 30));
    if (!counted.current && audio.currentTime >= threshold) {
      counted.current = true;
      recordPlay(currentSong.id, sessionId.current).catch(() => undefined);
    }
  };

  const onProgress = () => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0 || !audio.buffered.length) return;
    const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
    set({ buffered: Math.min(1, bufferedEnd / audio.duration) });
  };

  const handlePlaybackFailure = (playbackError: unknown) => {
    const message = playbackErrorMessage(playbackError);
    if (message) set({ isPlaying: false, status: 'error', error: message });
  };

  const selectSong = (song: PlayerSong, index: number, queueOverride = queue) => {
    set({
      currentSong: song,
      queue: queueOverride.length ? queueOverride : [song],
      currentIndex: index,
      isPlaying: true,
      status: 'loading',
      currentTime: 0,
      duration: 0,
      buffered: 0,
      error: null,
    });
  };

  const next = () => {
    const index = getNextQueueIndex(queue.length, currentIndex, repeatMode, shuffle);
    if (index >= 0) {
      selectSong(queue[index], index, queue);
      return;
    }
    set({ isPlaying: false, status: 'ended' });
  };

  const previous = () => {
    const audio = audioRef.current;
    if (!queue.length) return;

    if (audio && audio.currentTime > 4) {
      audio.currentTime = 0;
      set({ currentTime: 0 });
      return;
    }

    const index = Math.max(0, currentIndex - 1);
    selectSong(queue[index], index, queue);
  };

  const onEnded = () => {
    if (repeatMode === 'track') {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = 0;
      set({ currentTime: 0, status: 'loading', isPlaying: true, error: null });
      void audio.play().catch(handlePlaybackFailure);
      return;
    }

    const index = getNextQueueIndex(queue.length, currentIndex, repeatMode, shuffle);
    if (index >= 0) {
      selectSong(queue[index], index, queue);
      return;
    }

    set({ isPlaying: false, status: 'ended', currentTime: duration });
  };

  const seek = (event: ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const value = Number(event.target.value);
    audio.currentTime = value;
    set({ currentTime: value, error: null });
  };

  const setVol = (event: ChangeEvent<HTMLInputElement>) => {
    set({ volume: Number(event.target.value), muted: false });
  };

  const toggleRepeat = () => {
    set({
      repeatMode: repeatMode === 'none'
        ? 'queue'
        : repeatMode === 'queue'
          ? 'track'
          : 'none',
    });
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (audio.paused) {
      set({ isPlaying: true, status: 'loading', error: null });
      void audio.play().catch(handlePlaybackFailure);
      return;
    }

    audio.pause();
  };

  const mediaError = (event: SyntheticEvent<HTMLAudioElement>) => {
    switchingSource.current = false;
    if (currentSong?.audio_fallback_url && !fallbackTried.current) {
      fallbackTried.current = true;
      switchingSource.current = true;
      event.currentTarget.src = currentSong.audio_fallback_url;
      event.currentTarget.load();
      set({ isPlaying: true, status: 'loading', error: null });
      void event.currentTarget.play().catch(handlePlaybackFailure);
      return;
    }

    const code = event.currentTarget.error?.code;
    const detail = code ? ` (media error ${code})` : '';
    set({
      isPlaying: false,
      status: 'error',
      error: `Unable to play this track${detail}. The primary R2 source and the fallback source both failed.`,
    });
  };

  const statusLabel = error
    ? 'ERROR'
    : isPlaying
      ? 'PLAYING'
      : status === 'loading'
        ? 'LOADING'
        : currentSong
          ? status === 'ended' ? 'ENDED' : 'PAUSED'
          : 'IDLE';

  return (
    <>
      <audio
        ref={audioRef}
        data-attikid-player="true"
        crossOrigin="anonymous"
        preload="metadata"
        onLoadedMetadata={(event) => {
          switchingSource.current = false;
          const nextDuration = Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0;
          set({ duration: nextDuration, status: 'ready', error: null });
        }}
        onTimeUpdate={onTime}
        onProgress={onProgress}
        onWaiting={() => set({ status: 'loading' })}
        onCanPlay={() => { switchingSource.current = false; set({ status: 'ready' }); }}
        onPlaying={() => { switchingSource.current = false; set({ isPlaying: true, status: 'playing', error: null }); }}
        onPlay={() => { switchingSource.current = false; set({ isPlaying: true, status: 'playing', error: null }); }}
        onPause={() => { if (switchingSource.current) return; set({ isPlaying: false, status: 'paused' }); }}
        onEnded={onEnded}
        onError={mediaError}
      />
      <section className="global-player" aria-label="Music player">
        <div className="player-track">
          <div className="player-art">
            {currentSong?.artwork_url
              ? <img src={currentSong.artwork_url} alt={`${currentSong.title ?? 'ATTIKID'} artwork`} />
              : <span>AK</span>}
          </div>
          <div className="player-meta">
            <strong>{currentSong?.title ?? 'Select a track'}</strong>
            <span>{currentSong?.artist_name ?? 'ATTIKID'}</span>
            <small className="player-status" aria-live="polite">
              {statusLabel}
              {currentSong && duration > 0 ? ` · ${formatDuration(currentTime)} / ${formatDuration(duration)}` : ''}
            </small>
            {error && <small className="player-error" role="status">{error}</small>}
          </div>
        </div>

        <div className="player-main">
          <div className="player-controls">
            <button type="button" onClick={previous} disabled={!currentSong || !queue.length} aria-label="Previous track" title="Previous">◀</button>
            <button type="button" className="play-button" onClick={toggle} disabled={!currentSong} aria-label={isPlaying ? 'Pause' : 'Play'} title={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? '❚❚' : '▶'}
            </button>
            <button type="button" onClick={next} disabled={!currentSong || !queue.length} aria-label="Next track" title="Next">▶</button>
          </div>

          <div className="player-progress">
            <span>{formatDuration(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={Math.min(currentTime, duration || 0)}
              onChange={seek}
              disabled={!duration}
              aria-label="Seek"
            />
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        <div className="player-options">
          <button
            type="button"
            onClick={toggleRepeat}
            aria-label={repeatMode === 'none' ? 'Repeat off' : repeatMode === 'queue' ? 'Repeat queue' : 'Repeat track'}
            aria-pressed={repeatMode !== 'none'}
            title={repeatMode === 'none' ? 'Repeat off' : repeatMode === 'queue' ? 'Repeat queue' : 'Repeat track'}
          >
            ↻{repeatMode === 'track' ? '1' : ''}
          </button>
          <button type="button" onClick={() => set({ shuffle: !shuffle })} aria-label={shuffle ? 'Disable shuffle' : 'Enable shuffle'} aria-pressed={shuffle} title={shuffle ? 'Shuffle on' : 'Shuffle off'} className={shuffle ? 'active-control' : ''}>⤨</button>
          <button type="button" onClick={() => set({ muted: !muted })} aria-label={muted ? 'Unmute' : 'Mute'} aria-pressed={muted} title={muted ? 'Unmute' : 'Mute'}>{muted ? '🔇' : '🔊'}</button>
          <input type="range" min="0" max="1" step="0.01" value={muted ? 0 : volume} onChange={setVol} aria-label="Volume" />
        </div>
      </section>
    </>
  );
}
