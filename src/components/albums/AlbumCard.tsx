import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import type { Album, Song } from '../../types/models';
import { formatDuration } from '../../lib/utils';

const VIEWS = ['Overview', 'Purpose', 'Track list', 'Credits'] as const;

function metadataString(song: Song, key: 'title' | 'album' | 'artist' | 'release_date') {
  const value = song.metadata?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function metadataNumber(song: Song, key: 'track_total') {
  const value = song.metadata?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function AlbumCard({ album, tracks = [] }: { album: Album; tracks?: Song[] }) {
  const [view, setView] = useState(0);

  const artists = useMemo(
    () => [...new Set(tracks.map((track) => metadataString(track, 'artist') ?? track.artist_name).filter(Boolean))],
    [tracks],
  );
  const genres = useMemo(
    () => [...new Set(
      tracks
        .map((track) => track.metadata?.genre)
        .filter((value): value is string => Boolean(value)),
    )],
    [tracks],
  );
  const aiPlatforms = useMemo(
    () => [...new Set(
      tracks
        .map((track) => track.metadata?.ai_platform)
        .filter((value): value is string => Boolean(value)),
    )],
    [tracks],
  );

  const releaseTitle =
    tracks.map((track) => metadataString(track, 'album')).find(Boolean) ??
    tracks.find((track) => track.album?.title)?.album?.title ??
    album.title;
  const releaseArtist = artists.join(' / ') || album.artist_name;
  const releaseDate =
    tracks.map((track) => metadataString(track, 'release_date')).find(Boolean) ??
    tracks.find((track) => track.release_date)?.release_date ??
    album.release_date;
  const metadataTrackCount = tracks.map((track) => metadataNumber(track, 'track_total')).find((value): value is number => value !== null);
  const trackCount = metadataTrackCount ?? tracks.length;
  const purpose = album.description?.trim() || 'No album purpose has been added to this release config yet.';
  const genreList = genres.length ? genres : album.metadata?.genre ? [String(album.metadata.genre)] : [];
  const platformList = aiPlatforms.length ? aiPlatforms : album.metadata?.ai_platform ? [String(album.metadata.ai_platform)] : [];

  const move = (direction: 1 | -1) => {
    setView((current) => (current + direction + VIEWS.length) % VIEWS.length);
  };

  return (
    <article className="album-carousel-card reveal">
      <header className="album-carousel-card__header">
        <div>
          <span className="eyebrow">{String(view + 1).padStart(2, '0')} / 04</span>
          <span className="album-carousel-card__view">{VIEWS[view]}</span>
        </div>
        <div className="album-carousel-card__controls">
          <button type="button" onClick={() => move(-1)} aria-label={'Previous ' + releaseTitle + ' detail'}>‹</button>
          <button type="button" onClick={() => move(1)} aria-label={'Next ' + releaseTitle + ' detail'}>›</button>
        </div>
      </header>

      {view === 0 && (
        <div className="album-carousel-card__overview">
          <div className="album-carousel-card__art">
            {album.cover_url ? <img src={album.cover_url} alt={releaseTitle + ' cover'} /> : <span>ATTIKID</span>}
          </div>
          <div className="album-carousel-card__body">
            <span className="mono-label">RELEASE</span>
            <h2><Link to={'/music/' + album.slug}>{releaseTitle}</Link></h2>
            <dl className="album-facts">
              <div><dt>Artist</dt><dd>{releaseArtist}</dd></div>
              <div><dt>Release date</dt><dd>{releaseDate ? new Date(releaseDate).getFullYear() : '—'}</dd></div>
              <div><dt>Tracks</dt><dd>{trackCount}</dd></div>
            </dl>
          </div>
        </div>
      )}

      {view === 1 && (
        <div className="album-carousel-card__body album-carousel-card__body--wide">
          <span className="mono-label">ALBUM PURPOSE</span>
          <h2>{releaseTitle}</h2>
          <p className="album-purpose">{purpose}</p>
        </div>
      )}

      {view === 2 && (
        <div className="album-carousel-card__body album-carousel-card__body--wide">
          <span className="mono-label">TRACK LIST / {trackCount} TRACKS</span>
          <div className="album-carousel-track-list">
            {tracks.length ? tracks
              .slice()
              .sort((a, b) => (a.track_number ?? Number.MAX_SAFE_INTEGER) - (b.track_number ?? Number.MAX_SAFE_INTEGER) || a.title.localeCompare(b.title))
              .map((track, index) => (
                <div className="album-carousel-track" key={track.id}>
                  <span>{String(track.track_number ?? index + 1).padStart(2, '0')}</span>
                  <strong>{metadataString(track, 'title') ?? track.title}</strong>
                  <span>{metadataString(track, 'artist') ?? track.artist_name}</span>
                  <span>{formatDuration(track.duration_seconds)}</span>
                </div>
              )) : <div className="empty-state">No tracks have been ingested for this release yet.</div>}
          </div>
        </div>
      )}

      {view === 3 && (
        <div className="album-carousel-card__body album-carousel-card__body--wide">
          <span className="mono-label">CREDITS / METADATA</span>
          <div className="credits-grid">
            <div><span>Artists</span><strong>{artists.join(' / ') || releaseArtist}</strong></div>
            <div><span>Genre</span><strong>{genreList.join(' / ') || 'Not supplied'}</strong></div>
            <div><span>AI platform</span><strong>{platformList.join(' / ') || 'Not supplied'}</strong></div>
          </div>
        </div>
      )}
    </article>
  );
}
