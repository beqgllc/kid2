import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useSessionBootstrap } from '../hooks/useAuth';
import { supabaseConfigured } from '../lib/supabase/client';
import { Home } from '../pages/Home/Page';
import { Music } from '../pages/Music/Page';
import { MusicAZ } from '../pages/Music/AZ';
import { MusicSingles } from '../pages/Music/Singles';
import { Album } from '../pages/Album/Page';
import { Song } from '../pages/Song/Page';
import { Lyrics } from '../pages/Lyrics/Page';
import { LyricsEntry } from '../pages/Lyrics/Entry';
import { About } from '../pages/About/Page';
import { Visuals } from '../pages/Visuals/Page';
import { FanMail } from '../pages/FanMail/Page';
import { NotFound } from '../pages/NotFound/Page';
import { AdminShell } from '../pages/Admin/AdminShell';
import { RequireAdmin } from '../pages/Admin/RequireAdmin';
import { Dashboard } from '../pages/Admin/Dashboard';
import { Music as AdminMusic } from '../pages/Admin/Music';
import { Albums } from '../pages/Admin/Albums';
import { AdminLyrics } from '../pages/Admin/Lyrics';
import { FanMailAdmin } from '../pages/Admin/FanMail';
import { Analytics } from '../pages/Admin/Analytics';
import { Settings } from '../pages/Admin/Settings';
import { AdminLoginEntry } from '../pages/Admin/Login';
import { SplashScreen } from '../components/splash/SplashScreen';
import { LyricVideos } from '../pages/LyricVideos/Page';

function ConfigNotice(){return <div className="config-notice"><div><span className="eyebrow">SETUP REQUIRED</span><h1>Connect ATTIKID to Supabase.</h1><p>Copy <code>.env.example</code> to <code>.env.local</code>, add your Supabase project URL and publishable key, run the migrations, then restart Vite.</p></div></div>}

export function App(){
  const [showSplash, setShowSplash] = useState(true);
  const {ready}=useSessionBootstrap();
  useEffect(()=>{document.documentElement.dataset.ready=String(ready)},[ready]);

  return <>
    {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
    {!supabaseConfigured ? <ConfigNotice/> : <BrowserRouter>
      <Routes>
        <Route element={<AppShell/>}>
          <Route path="/" element={<Home/>}/>
          <Route path="/music" element={<Music/>}/>
          <Route path="/music/a-z" element={<MusicAZ/>}/>
          <Route path="/music/albums" element={<Music/>}/>
          <Route path="/music/singles" element={<MusicSingles/>}/>
          <Route path="/music/:albumSlug" element={<Album/>}/>
          <Route path="/song/:songSlug" element={<Song/>}/>
          <Route path="/lyrics" element={<Lyrics/>}/>
          <Route path="/lyrics/:songSlug" element={<LyricsEntry/>}/>
          <Route path="/about" element={<About/>}/>
          <Route path="/visuals" element={<Visuals/>}/>
          <Route path="/visuals/lyric-videos" element={<LyricVideos/>}/>
          <Route path="/fan-mail" element={<FanMail/>}/>
        </Route>
        <Route path="/admin/login" element={<AdminLoginEntry/>}/>
        <Route element={<RequireAdmin/>}>
          <Route element={<AdminShell/>}>
            <Route path="/admin" element={<Dashboard/>}/>
            <Route path="/admin/music" element={<AdminMusic/>}/>
            <Route path="/admin/albums" element={<Albums/>}/>
            <Route path="/admin/lyrics" element={<AdminLyrics/>}/>
            <Route path="/admin/fan-mail" element={<FanMailAdmin/>}/>
            <Route path="/admin/analytics" element={<Analytics/>}/>
            <Route path="/admin/settings" element={<Settings/>}/>
          </Route>
        </Route>
        <Route path="*" element={<NotFound/>}/>
      </Routes>
    </BrowserRouter>}
  </>;
}
