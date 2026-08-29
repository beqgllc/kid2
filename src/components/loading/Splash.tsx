import { useEffect, useState, type CSSProperties } from 'react';
const letters = [...'ATTIKID'];

export function Splash({ ready }: { ready: boolean }) {
	const [done, setDone] = useState(false);
	useEffect(() => {
		const timer = window.setTimeout(() => setDone(true), ready ? 2600 : 2400);
		return () => window.clearTimeout(timer);
	}, [ready]);
	if (done) return null;
	return <div className="splash" role="status" aria-label="Loading ATTIKID">
		<div className="splash-logo" aria-hidden="true">
			{letters.map((letter, index) => <span key={`${letter}-${index}`} style={{ '--letter-index': index } as CSSProperties}>{letter}</span>)}
		</div>
		<div className="splash-line" aria-hidden="true" />
		<span className="splash-status">initializing</span>
	</div>;
}
