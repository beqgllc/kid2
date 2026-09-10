import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Splash } from '../components/loading/Splash';
import { supabaseConfigured } from '../lib/supabase/client';
import { Home } from '../pages/Home/Page';
import { Music } from '../pages/Music/Page';
import { Album } from '../pages/Album/Page';
import { Song } from '../pages/Song/Page';
import { About } from '../pages/About/Page';
import { NotFound } from '../pages/NotFound/Page';
import { Albums } from '../pages/Albums/Page';
import { Videos } from '../pages/Videos/Page';
import { Lyrics } from '../pages/Lyrics/Page';
import { AdminShell } from '../pages/Admin/AdminShell';
import { RequireAdmin } from '../pages/Admin/RequireAdmin';
import { AdminLogin } from '../pages/Admin/Login';
import { Dashboard } from '../pages/Admin/Dashboard';
import { Music as AdminMusic } from '../pages/Admin/Music';
import { Albums as AdminAlbums } from '../pages/Admin/Albums';
import { AdminLyrics } from '../pages/Admin/Lyrics';
import { FanMailAdmin } from '../pages/Admin/FanMail';
import { Analytics } from '../pages/Admin/Analytics';
import { Settings } from '../pages/Admin/Settings';

function ConfigNotice(){return <div className="config-notice"><div><span className="eyebrow">SETUP REQUIRED</span><h1>Connect ATTIKID to Supabase.</h1><p>Copy <code>.env.example</code> to <code>.env.local</code>, add your Supabase project URL and publishable key, run the migrations, then restart Vite.</p></div></div>}

export function App(){
  const [showSplash, setShowSplash] = useState(true);

  return <>
    {!supabaseConfigured ? <ConfigNotice/> : <BrowserRouter>
      {showSplash ? <Splash onListenNow={() => setShowSplash(false)} /> : null}
      <Routes>
        <Route element={<AppShell/>}>
          <Route path="/" element={<Home/>}/>
          <Route path="/home" element={<Home/>}/>
          <Route path="/music" element={<Music/>}/>
          <Route path="/music/albums" element={<Albums/>}/>
          <Route path="/music/lyrics" element={<Lyrics/>}/>
          <Route path="/music/videos" element={<Videos/>}/>
          <Route path="/music/:albumSlug" element={<Album/>}/>
          <Route path="/song/:songSlug" element={<Song/>}/>
          <Route path="/story" element={<About/>}/>
          <Route path="/about" element={<About/>}/>
          <Route path="/supply" element={<NotFound/>}/>
          <Route path="/auth" element={<AdminLogin/>}/>
        </Route>
        <Route path="/admin/login" element={<AdminLogin/>}/>
        <Route element={<RequireAdmin/>}>
          <Route element={<AdminShell/>}>
            <Route path="/admin" element={<Dashboard/>}/>
            <Route path="/admin/music" element={<AdminMusic/>}/>
            <Route path="/admin/albums" element={<AdminAlbums/>}/>
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
