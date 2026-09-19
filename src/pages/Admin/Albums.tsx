import { useEffect, useState, type FormEvent } from 'react';
import { getAlbums, getSongs } from '../../services/catalog';
import { connectSongsToAlbum, deleteAlbum, ensureAlbum, updateAlbum, updateSong, uploadAlbumArtwork } from '../../services/uploads';
import type { Album, Song } from '../../types/models';

export function Albums() {
  const [items, setItems] = useState<Album[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const load = () => Promise.all([getAlbums(), getSongs()]).then(([albums, tracks]) => { setItems(albums); setSongs(tracks); }).catch((e) => setError(e.message));

  useEffect(() => { void load(); }, []);

  return <section className="admin-page">
    <header className="admin-header"><div><span className="eyebrow">RELEASES</span><h1>Albums</h1></div><button className="button" onClick={() => setCreating(true)}>+</button></header>
    {error && <p className="form-error">{error}</p>}
    <div className="admin-card"><div className="admin-list">{items.map((album) => <AlbumEditor key={album.id} album={album} songs={songs} refresh={load} />)}</div></div>
    {creating && <AlbumModal songs={songs} onClose={() => setCreating(false)} onCreated={async () => { setCreating(false); await load(); }} />}
  </section>;
}

function AlbumModal({ songs, onClose, onCreated }: { songs: Song[]; onClose: () => void; onCreated: () => Promise<void> }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [artist, setArtist] = useState('ATTIKID');
  const [featuredArtist, setFeaturedArtist] = useState('');
  const [artwork, setArtwork] = useState<File | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const availableSongs = songs.filter((song) => !selected.includes(song.id));

  const move = (index: number, direction: -1 | 1) => {
    const next = [...selected];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSelected(next);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const album = await ensureAlbum(title, artist, date, featuredArtist);
      if (artwork) await uploadAlbumArtwork(album.id, artwork);
      await connectSongsToAlbum(album.id, selected);
      await onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create album.');
    } finally { setBusy(false); }
  };

  return <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="new-album-title">
    <form className="admin-modal album-modal" onSubmit={submit}>
      <div className="admin-modal-header"><div><span className="eyebrow">NEW RELEASE</span><h2 id="new-album-title">Add album</h2></div><button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button></div>
      <label>Album name<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
      <label>Release date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></label>
      <label>Artist name<input value={artist} onChange={(e) => setArtist(e.target.value)} required /></label>
      <label>Featured artist(s)<input value={featuredArtist} onChange={(e) => setFeaturedArtist(e.target.value)} placeholder="Optional" /></label>
      <label>+ Upload album artwork (PNG/JPEG/JPG)<input type="file" accept="image/png,image/jpeg,.jpg,.jpeg,.png" onChange={(e) => setArtwork(e.target.files?.[0] ?? null)} /></label>
      <fieldset className="album-connect"><legend>Connect songs to this album</legend>
        <select aria-label="Add uploaded song" value="" onChange={(e) => e.target.value && setSelected([...selected, e.target.value])}><option value="">Select an uploaded song…</option>{availableSongs.map((song) => <option key={song.id} value={song.id}>{song.title}</option>)}</select>
        {selected.map((id, index) => { const song = songs.find((item) => item.id === id); return <div className="album-selected-song" key={id}><span>{index + 1}. {song?.title}</span><span><button type="button" onClick={() => move(index, -1)} disabled={index === 0}>↑</button><button type="button" onClick={() => move(index, 1)} disabled={index === selected.length - 1}>↓</button><button type="button" onClick={() => setSelected(selected.filter((item) => item !== id))}>Remove</button></span></div>; })}
      </fieldset>
      {error && <p className="form-error">{error}</p>}
      <div className="button-row"><button className="button" disabled={busy}>{busy ? 'Creating…' : 'Create album'}</button><button type="button" className="button secondary" onClick={onClose}>Cancel</button></div>
    </form>
  </div>;
}

function AlbumEditor({ album, songs, refresh }: { album: Album; songs: Song[]; refresh: () => Promise<void> }) {
  const [title, setTitle] = useState(album.title);
  const [date, setDate] = useState(album.release_date);
  const [featured, setFeatured] = useState(album.is_featured);
  const [artwork, setArtwork] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const connected = songs.filter((song) => song.album_id === album.id).sort((a, b) => (a.track_number ?? 999) - (b.track_number ?? 999));
  const save = async () => { setBusy(true); try { await updateAlbum(album.id, { title, release_date: date, is_featured: featured }); setMessage('Album saved.'); await refresh(); } catch (err) { setMessage(err instanceof Error ? err.message : 'Unable to save album.'); } finally { setBusy(false); } };
  const uploadArtwork = async () => { if (!artwork) return; setBusy(true); try { await uploadAlbumArtwork(album.id, artwork); setArtwork(null); setMessage('Cover art uploaded.'); await refresh(); } catch (err) { setMessage(err instanceof Error ? err.message : 'Unable to upload cover art.'); } finally { setBusy(false); } };
  const reorder = async (index: number, direction: -1 | 1) => { const next = [...connected]; const target = index + direction; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target], next[index]]; setBusy(true); try { await Promise.all(next.map((song, position) => updateSong(song.id, { track_number: position + 1 }))); await refresh(); } finally { setBusy(false); } };
  const remove = async () => { if (!confirm(`Delete ${album.title}?`)) return; setBusy(true); try { await deleteAlbum(album.id); await refresh(); } finally { setBusy(false); } };
  return <div className="admin-list-row admin-album-editor"><div className="editor-fields"><input value={title} onChange={(e) => setTitle(e.target.value)} /><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /><label className="checkbox"><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Featured</label><label>Cover art<input type="file" accept="image/jpeg,image/png" onChange={(e) => setArtwork(e.target.files?.[0] ?? null)} /></label><div className="admin-album-tracks"><strong>Track list</strong>{connected.length ? connected.map((song, index) => <div key={song.id}><span>{index + 1}. {song.title}</span><span>{song.duration_seconds ? `${Math.floor(song.duration_seconds / 60)}:${String(Math.floor(song.duration_seconds % 60)).padStart(2, '0')}` : '—'} <button onClick={() => void reorder(index, -1)} disabled={busy || index === 0}>↑</button><button onClick={() => void reorder(index, 1)} disabled={busy || index === connected.length - 1}>↓</button></span></div>) : <span className="muted">No songs connected.</span>}</div>{message && <span className="muted">{message}</span>}</div><div className="button-row"><button onClick={() => void save()} disabled={busy}>Save</button><button onClick={() => void uploadArtwork()} disabled={busy || !artwork}>Upload cover</button><button onClick={() => void remove()} disabled={busy}>Delete</button></div></div>;
}
