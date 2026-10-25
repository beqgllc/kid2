import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { App } from './app/App';
import './styles/globals.css';
import './styles/immersive.css';
import './styles/attikid-catalog.css';
import './styles/portfolio.css';
import './pages/Studio/studio.css';
import './styles/site-frame.css';
import './styles/seo.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <SpeedInsights />
  </StrictMode>,
);
