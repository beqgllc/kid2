import { useEffect, useState } from 'react';

export function Splash({ ready }: { ready: boolean }) {
	const [phase, setPhase] = useState<'splash' | 'loader' | 'exit' | 'done'>('splash');

	useEffect(() => {
		const timer = window.setTimeout(() => setPhase('loader'), 5000);
		return () => window.clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (phase !== 'loader' || !ready) return;
		const timer = window.setTimeout(() => setPhase('exit'), 2000);
		return () => window.clearTimeout(timer);
	}, [phase, ready]);

	useEffect(() => {
		if (phase !== 'exit') return;
		const timer = window.setTimeout(() => setPhase('done'), 600);
		return () => window.clearTimeout(timer);
	}, [phase]);

	if (phase === 'done') return null;
	return <div className={`kid-splash-container kid-splash-${phase}`} role="status" aria-label={phase === 'loader' ? 'Loading ATTIKID' : undefined}>
		{phase === 'splash' || phase === 'exit' ? <>
			<div className="kid-splash" aria-hidden="true">
				<div className="kid-splash-logo">K!D</div>
				<div className="kid-splash-svg"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><rect width="100" height="100" /></svg></div>
				<div className="kid-splash-minimize"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><rect width="100" height="100" /></svg></div>
			</div>
			<div className="kid-splash-text" aria-hidden="true">
				<div className="kid-splash-text-line1">ATTIKID MUSIC</div>
				<div className="kid-splash-text-line2">YOU ARE NOT ALONE</div>
			</div>
		</> : <div className="music-loader" aria-hidden="true">
			<div className="line line1" />
			<div className="line line2" />
			<div className="line line3" />
		</div>}
	</div>;
}
