import { Link } from 'react-router-dom';
import type { Album } from '../../types/models';
import type { Song } from '../../types/models';
import { formatDuration } from '../../lib/utils';

export function AlbumCard({album, tracks = []}:{album:Album; tracks?:Song[]}) {
  return <article className="album-card reveal">
    <Link to={`/music/${album.slug}`}>
      <div className="album-art">{album.cover_url?<img src={album.cover_url} alt={`${album.title} cover`}/>:<span>ATTIKID</span>}</div>
      <div className="album-card-meta"><strong>{album.title}</strong><span>{album.artist_name} · {new Date(album.release_date).toLocaleDateString()}</span></div>
    </Link>
    {tracks.length > 0 && <div className="album-track-list" aria-label={`${album.title} track list`}>
      {tracks.map((track, index) => <div className="album-track" key={track.id}><span>{String(track.track_number ?? index + 1).padStart(2, '0')}</span><span>{track.title}</span><span>{formatDuration(track.duration_seconds)}</span></div>)}
    </div>}
  </article>
}
