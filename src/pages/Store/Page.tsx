import { Navigate } from 'react-router-dom';

export function Store() {
  return <Navigate to="/404?from=store" replace />;
}
