import { useEffect, useState } from 'react';

// Adapted from the reference splash animation:
// 0.0s  — Black overlay covers full screen
// 1.0s  — Overlay clips to center box (0.2s)
// 1.2s  — Center box fades transparent (1.3s)
// 1.5s  — "K!D" logo appears, color white→black (0.3s)
// 2.7s  — Orange SVG expands via clip-path polygon (0.7s) → full screen
// 3.2s  — Logo fades out (0.6s)
// 3.7s  — "ATTIKID MUSIC" / "YOU ARE NOT ALONE" fade in (0.6s)
// 4.5s  — Entire splash container fades to opacity 0 (0.8s)
// 5.4s  — onComplete() called → site appears


export function Splash({ ready }: { ready: boolean }) {
	const [phase, setPhase] = useState<'splash' | 'loader' | 'exit' | 'done'>('splash');
}