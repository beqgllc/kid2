import { useEffect, useMemo, useState } from 'react';
import { deleteComment, getAllComments, updateComment } from '../../services/comments';
import { getSongs } from '../../services/catalog';
import type { Comment, Song } from '../../types/models';
import { formatDateTime } from '../../lib/utils';

type AdminComment = Comment & { song?: { title: string; slug: string } | null };

export function CommentsAdmin() {
  const [items, setItems] = useState<AdminComment[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [query, setQuery] = useState('');
  const [songFilter, setSongFilter] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [comments, catalog] = await Promise.all([getAllComments(), getSongs()]);
      setItems(comments);
      setSongs(catalog);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load comments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSong = !songFilter || item.song_id === songFilter;
      const haystack = `${item.display_name ?? ''} ${item.content} ${item.song?.title ?? ''}`.toLowerCase();
      return matchesSong && (!needle || haystack.includes(needle));
    });
  }, [items, query, songFilter]);

  return <section className="admin-page">
    <header className="admin-header">
      <div><span className="eyebrow">COMMUNITY</span><h1>Comments</h1></div>
      <p className="admin-header__description">Moderate, edit, and remove public comments across the ATTIKID catalog.</p>
    </header>

    <div className="admin-toolbar admin-card">
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search comments, names, or songs…" aria-label="Search comments" />
      <select value={songFilter} onChange={(event) => setSongFilter(event.target.value)} aria-label="Filter by song">
        <option value="">All songs</option>
        {songs.map((song) => <option key={song.id} value={song.id}>{song.title}</option>)}
      </select>
      <span className="admin-toolbar__count">{filtered.length} visible</span>
    </div>

    {message && <p className="muted">{message}</p>}
    <div className="admin-card admin-comments-list">
      {loading ? <p className="muted">Loading comments…</p> : filtered.length ? filtered.map((item) =>
        <CommentEditor key={item.id} comment={item} onSaved={load} onDeleted={load} />
      ) : <p className="muted">No comments match this filter.</p>}
    </div>
  </section>;
}

function CommentEditor({ comment, onSaved, onDeleted }: { comment: AdminComment; onSaved: () => Promise<void>; onDeleted: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(comment.display_name ?? 'Anonymous');
  const [content, setContent] = useState(comment.content);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setBusy(true); setError('');
    try {
      await updateComment(comment.id, { display_name: name.trim().slice(0, 80) || 'Anonymous', content });
      setEditing(false);
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save comment.');
    } finally { setBusy(false); }
  };

  const remove = async () => {
    if (!confirm('Delete this comment permanently?')) return;
    setBusy(true); setError('');
    try {
      await deleteComment(comment.id);
      await onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete comment.');
    } finally { setBusy(false); }
  };

  return <article className="admin-comment-row">
    <div className="admin-comment-row__meta">
      <strong>{comment.song?.title ?? 'Unknown song'}</strong>
      <span>{comment.display_name || 'Anonymous'} · {formatDateTime(comment.created_at)}</span>
    </div>
    {editing ? <div className="admin-comment-row__editor">
      <input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} aria-label="Comment display name" />
      <textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={2000} rows={4} aria-label="Comment content" />
    </div> : <p>{comment.content}</p>}
    {error && <p className="form-error">{error}</p>}
    <div className="button-row">
      <button disabled={busy} onClick={() => editing ? void save() : setEditing(true)}>{editing ? (busy ? 'Saving…' : 'Save') : 'Edit'}</button>
      {editing && <button disabled={busy} className="button secondary" onClick={() => { setEditing(false); setName(comment.display_name ?? 'Anonymous'); setContent(comment.content); }}>Cancel</button>}
      <button disabled={busy} onClick={() => void remove()}>Delete</button>
    </div>
  </article>;
}
