import { Link } from 'react-router-dom';
export function NotFound(){return <section className="center-page"><span className="eyebrow">404</span><h1>Signal lost.</h1><p>The page you're looking for doesn't exist.</p><div className="button-row"><Link className="button" to="/">Return home</Link><Link className="button secondary" to="/music">Music</Link></div></section>}
