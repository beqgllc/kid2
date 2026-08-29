import { Outlet } from 'react-router-dom';
import { Header } from '../navigation/Header';
import { GlobalPlayer } from '../player/GlobalPlayer';
import { Footer } from './Footer';

export function AppShell() { return <div className="app-shell"><Header/><main><Outlet/></main><Footer/><GlobalPlayer/></div>; }
