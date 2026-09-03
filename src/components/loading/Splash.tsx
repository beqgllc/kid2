import { useEffect, useRef, useState } from 'react';

type Phase = 'splash' | 'loader' | 'exit' | 'done';

interface SplashProps {
  ready: boolean;
}

/**
 * ATTIKID opening sequence:
 *
 * 0.0s  — Supply Black fills the viewport
 * 1.0s  — Black field contracts to the K!D center mark
 * 1.2s  — Center field dissolves
 * 1.5s  — K!D shifts from white to black
 * 2.7s  — Signal Orange expands across the viewport
 * 3.2s  — K!D disappears
 * 3.7s  — ATTIKID MUSIC / YOU ARE NOT ALONE appears
 * 4.5s  — Splash fades
 * 5.3s  — ATTIKID audio loader takes over
 *       — Loader remains until the application is ready
 */
export function Splash({ ready }: SplashProps) {
  const [phase, setPhase] = useState<Phase>('splash');
  const [loaderMinimumComplete, setLoaderMinimumComplete] = useState(false);
  const loaderStartedAt = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loaderStartedAt.current = performance.now();
      setPhase('loader');
    }, 5300);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== 'loader') return;

    setLoaderMinimumComplete(false);
    const timer = window.setTimeout(() => {
      setLoaderMinimumComplete(true);
    }, 850);

    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'loader' || !ready || !loaderMinimumComplete) return;

    const elapsed = loaderStartedAt.current
      ? performance.now() - loaderStartedAt.current
      : 0;
    const remaining = Math.max(0, 1050 - elapsed);

    const timer = window.setTimeout(() => setPhase('exit'), remaining);
    return () => window.clearTimeout(timer);
  }, [phase, ready, loaderMinimumComplete]);

  useEffect(() => {
    if (phase !== 'exit') return;

    const timer = window.setTimeout(() => setPhase('done'), 320);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div
      className={`attikid-loading-stage attikid-loading-stage--${phase}`}
      aria-hidden="true"
    >
      {phase === 'splash' || phase === 'exit' ? (
        <div className="kid-splash-container">
          <div className="kid-splash">
            <div className="kid-splash-logo">K!D</div>

            <div className="kid-splash-svg">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                <rect x="0" y="0" width="100" height="100" />
              </svg>
            </div>

            <div className="kid-splash-minimize">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                <rect x="0" y="0" width="100" height="100" />
              </svg>
            </div>
          </div>

          <div className="kid-splash-text">
            <div className="kid-splash-text-line1">ATTIKID MUSIC</div>
            <div className="kid-splash-text-line2">YOU ARE NOT ALONE</div>
          </div>
        </div>
      ) : null}

      {phase === 'loader' ? (
        <div className="attikid-loader" role="status" aria-label="Loading ATTIKID">
          <div className="attikid-loader__topline">
            <span>K!D</span>
            <span>ATTIKID / 001</span>
          </div>

          <div className="attikid-loader__center">
            <div className="attikid-loader__mark" aria-hidden="true">
              <span className="attikid-loader__line attikid-loader__line--one" />
              <span className="attikid-loader__line attikid-loader__line--two" />
              <span className="attikid-loader__line attikid-loader__line--three" />
            </div>

            <div className="attikid-loader__wordmark">ATTIKID</div>
            <div className="attikid-loader__label">LOADING MUSIC</div>
          </div>

          <div className="attikid-loader__bottomline">
            <span>YOU ARE NOT ALONE</span>
            <span className="attikid-loader__pulse" />
          </div>
        </div>
      ) : null}

      <style>{`
        @keyframes kid-scale {
          100% { clip-path: polygon(45vw 40vh, 55vw 40vh, 55vw 60vh, 45vw 60vh); }
        }

        @keyframes kid-hide {
          100% { fill: transparent; }
        }

        @keyframes kid-off {
          100% { opacity: 0; }
        }

        @keyframes kid-on {
          100% { opacity: 1; }
        }

        @keyframes kid-logo-color {
          100% { color: var(--color-bg); }
        }

        @keyframes kid-type {
          0% { width: 0; }
          100% { width: 100%; }
        }

        @keyframes kid-type2 {
          0%, 50% { width: 0; }
          100% { width: 100%; }
        }

        @keyframes kid-expand {
          25% {
            clip-path: polygon(0 0, 55vw 40vh, 55vw 58vh, 45vw 58vh);
            fill: var(--color-text);
          }
          50% {
            clip-path: polygon(0 0, 100vw 0, 55vw 60vh, 45vw 60vh);
            fill: var(--color-accent);
          }
          75% {
            clip-path: polygon(0 0, 100vw 0, 55vw 60vh, 0 100vh);
            fill: var(--color-text);
          }
          100% {
            clip-path: polygon(0 0, 100vw 0, 100vw 100vh, 0 100vh);
            fill: var(--color-accent);
          }
        }

        @keyframes kid-splash-exit {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes attikid-loader-bars {
          0%, 100% { transform: scaleY(0.18); }
          50% { transform: scaleY(1); }
        }

        @keyframes attikid-loader-bars-alt {
          0%, 100% { transform: scaleY(0.75); }
          50% { transform: scaleY(0.28); }
        }

        @keyframes attikid-loader-pulse {
          0%, 100% { opacity: 0.25; transform: scaleX(0.35); transform-origin: left; }
          50% { opacity: 1; transform: scaleX(1); transform-origin: left; }
        }

        .attikid-loading-stage {
          position: fixed;
          inset: 0;
          z-index: 2147483000;
          width: 100vw;
          height: 100dvh;
          overflow: hidden;
          background: var(--color-bg, #0A0A0A);
          color: var(--color-text, #F5F5F5);
        }

        .attikid-loading-stage--exit {
          animation: kid-splash-exit 0.32s ease-in-out forwards;
          pointer-events: none;
        }

        .kid-splash-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          animation: kid-splash-exit 0.8s ease-in-out 4.5s forwards;
        }

        .kid-splash {
          position: absolute;
          inset: 0;
          display: flex;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .kid-splash-logo {
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 5;
          width: 56px;
          height: 34px;
          margin: -18px 0 0 -28px;
          color: var(--color-text);
          text-align: center;
          font-family: var(--font-display, 'Big Shoulders Display', sans-serif);
          font-size: 28px;
          font-weight: 800;
          letter-spacing: 0.04em;
          opacity: 1;
          animation:
            kid-logo-color 0.3s ease-in 1.5s forwards,
            kid-off 0.6s ease-in-out 3.2s forwards;
        }

        .kid-splash-logo::before,
        .kid-splash-logo::after {
          position: absolute;
          left: 18px;
          display: block;
          width: 20px;
          height: 1px;
          background: currentColor;
          content: '';
          opacity: 0.65;
        }

        .kid-splash-logo::before { bottom: -5px; }
        .kid-splash-logo::after { top: -5px; }

        .kid-splash-svg {
          position: absolute;
          inset: 0;
        }

        .kid-splash-svg svg,
        .kid-splash-minimize svg {
          display: block;
          width: 100%;
          height: 100%;
        }

        .kid-splash-svg rect {
          width: 100%;
          height: 100%;
          fill: var(--color-accent);
          clip-path: polygon(45vw 40vh, 55vw 40vh, 55vw 60vh, 45vw 60vh);
          animation: kid-expand 0.7s ease-in forwards 2.7s;
        }

        .kid-splash-minimize {
          position: absolute;
          inset: 0;
          z-index: 4;
        }

        .kid-splash-minimize rect {
          width: 100%;
          height: 100%;
          fill: var(--color-bg);
          clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          animation:
            kid-scale 0.2s ease-out forwards 1s,
            kid-hide 1.3s ease-out forwards 1.2s;
        }

        .kid-splash-text {
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 7;
          width: max-content;
          transform: translate(-50%, -50%);
          text-align: center;
          white-space: nowrap;
          opacity: 0;
          animation: kid-on 0.6s ease-in-out 3.7s forwards;
        }

        .kid-splash-text-line1,
        .kid-splash-text-line2 {
          overflow: hidden;
          width: 0;
        }

        .kid-splash-text-line1 {
          color: var(--color-bg);
          font-family: var(--font-display, 'Big Shoulders Display', sans-serif);
          font-size: clamp(2.5rem, 9vw, 8rem);
          font-weight: 800;
          line-height: 0.85;
          letter-spacing: 0.01em;
          text-transform: uppercase;
          animation: kid-type 0.35s steps(30, end) 3.7s forwards;
        }

        .kid-splash-text-line2 {
          margin-top: 0.6rem;
          color: var(--color-bg);
          font-family: var(--font-body, 'IBM Plex Sans', sans-serif);
          font-size: clamp(0.55rem, 1.4vw, 1rem);
          font-weight: 500;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          animation: kid-type2 0.5s steps(30, end) 3.7s forwards;
        }

        /* ATTIKID loader — deliberately minimal, editorial and music-driven.
           It uses the locked brand tokens instead of introducing new colors. */
        .attikid-loader {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
          padding: clamp(22px, 4vw, 48px);
          background:
            linear-gradient(to right, transparent 49.95%, var(--color-border) 50%, transparent 50.05%),
            linear-gradient(to bottom, transparent 49.95%, var(--color-border) 50%, transparent 50.05%),
            var(--color-bg);
        }

        .attikid-loader::before,
        .attikid-loader::after {
          position: absolute;
          inset: 18px;
          border: 1px solid var(--color-border);
          content: '';
          pointer-events: none;
        }

        .attikid-loader::after {
          inset: 50%;
          width: 1px;
          height: 34px;
          border: 0;
          background: var(--color-accent);
          transform: translate(-50%, -50%);
          opacity: 0.4;
        }

        .attikid-loader__topline,
        .attikid-loader__bottomline {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--color-text-muted);
          font-family: var(--font-mono, 'IBM Plex Mono', monospace);
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.18em;
          line-height: 1;
          text-transform: uppercase;
        }

        .attikid-loader__topline span:first-child {
          color: var(--color-accent);
          font-family: var(--font-display, 'Big Shoulders Display', sans-serif);
          font-size: 17px;
          font-weight: 800;
          letter-spacing: 0.06em;
        }

        .attikid-loader__center {
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: min(260px, 60vw);
          transform: translate(-50%, -50%);
        }

        .attikid-loader__mark {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 7px;
          width: 74px;
          height: 74px;
          padding: 7px 10px;
          box-sizing: border-box;
          border: 1px solid var(--color-border);
        }

        .attikid-loader__line {
          display: block;
          width: 10px;
          height: 100%;
          min-height: 7px;
          border-radius: 0;
          background: var(--color-accent);
          transform-origin: bottom center;
        }

        .attikid-loader__line--one {
          animation: attikid-loader-bars 0.55s ease-in-out infinite;
        }

        .attikid-loader__line--two {
          background: var(--color-text);
          animation: attikid-loader-bars-alt 0.55s ease-in-out 0.14s infinite;
        }

        .attikid-loader__line--three {
          animation: attikid-loader-bars 0.55s ease-in-out 0.28s infinite;
        }

        .attikid-loader__wordmark {
          margin-top: 20px;
          color: var(--color-text);
          font-family: var(--font-display, 'Big Shoulders Display', sans-serif);
          font-size: clamp(2.4rem, 8vw, 4.5rem);
          font-weight: 800;
          letter-spacing: 0.02em;
          line-height: 0.8;
        }

        .attikid-loader__label {
          margin-top: 10px;
          color: var(--color-accent);
          font-family: var(--font-mono, 'IBM Plex Mono', monospace);
          font-size: 9px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
        }

        .attikid-loader__pulse {
          display: block;
          width: 56px;
          height: 1px;
          margin-left: 14px;
          background: var(--color-accent);
          animation: attikid-loader-pulse 1s ease-in-out infinite;
        }

        @media (max-width: 600px) {
          .attikid-loader::before { inset: 10px; }
          .attikid-loader { padding: 22px; }
          .attikid-loader__mark { width: 62px; height: 62px; }
          .attikid-loader__line { width: 8px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .kid-splash-container,
          .kid-splash-logo,
          .kid-splash-svg rect,
          .kid-splash-minimize rect,
          .kid-splash-text,
          .kid-splash-text-line1,
          .kid-splash-text-line2 {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }

          .attikid-loader__line,
          .attikid-loader__pulse {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
