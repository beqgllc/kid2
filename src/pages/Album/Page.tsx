import { useParams, Link } from 'react-router-dom';
import { useAlbum, useSongs } from '../../hooks/useCatalog';
import { SongRow } from '../../components/music/SongRow';
import { usePlayerStore } from '../../stores/playerStore';
import { buildAlbumJsonLd, buildWebSiteJsonLd, usePageMeta } from '../../lib/seo';
export function Album(){
  const {albumSlug=''}=useParams();
  const album=useAlbum(albumSlug);
  const songs=useSongs(album.data?.id);
  const set=usePlayerStore(s=>s.set);
  const playAlbum=()=>{const q=songs.data.filter(s=>s.audio_url) as any;if(!q.length)return;set({queue:q,currentSong:q[0],currentIndex:0,isPlaying:true,status:'loading',error:null})};

  usePageMeta({
    title: album.data ? `${album.data.title} — ATTIKID Album` : 'ATTIKID Album',
    description: album.data?.description ?? 'Listen to an ATTIKID album from the catalog.',
    canonical: album.data ? `https://attikid.vercel.app/music/${album.data.slug}` : 'https://attikid.vercel.app/music',
    type: 'music.album',
    keywords: album.data ? ['ATTIKID', album.data.title, 'album', 'music'] : ['ATTIKID', 'album', 'music'],
    image: album.data?.cover_url ?? '/images/hero/hero-home.webp',
    jsonLd: album.data ? buildAlbumJsonLd(album.data) : buildWebSiteJsonLd()
  });

  if(album.loading)return <div className="page"><div className="loading-state">Loading release…</div></div>;
  if(!album.data)return <div className="center-page"><h1>Release not found.</h1><Link className="button" to="/music">Back to music</Link></div>;

  return <div className="page"><section className="album-hero"><div className="album-hero-art">{album.data.cover_url?<img src={album.data.cover_url} alt={`${album.data.title} by ATTIKID album art`}/>:<span>ATTIKID</span>}</div><div><span className="eyebrow">ALBUM</span><h1>{album.data.title}</h1><p>{album.data.artist_name} · {new Date(album.data.release_date).getFullYear()}</p>{album.data.description&&<p className="muted">{album.data.description}</p>}<button className="button" onClick={playAlbum} disabled={!songs.data.length}>Play album</button></div></section><section className="content-section"><div className="song-list">{songs.loading?<div className="loading-state">Loading tracks…</div>:songs.data.map((s,i)=><SongRow key={s.id} song={s} index={i} songs={songs.data}/>)}</div></section></div>}
