interface SplashProps {
  onListenNow: () => void;
}

export function Splash({ onListenNow }: SplashProps) {
  return (
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
        <button type="button" onClick={onListenNow}>Listen now →</button>
      </div>

      <style>{`
        body { background: var(--color-bg, #191919); font-family: var(--font-display, 'Big Shoulders Display', sans-serif); }

        .splash {
          width: 100vw;
          height: 100vh;
          position: fixed;
          inset: 0;
          display: flex;
          overflow: hidden;
          background: var(--color-bg, #191919);
          z-index: 1000;
        }

        .splash_logo {
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 5;
          width: 50px;
          height: 30px;
          margin: -15px 0 0 -25px;
          color: var(--color-text, #ffffff);
          font-family: var(--font-display, 'Big Shoulders Display', sans-serif);
          font-size: 26px;
          font-weight: 100;
          text-align: center;
          opacity: 1;
          animation: kid-logo-color 0.3s ease-in 1.5s forwards, kid-off 0.6s ease-in-out 2.5s forwards;
        }

        .splash_logo::before,
        .splash_logo::after {
          display: block;
          position: absolute;
          left: 5px;
          width: 38px;
          height: 2.5px;
          background-color: var(--color-border, #757474);
          content: '';
        }

        .splash_logo::before { bottom: -5px; }
        .splash_logo::after { top: -5px; }

        .splash_svg { position: relative; width: 100%; height: 100%; }
        .splash_svg svg,
        .splash_minimize svg { display: block; width: 100%; height: 100%; backface-visibility: visible; }

        .splash_svg rect {
          width: 100%;
          height: 100%;
          fill: var(--color-accent, #FF4E00);
          stroke: 0;
          clip-path: polygon(45vw 40vh, 55vw 40vh, 55vw 60vh, 45vw 60vh);
          animation: expand 0.8s ease-in forwards 2.7s;
        }

        .splash_minimize { position: absolute; width: 100%; height: 100%; inset: 0; z-index: 4; }

        .splash_minimize rect {
          width: 100%;
          height: 100%;
          fill: var(--color-bg, #191919);
          clip-path: polygon(0vw 0vh, 100vw 0vh, 100vw 100vh, 0vw 100vh);
          animation: scale 0.1s ease-out forwards 1s, hide 1.3s ease-out forwards 1.2s;
        }

        .text {
          position: fixed;
          z-index: 1001;
          left: 50%;
          top: 40%;
          width: 300px;
          height: 100px;
          margin: -50px 0 0 -120px;
          color: var(--color-text, #ffffff);
          font-family: var(--font-display, 'Big Shoulders Display', sans-serif);
          font-size: 65px;
          font-weight: 500;
          text-align: left;
          opacity: 0;
          animation: on 0.7s ease-in-out 3.7s forwards;
        }

        .text p { width: 100%; margin: 0; color: var(--color-text, #ffffff); font-family: var(--font-display, 'Big Shoulders Display', sans-serif); white-space: nowrap; overflow: hidden; }
        .text p:nth-child(1) { font-size: clamp(2.2rem, 5vw, 4rem); line-height: 1; animation: type 0.4s steps(60, end) 3.7s; }
        .text p:nth-child(2) { font-size: clamp(2.2rem, 5vw, 4rem); line-height: 1; animation: type2 0.6s steps(60, end) 3.7s; }

        .text button {
          opacity: 0;
          border: 1px solid var(--color-border, #757474);
          background: var(--color-bg, #191919);
          color: var(--color-text, #ffffff);
          font-family: var(--font-mono, 'IBM Plex Mono', monospace);
          font-size: 12px;
          font-weight: 200;
          letter-spacing: 4px;
          padding: 0.5rem 2.5rem;
          text-transform: uppercase;
          cursor: pointer;
          transition: color 0.5s, background-color 0.5s, border-color 0.5s;
          animation: on 0.6s ease-in-out 4s forwards;
        }

        .text button:hover { background: var(--color-accent, #FF4E00); color: var(--color-bg, #191919); border: 1px solid var(--color-bg, #191919); }
        .text button:focus-visible { outline: 2px solid var(--color-accent, #FF4E00); outline-offset: 4px; }

        @keyframes scale { 100% { clip-path: polygon(45vw 40vh, 55vw 40vh, 55vw 60vh, 45vw 60vh); } }
        @keyframes hide { 100% { fill: transparent; } }
        @keyframes on { 100% { opacity: 1; } }
        @keyframes type { 0% { width: 0; } 100% { width: 100%; } }
        @keyframes type2 { 0%, 50% { width: 0; } 100% { width: 100%; } }
        @keyframes expand {
          0% {}
          25% { clip-path: polygon(0vw 0vh, 55vw 40vh, 55vw 60vh, 45vw 60vh); fill: var(--color-text, #ffffff); }
          50% { clip-path: polygon(0vw 0vh, 100vw 0vh, 55vw 60vh, 45vw 60vh); fill: var(--color-accent, #FF4E00); }
          75% { clip-path: polygon(0vw 0vh, 100vw 0vh, 55vw 60vh, 0vw 100vh); fill: var(--color-text, #ffffff); }
          100% { clip-path: polygon(0vw 0vh, 100vw 0vh, 100vw 100vh, 0vw 100vh); fill: var(--color-accent, #FF4E00); }
        }

        @media (prefers-reduced-motion: reduce) {
          .splash_logo, .splash_svg rect, .splash_minimize rect, .text, .text p:nth-child(1), .text p:nth-child(2), .text button { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>
    </>
  );
}