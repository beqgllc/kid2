import { Link } from 'react-router-dom';
import type { Album } from '../../types/models';
export function AlbumCard({album}:{album:Album}){return <Link className="album-card reveal" to={`/music/${album.slug}`}><div className="album-art">{album.cover_url?<img src={album.cover_url} alt={`${album.title} cover`}/>:<span>ATTIKID</span>}</div><div className="album-card-meta"><strong>{album.title}</strong><span>{album.artist_name} · {new Date(album.release_date).getFullYear()}</span></div></Link>}
