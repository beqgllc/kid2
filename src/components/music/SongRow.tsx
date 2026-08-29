import { usePlayerStore } from '../../stores/playerStore';
import { formatDuration } from '../../lib/utils';
import type { Song } from '../../types/models';

export function SongRow({song,index,songs}:{song:Song;index:number;songs:Song[]}){const set=usePlayerStore(s=>s.set);const playable=Boolean(song.audio_url);const play=()=>{if(!song.audio_url)return;set({currentSong:song as any,queue:songs.filter(s=>s.audio_url) as any,currentIndex: songs.filter(s=>s.audio_url).findIndex(s=>s.id===song.id),isPlaying:true,status:'loading',error:null})};return <div className="song-row"><span className="track-num">{String(index+1).padStart(2,'0')}</span><button className="song-play" onClick={play} disabled={!playable} aria-label={`Play ${song.title}`}>{playable?'▶':'—'}</button><div className="song-info"><strong>{song.title}</strong><span>{song.album?.title ?? 'ATTIKID'}</span></div><span className="song-duration">{formatDuration(song.duration_seconds)}</span></div>}
