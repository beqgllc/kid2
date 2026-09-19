import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMyProfile } from '../../services/auth';
import { AdminLogin } from './Login';
export function RequireAdmin(){const [state,setState]=useState<'loading'|'allowed'|'denied'>('loading');useEffect(()=>{getMyProfile().then(p=>setState(p?.role==='admin'?'allowed':'denied')).catch(()=>setState('denied'))},[]);if(state==='loading')return <div className="center-page"><div className="loading-state">Checking authorization…</div></div>;if(state==='denied')return <AdminLogin/>;return <Outlet/>}
