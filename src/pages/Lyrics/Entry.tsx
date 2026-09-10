import { useParams, Link } from 'react-router-dom';
import { useSong } from '../../hooks/useCatalog';
import { getLyrics } from '../../services/lyrics';
import { useEffect, useState } from 'react';
import type { Lyrics as LyricsType } from '../../types/models';
import { LyricsViewer } from '../../components/lyrics/LyricsViewer';
import { buildSongJsonLd, buildWebSiteJsonLd, usePageMeta } from '../../lib/seo';
export function LyricsEntry(){
  const {songSlug=''}=useParams();
  const {data:song,loading}=useSong(songSlug);
  const [lyrics,setLyrics]=useState<LyricsType|null>(null);
  useEffect(()=>{if(song)getLyrics(song.id).then(setLyrics).catch(()=>null)},[song]);

  usePageMeta({
    title: song ? `${song.title} Lyrics — ATTIKID` : 'ATTIKID Lyrics',
    description: song ? `Read the lyrics for “${song.title}” by ATTIKID.` : 'Read ATTIKID lyrics from the catalog.',
    canonical: song ? `attikid.vercel.app/lyrics/${song.slug}` : 'attikid.vercel.app/lyrics',
    type: 'music.song',
    keywords: song ? ['ATTIKID lyrics', song.title, song.album?.title ?? 'album'] : ['ATTIKID lyrics', 'song lyrics'],
    image: song?.artwork_url ?? '/images/hero/hero-home.webp',
    jsonLd: song ? buildSongJsonLd(song) : buildWebSiteJsonLd()
  });

  if(loading)return <div className="page"><div className="loading-state">Loading lyrics…</div></div>;
  if(!song)return <div className="center-page"><h1>Song not found.</h1><Link className="button" to="/lyrics">Lyrics index</Link></div>;

  return <div className="page"><header className="lyrics-hero"><span className="eyebrow">{song.artist_name}</span><h1>{song.title}</h1><p>{song.album?.title}</p></header><section className="content-section narrow">{lyrics?<LyricsViewer content={lyrics.content}/>:<p className="muted">Lyrics haven't been added yet.</p>}</section></div>}

