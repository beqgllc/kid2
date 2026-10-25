import { Outlet } from 'react-router-dom';
import { Header } from '../navigation/Header';
import { GlobalPlayer } from '../player/GlobalPlayer';
import { Footer } from './Footer';

export function AppShell() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Header />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
      <GlobalPlayer />
    </div>
  );
}
