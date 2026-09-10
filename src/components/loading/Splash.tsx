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
    }, 5800);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== 'loader') return;

    setLoaderMinimumComplete(false);
    const timer = window.setTimeout(() => {
      setLoaderMinimumComplete(true);
    }, 900);

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

    const timer = window.setTimeout(() => setPhase('done'), 500);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <>
      {phase === 'splash' || phase === 'exit' ? (
        <>
          <div className="splash">
            <div className="splash_logo">K!D</div>
            <div className="splash_svg">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                <rect x="0" y="0" width="100" height="100" />
              </svg>
            </div>
            <div className="splash_minimize">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                <rect x="0" y="0" width="100" height="100" />
              </svg>
            </div>
          </div>

          <div className="text">
            <p>Attikid</p>
            <p>Music</p>
            <button>Listen now →</button>
          </div>
        </>
      ) : null}

      {phase === 'loader' ? (
        <div className="attikid-loader__center">
          <div className="attikid-loader__mark" aria-hidden="true">
            <span className="attikid-loader__line attikid-loader__line--one" />
            <span className="attikid-loader__line attikid-loader__line--two" />
            <span className="attikid-loader__line attikid-loader__line--three" />
          </div>

          <div className="attikid-loader__wordmark">ATTIKID</div>
          <div className="attikid-loader__label">LOADING MUSIC</div>
        </div>
      ) : null}

      <style>{`
        body { background: var(--color-bg, #191919); font-family: var(--font-display, 'Big Shoulders Display', sans-serif); }

        .splash {
          width: 100vw;
          height: 100vh;
          position: fixed;
          top: 0;
          display: flex;
          overflow: hidden;
          background: var(--color-bg, #191919);
        }

        .splash_logo {
          position: absolute;
          margin: -15px 0 0 -25px;
          top: 50vh;
          z-index: 5;
          left: 50vw;
          width: 50px;
          text-align: center;
          height: 30px;
          font-size: 26px;
          font-weight: 100;
          color: var(--color-text, #ffffff);
          opacity: 1;
          will-change: opacity;
          animation: logo 0.3s ease-in 1.5s forwards, off 0.6s ease-in-out 3.2s forwards;
        }

        .splash_logo::before {
          display: block;
          position: absolute;
          left: 5px;
          bottom: -5px;
          width: 38px;
          height: 2.5px;
          background-color: var(--color-border, #757474);
          content: '';
        }

        .splash_logo::after {
          display: block;
          position: absolute;
          left: 5px;
          top: -5px;
          width: 38px;
          height: 2.5px;
          background-color: var(--color-border, #757474);
          content: '';
          will-change: width;
        }

        .splash_svg {
          position: relative;
          margin: auto;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          bottom: 0;
          right: 0;
        }

        .splash_svg svg,
        .splash_minimize svg {
          display: block;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: visible;
          backface-visibility: visible;
        }

        .splash_svg rect {
          width: 100%;
          height: 100%;
          fill: var(--color-accent, #FF4E00);
          stroke: 0;
          -webkit-clip-path: polygon(45vw 40vh, 55vw 40vh, 55vw 60vh, 45vw 60vh);
          clip-path: polygon(45vw 40vh, 55vw 40vh, 55vw 60vh, 45vw 60vh);
          animation: expand 0.8s ease-in forwards 2.7s;
        }

        .splash_minimize {
          position: absolute;
          margin: auto;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          z-index: 4;
        }

        .splash_minimize rect {
          width: 100%;
          height: 100%;
          fill: var(--color-bg, #191919);
          -webkit-clip-path: polygon(0vw 0vh, 100vw 0vh, 100vw 100vh, 0vw 100vh);
          clip-path: polygon(0vw 0vh, 100vw 0vh, 100vw 100vh, 0vw 100vh);
          animation: scale 0.1s ease-out forwards 1s, hide 1.3s ease-out forwards 1.2s;
        }

        .text {
          opacity: 0;
          position: fixed;
          z-index: 7;
          text-align: left;
          margin: -50px 0 0 -120px;
          width: 300px;
          height: 100px;
          top: 40%;
          left: 50%;
          font-size: 65px;
          font-weight: 500;
          font-family: var(--font-display, 'Big Shoulders Display', sans-serif);
          color: var(--color-text, #ffffff);
          animation: on 0.7s ease-in-out 3.7s forwards;
        }

        .text p {
          white-space: nowrap;
          overflow: hidden;
          width: 100%;
          color: var(--color-text, #ffffff);
          margin: 0;
        }

        .text p:nth-child(1) {
          font-size: clamp(2.2rem, 5vw, 4rem);
          line-height: 1;
          animation: type 0.4s steps(60, end) 3.7s;
        }

        .text p:nth-child(2) {
          font-size: clamp(2.2rem, 5vw, 4rem);
          line-height: 1;
          animation: type2 0.6s steps(60, end) 3.7s;
        }

        .text button {
          border: 0;
          opacity: 0;
          background: var(--color-bg, #191919);
          color: var(--color-text, #ffffff);
          border: 1px solid var(--color-border, #757474);
          letter-spacing: 4px;
          padding: 0.5rem 2.5rem;
          font-size: 12px;
          font-weight: 200;
          text-transform: uppercase;
          cursor: pointer;
          transition: color 0.5s, background-color 0.5s, border-color 0.5s;
          animation: on 0.6s ease-in-out 4s forwards;
        }

        .text button:hover {
          background: var(--color-accent, #FF4E00);
          color: var(--color-bg, #191919);
          border: 1px solid var(--color-bg, #191919);
        }

        @keyframes scale {
          100% {
            -webkit-clip-path: polygon(45vw 40vh, 55vw 40vh, 55vw 60vh, 45vw 60vh);
            clip-path: polygon(45vw 40vh, 55vw 40vh, 55vw 60vh, 45vw 60vh);
          }
        }

        @keyframes hide {
          100% { fill: transparent; }
        }

        @keyframes off {
          100% { opacity: 0; }
        }

        @keyframes on {
          100% { opacity: 1; }
        }

        @keyframes logo {
          100% { color: var(--color-bg, #191919); }
        }

        @keyframes type {
          0% { width: 0; }
          100% { width: 100%; }
        }

        @keyframes type2 {
          0%, 50% { width: 0; }
          100% { width: 100%; }
        }

        @keyframes expand {
          0% {}
          25% {
            -webkit-clip-path: polygon(0vw 0vh, 55vw 40vh, 55vw 58vh, 45vw 58vh);
            clip-path: polygon(0vw 0vh, 55vw 40vh, 55vw 60vh, 45vw 60vh);
            fill: var(--color-text, #ffffff);
          }
          50% {
            -webkit-clip-path: polygon(0vw 0vh, 100vw 0vh, 55vw 60vh, 45vw 60vh);
            clip-path: polygon(0vw 0vh, 100vw 0vh, 55vw 60vh, 45vw 60vh);
            fill: var(--color-accent, #FF4E00);
          }
          75% {
            -webkit-clip-path: polygon(0vw 0vh, 100vw 0vh, 55vw 60vh, 0vw 100vh);
            clip-path: polygon(0vw 0vh, 100vw 0vh, 55vw 60vh, 0vw 100vh);
            fill: var(--color-text, #ffffff);
          }
          100% {
            -webkit-clip-path: polygon(0vw 0vh, 100vw 0vh, 100vw 100vh, 0vw 100vh);
            clip-path: polygon(0vw 0vh, 100vw 0vh, 100vw 100vh, 0vw 100vh);
            fill: var(--color-accent, #FF4E00);
          }
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
          border: 1px solid var(--color-border, #757474);
        }

        .attikid-loader__line {
          display: block;
          width: 10px;
          height: 100%;
          min-height: 7px;
          border-radius: 0;
          background: var(--color-accent, #FF4E00);
          transform-origin: bottom center;
        }

        .attikid-loader__line--one {
          animation: attikid-loader-bars 0.55s ease-in-out infinite;
        }

        .attikid-loader__line--two {
          background: var(--color-text, #ffffff);
          animation: attikid-loader-bars-alt 0.55s ease-in-out 0.14s infinite;
        }

        .attikid-loader__line--three {
          animation: attikid-loader-bars 0.55s ease-in-out 0.28s infinite;
        }

        .attikid-loader__wordmark {
          margin-top: 20px;
          color: var(--color-text, #ffffff);
          font-family: var(--font-display, 'Big Shoulders Display', sans-serif);
          font-size: clamp(2.4rem, 8vw, 4.5rem);
          font-weight: 800;
          letter-spacing: 0.02em;
          line-height: 0.8;
        }

        .attikid-loader__label {
          margin-top: 10px;
          color: var(--color-accent, #FF4E00);
          font-family: var(--font-mono, 'IBM Plex Mono', monospace);
          font-size: 9px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
        }

        @media (prefers-reduced-motion: reduce) {
          .splash_logo,
          .splash_svg rect,
          .splash_minimize rect,
          .text,
          .text p:nth-child(1),
          .text p:nth-child(2),
          .text button {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }

          .attikid-loader__line {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}