import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMyProfile } from '../../services/auth';
import { AdminLogin } from './Login';
export function RequireAdmin(){
  const [state,setState]=useState<'loading'|'allowed'|'denied'>('loading');
  const location=useLocation();
  const navigate=useNavigate();

  useEffect(()=>{
    getMyProfile()
      .then(p=>setState(p?.role==='admin'?'allowed':'denied'))
      .catch(()=>setState('denied'));
  },[]);

  useEffect(()=>{
    if(state==='denied' && location.pathname!=='/admin'){
      navigate('/admin',{replace:true,state:{from:location.pathname}});
    }
  },[location.pathname,navigate,state]);

  if(state==='loading' || (state==='denied' && location.pathname!=='/admin')){
    return <div className="center-page"><div className="loading-state">Checking authorization…</div></div>;
  }
  if(state==='denied') return <AdminLogin/>;
  return <Outlet/>;
}
