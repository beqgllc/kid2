import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { getSongs } from '../../services/catalog';
import { deleteLyricVideo, getAdminLyricVideos, updateLyricVideo, uploadLyricVideo } from '../../services/adminVideos';
import type { LyricVideo, Song } from '../../types/models';

export function VideosAdmin() {
  const [videos, setVideos] = useState<LyricVideo[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const [items, catalog] = await Promise.all([getAdminLyricVideos(), getSongs()]);
    setVideos(items);
    setSongs(catalog);
  };

  useEffect(() => { void load().catch((error) => setMessage(error instanceof Error ? error.message : 'Unable to load videos.')); }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return videos.filter((video) => !needle || `${video.title} ${video.song?.title ?? ''}`.toLowerCase().includes(needle));
  }, [videos, query]);

  return <section className="admin-page">
    <header className="admin-header">
      <div><span className="eyebrow">VISUAL ARCHIVE</span><h1>Videos</h1></div>
      <button className="button" type="button" onClick={() => setCreating(true)}>Upload video</button>
    </header>

    <div className="admin-toolbar admin-card">
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search videos or songs…" aria-label="Search videos" />
      <span className="admin-toolbar__count">{filtered.length} videos</span>
    </div>

    {message && <p className="muted">{message}</p>}

    <div className="admin-card admin-video-grid">
      {filtered.length ? filtered.map((video) =>
        <VideoEditor key={video.id} video={video} songs={songs} onSaved={async () => { await load(); }} onDeleted={async () => { await load(); }} />
      ) : <p className="muted">No videos found.</p>}
    </div>

    {creating && <VideoUploadModal songs={songs} onClose={() => setCreating(false)} onCreated={async () => { setCreating(false); await load(); }} />}
  </section>;
}

function VideoUploadModal({ songs, onClose, onCreated }: { songs: Song[]; onClose: () => void; onCreated: () => Promise<void> }) {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [songId, setSongId] = useState('');
  const [title, setTitle] = useState('');
  const [published, setPublished] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file || !songId) return;
    setBusy(true); setError('');
    try {
      await uploadLyricVideo({ file, thumbnail, songId, title: title.trim() || songs.find((song) => song.id === songId)?.title || 'ATTIKID Visual', published });
      await onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload video.');
    } finally { setBusy(false); }
  };

  return <div className="admin-modal-overlay" role="dialog" aria-modal="true">
    <form className="admin-modal" onSubmit={submit}>
      <div className="admin-modal-header"><div><span className="eyebrow">NEW VISUAL</span><h2>Upload video</h2></div><button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button></div>
      <label>Song<select value={songId} onChange={(event) => setSongId(event.target.value)} required><option value="">Select a song…</option>{songs.map((song) => <option key={song.id} value={song.id}>{song.title}</option>)}</select></label>
      <label>Video title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Let me fly — lyric video" /></label>
      <label>Video file<input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(event) => setFile(event.target.files?.[0] ?? null)} required /></label>
      <label>Thumbnail<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setThumbnail(event.target.files?.[0] ?? null)} /></label>
      <label className="checkbox"><input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} /> Publish immediately</label>
      {error && <p className="form-error">{error}</p>}
      <div className="button-row"><button className="button" disabled={busy || !file || !songId}>{busy ? 'Uploading…' : 'Upload video'}</button><button type="button" className="button secondary" onClick={onClose}>Cancel</button></div>
    </form>
  </div>;
}

function VideoEditor({ video, songs, onSaved, onDeleted }: { video: LyricVideo; songs: Song[]; onSaved: () => Promise<void>; onDeleted: () => Promise<void> }) {
  const [title, setTitle] = useState(video.title);
  const [songId, setSongId] = useState(video.song_id);
  const [published, setPublished] = useState(video.published);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setBusy(true); setError('');
    try {
      await updateLyricVideo(video.id, { title: title.trim() || video.title, song_id: songId, published });
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save video.');
    } finally { setBusy(false); }
  };

  const remove = async () => {
    if (!confirm(`Delete ${video.title}? This removes the video file permanently.`)) return;
    setBusy(true); setError('');
    try { await deleteLyricVideo(video); await onDeleted(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to delete video.'); }
    finally { setBusy(false); }
  };

  return <article className="admin-video-card">
    <div className="admin-video-card__preview">
      {video.video_url ? <video controls preload="metadata" poster={video.thumbnail_url ?? undefined}><source src={video.video_url} type={video.video_mime_type} /></video> : <span>NO PREVIEW</span>}
    </div>
    <div className="admin-video-card__body">
      <span className="portfolio-label">{video.published ? 'PUBLISHED' : 'DRAFT'}</span>
      <input value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Video title" />
      <select value={songId} onChange={(event) => setSongId(event.target.value)} aria-label="Video song">{songs.map((song) => <option key={song.id} value={song.id}>{song.title}</option>)}</select>
      <label className="checkbox"><input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} /> Published</label>
      {error && <p className="form-error">{error}</p>}
      <div className="button-row"><button disabled={busy} onClick={() => void save()}>{busy ? 'Saving…' : 'Save'}</button><button disabled={busy} onClick={() => void remove()}>Delete</button></div>
    </div>
  </article>;
}
