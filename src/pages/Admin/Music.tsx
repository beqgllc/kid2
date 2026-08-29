import { FormEvent, useEffect, useMemo, useState } from 'react';
import { getAlbums, getSongs } from '../../services/catalog';
import { deleteSong, ensureAlbum, updateSong, uploadSong } from '../../services/uploads';
import type { Album, Song } from '../../types/models';

export function Music() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('ATTIKID');
  const [albumTitle, setAlbumTitle] = useState('');
  const [release, setRelease] = useState('');
  const [track, setTrack] = useState('');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const load = () => Promise.all([getAlbums(), getSongs()]).then(([a, s]) => { setAlbums(a); setSongs(s); });
  useEffect(() => { load().catch(e => setMessage(e.message)); }, []);
  const filtered = useMemo(() => songs.filter(s => `${s.title} ${s.artist_name} ${s.album?.title ?? ''}`.toLowerCase().includes(query.toLowerCase())), [songs, query]);

  const chooseFiles = (incoming: FileList | null) => {
    const next = Array.from(incoming ?? []);
    if (next.length > 50) { setMessage('Bulk uploads are limited to 50 files per operation.'); setFiles(next.slice(0, 50)); return; }
    setFiles(next);
    if (next.length > 1) setTitle('');
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!files.length) return setMessage('Choose one or more audio files.');
    setBusy(true); setProgress(0); setMessage('Preparing upload…');
    try {
      let album = albums.find(a => a.title.toLowerCase() === albumTitle.trim().toLowerCase());
      if (!album) album = await ensureAlbum(albumTitle, artist, release || new Date().toISOString().slice(0, 10));
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const songTitle = files.length === 1 && title.trim() ? title.trim() : file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
        await uploadSong({ file, title: songTitle, artistName: artist, albumId: album.id, releaseDate: release || undefined, trackNumber: track ? Number(track) + i : undefined, onProgress: p => setProgress(Math.round(((i + p / 100) / files.length) * 100)) });
      }
      setMessage(`${files.length} upload${files.length === 1 ? '' : 's'} complete.`);
      setFiles([]); setTitle(''); await load();
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Upload failed.'); }
    finally { setBusy(false); }
  };

  const remove = async (s: Song) => { if (!confirm(`Delete ${s.title}?`)) return; setBusy(true); try { await deleteSong(s); await load(); } catch (err) { setMessage(err instanceof Error ? err.message : 'Delete failed.'); } finally { setBusy(false); } };

  return <section className="admin-page">
    <header className="admin-header"><div><span className="eyebrow">CATALOG</span><h1>Music</h1></div></header>
    <div className="admin-grid-two">
      <form className="admin-card" onSubmit={submit}>
        <h2>{files.length > 1 ? 'Bulk upload' : 'Upload song'}</h2>
        <label>Audio files (max 50)<input type="file" accept="audio/*" multiple onChange={e => chooseFiles(e.target.files)} /></label>
        {files.length > 0 && <div className="upload-file-list">{files.map(f => <div key={f.name + f.size}>{f.name}<span>{Math.round(f.size / 1024 / 1024 * 10) / 10} MB</span></div>)}</div>}
        {files.length === 1 && <label>Song title<input value={title} onChange={e => setTitle(e.target.value)} required /></label>}
        <label>Artist name<input value={artist} onChange={e => setArtist(e.target.value)} required /></label>
        <label>Album name<input value={albumTitle} onChange={e => setAlbumTitle(e.target.value)} required /></label>
        <label>Release date<input type="date" value={release} onChange={e => setRelease(e.target.value)} /></label>
        <label>Starting track number<input type="number" min="1" value={track} onChange={e => setTrack(e.target.value)} /></label>
        <button className="button" disabled={!files.length || busy}>{busy ? `Uploading ${progress}%…` : `Upload ${files.length > 1 ? `${files.length} files` : 'song'}`}</button>
        {busy && <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>}
        {message && <p className="muted">{message}</p>}
      </form>
      <div className="admin-card"><h2>Catalog</h2><input placeholder="Search…" value={query} onChange={e => setQuery(e.target.value)} /><div className="admin-list">{filtered.map(s => <SongEditor key={s.id} song={s} albums={albums} refresh={load} remove={() => remove(s)} />)}{!filtered.length && <p className="muted">No songs found.</p>}</div></div>
    </div>
  </section>;
}

function SongEditor({ song, albums, refresh, remove }: { song: Song; albums: Album[]; refresh: () => Promise<unknown>; remove: () => Promise<void> | void }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(song.title);
  const [artist, setArtist] = useState(song.artist_name);
  const [albumId, setAlbumId] = useState(song.album_id);
  const [release, setRelease] = useState(song.release_date ?? '');
  const [track, setTrack] = useState(song.track_number?.toString() ?? '');
  const save = async () => { await updateSong(song.id, { title, artist_name: artist, album_id: albumId, release_date: release || null, track_number: track ? Number(track) : null }); setEditing(false); await refresh(); };
  return <div className="admin-list-row admin-song-editor">
    {!editing ? <div><strong>{song.title}</strong><span>{song.album?.title ?? '—'} · {song.artist_name}</span></div> : <div className="editor-fields"><input value={title} onChange={e=>setTitle(e.target.value)} /><input value={artist} onChange={e=>setArtist(e.target.value)} /><select value={albumId} onChange={e=>setAlbumId(e.target.value)}>{albums.map(a=><option key={a.id} value={a.id}>{a.title}</option>)}</select><input type="date" value={release} onChange={e=>setRelease(e.target.value)} /><input type="number" min="1" value={track} onChange={e=>setTrack(e.target.value)} /></div>}
    <div className="button-row"><button onClick={()=>editing ? void save() : setEditing(true)}>{editing ? 'Save' : 'Edit'}</button><button onClick={()=>void remove()}>Delete</button></div>
  </div>;
}
