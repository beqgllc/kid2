import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Song } from '../../types/models';

type AlbumOption = { id: string; slug: string; title: string };

type MusicSearchProps = {
  query: string;
  songs: Song[];
  albums?: AlbumOption[];
  onQueryChange: (query: string) => void;
  mode: 'albums' | 'songs';
};

export function MusicSearch({ query, songs, albums = [], onQueryChange, mode }: MusicSearchProps) {
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const matches = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return { songMatches: [], albumMatches: [] };
    const songMatches = songs.filter((song) => song.title.toLowerCase().includes(value)).slice(0, 6);
    const albumMatches = albums.filter((album) => album.title.toLowerCase().includes(value)).slice(0, 3);
    return { songMatches, albumMatches };
  }, [albums, query, songs]);

  return (
    <div className="music-search music-search--sticky" role="search">
      <label htmlFor={`music-title-search-${mode}`}>{mode === 'songs' ? 'FIND A SONG' : 'SEARCH RELEASES OR SONGS'}</label>
      <input
        id={`music-title-search-${mode}`}
        className="search-input"
        type="search"
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={suggestionsOpen && Boolean(query.trim())}
        aria-controls={`music-title-suggestions-${mode}`}
        placeholder="Start typing a title…"
        value={query}
        onFocus={() => setSuggestionsOpen(true)}
        onChange={(event) => { onQueryChange(event.target.value); setSuggestionsOpen(true); }}
      />
      {suggestionsOpen && query.trim() && matches && (
        <div className="music-search__suggestions" id={`music-title-suggestions-${mode}`} role="listbox">
          {matches.songMatches.map((song) => (
            <Link role="option" aria-selected="false" key={song.id} to={`/song/${song.slug}`} onClick={() => setSuggestionsOpen(false)}>
              <span>SONG</span>{song.title}<b>↗</b>
            </Link>
          ))}
          {matches.albumMatches.map((album) => (
            <Link role="option" aria-selected="false" key={album.id} to={`/music/${album.slug}`} onClick={() => setSuggestionsOpen(false)}>
              <span>RELEASE</span>{album.title}<b>↗</b>
            </Link>
          ))}
          {!matches.songMatches.length && !matches.albumMatches.length && <p>No matching titles yet.</p>}
        </div>
      )}
    </div>
  );
}
