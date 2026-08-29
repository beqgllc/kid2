import { useParams, Link } from 'react-router-dom';
import { useSong } from '../../hooks/useCatalog';
import { useEffect, useState } from 'react';
import { getLyrics } from '../../services/lyrics';
import { LyricsViewer } from '../../components/lyrics/LyricsViewer';
import { ReactionBar } from '../../components/engagement/ReactionBar';
import { Comments } from '../../components/comments/Comments';
import { usePlayerStore } from '../../stores/playerStore';
import type { Lyrics } from '../../types/models';
export function Song(){const {songSlug=''}=useParams();const {data:song,loading}=useSong(songSlug);const [lyrics,setLyrics]=useState<Lyrics|null>(null);const set=usePlayerStore(s=>s.set);useEffect(()=>{if(song)getLyrics(song.id).then(setLyrics).catch(()=>null)},[song]);if(loading)return <div className="page"><div className="loading-state">Loading song…</div></div>;if(!song)return <div className="center-page"><h1>Track not found.</h1><Link className="button" to="/music">Back to music</Link></div>;const play=()=>song.audio_url&&set({currentSong:song as any,queue:[song] as any,currentIndex:0,isPlaying:true,status:'loading',error:null});return <div className="page"><section className="song-hero"><div className="song-art">{song.artwork_url?<img src={song.artwork_url} alt=""/>:<span>ATTIKID</span>}</div><div><span className="eyebrow">{song.album?.title??'TRACK'}</span><h1>{song.title}</h1><p>{song.artist_name}</p><div className="button-row"><button className="button" onClick={play} disabled={!song.audio_url}>Play</button><Link className="button secondary" to={`/lyrics/${song.slug}`}>Lyrics</Link></div><ReactionBar songId={song.id}/></div></section><section className="content-section narrow"><div className="section-heading"><span>Words</span><h2>Lyrics</h2></div>{lyrics?<LyricsViewer content={lyrics.content}/>:<p className="muted">Lyrics haven't been added yet.</p>}</section><Comments songId={song.id}/></div>}
