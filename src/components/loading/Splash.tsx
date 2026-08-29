import { useEffect, useState } from 'react';
export function Splash({ready}:{ready:boolean}){const [done,setDone]=useState(false);useEffect(()=>{const t=window.setTimeout(()=>setDone(true), ready?450:2400);return()=>clearTimeout(t)},[ready]);if(done)return null;return <div className="splash"><div className="splash-mark">ATTIKID</div><div className="splash-line"/></div>}
