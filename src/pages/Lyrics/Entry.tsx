import { useParams, Link } from 'react-router-dom';
import { useSong } from '../../hooks/useCatalog';
import { getLyrics } from '../../services/lyrics';
import { useEffect, useState } from 'react';
import type { Lyrics as LyricsType } from '../../types/models';
import { LyricsViewer } from '../../components/lyrics/LyricsViewer';
export function LyricsEntry(){const {songSlug=''}=useParams();const {data:song,loading}=useSong(songSlug);const [lyrics,setLyrics]=useState<LyricsType|null>(null);useEffect(()=>{if(song)getLyrics(song.id).then(setLyrics).catch(()=>null)},[song]);if(loading)return <div className="page"><div className="loading-state">Loading lyrics…</div></div>;if(!song)return <div className="center-page"><h1>Song not found.</h1><Link className="button" to="/lyrics">Lyrics index</Link></div>;return <div className="page"><header className="lyrics-hero"><span className="eyebrow">{song.artist_name}</span><h1>{song.title}</h1><p>{song.album?.title}</p></header><section className="content-section narrow">{lyrics?<LyricsViewer content={lyrics.content}/>:<p className="muted">Lyrics haven't been added yet.</p>}</section></div>}
