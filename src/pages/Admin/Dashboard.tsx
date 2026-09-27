import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSummary } from '../../services/analytics';
import { Loading } from '../../components/primitives/Loading';
import type { AnalyticsSummary } from '../../types/models';

export function Dashboard() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { getSummary().then(setData).catch((e) => setError(e.message)); }, []);

  return <section className="admin-page">
    <header className="admin-header">
      <div><span className="eyebrow">CONTROL CENTER</span><h1>Dashboard</h1></div>
      <p className="admin-header__description">Manage the complete ATTIKID archive from one place.</p>
    </header>
    {error ? <p className="form-error">{error}</p> : !data ? <Loading /> : <>
      <div className="stats-grid">
        {[['Songs', data.total_songs], ['Albums', data.total_albums], ['Plays', data.total_plays], ['Likes', data.total_likes], ['Dislikes', data.total_dislikes], ['Comments', data.total_comments], ['Unread mail', data.unread_fan_mail]].map(([label, value]) =>
          <div className="stat-card" key={label as string}><span>{label}</span><strong>{value as number}</strong></div>
        )}
      </div>
      <div className="admin-card admin-quick-actions">
        <div><span className="eyebrow">MEDIA CONTROL</span><h2>Archive tools</h2></div>
        <div className="admin-quick-actions__grid">
          <Link to="/admin/music">Music <span>Upload / edit / replace / delete</span></Link>
          <Link to="/admin/albums">Albums <span>Artwork / metadata / order</span></Link>
          <Link to="/admin/lyrics">Lyrics <span>Write / update song lyrics</span></Link>
          <Link to="/admin/videos">Videos <span>Upload / publish / delete visuals</span></Link>
          <Link to="/admin/comments">Comments <span>Moderate public discussion</span></Link>
          <Link to="/admin/analytics">Analytics <span>Plays / likes / comments</span></Link>
        </div>
      </div>
    </>}
  </section>;
}
