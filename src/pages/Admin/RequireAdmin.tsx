import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMyProfile } from '../../services/auth';
export function RequireAdmin(){const [state,setState]=useState<'loading'|'allowed'|'denied'>('loading');const location=useLocation();useEffect(()=>{getMyProfile().then(p=>setState(p?.role==='admin'?'allowed':'denied')).catch(()=>setState('denied'))},[]);if(state==='loading')return <div className="center-page"><div className="loading-state">Checking authorization…</div></div>;if(state==='denied')return <Navigate to="/admin/login" state={{from:location.pathname}} replace/>;return <Outlet/>}
