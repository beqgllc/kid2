import './splash.css';

type SplashScreenProps = {
  onComplete: () => void;
};

export function SplashScreen({ onComplete }: SplashScreenProps) {
  return (
    <div className="splash-screen" aria-live="polite">
      <div className="splash">
        <div className="splash_logo">KID</div>
        <div className="splash_svg">
          <svg width="100%" height="100%" aria-hidden="true">
            <rect width="100%" height="100%" />
          </svg>
        </div>
        <div className="splash_minimize">
          <svg width="100%" height="100%" aria-hidden="true">
            <rect width="100%" height="100%" />
          </svg>
        </div>
      </div>

      <div className="text">
        <p>WHERE HURT</p>
        <p>IS HEARD</p>
        <button type="button" onClick={onComplete}>Enter</button>
      </div>
    </div>
  );
}
