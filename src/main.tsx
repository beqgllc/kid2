import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles/globals.css';
import './styles/immersive.css';
import './styles/attikid-catalog.css';
import './styles/portfolio.css';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
