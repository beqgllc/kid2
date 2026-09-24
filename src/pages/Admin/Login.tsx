import { FormEvent, useEffect, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { signInAdmin } from '../../services/auth';

type AdminAuthModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

function AdminAuthForm({
  onClosed,
  onHandled,
}: {
  onClosed?: () => void;
  onHandled?: () => void;
}) {
  const [username, setUsername] = useState('attikidllc');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/admin';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInAdmin(username, password);
      onHandled?.();
      if (from === location.pathname) {
        window.location.reload();
        return;
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return <form className="auth-card" onSubmit={submit}>
    <div className="auth-card-mark" aria-hidden="true">A/</div>
    <span className="eyebrow">PRIVATE ACCESS / 00</span>
    <h1 id="admin-auth-title">Admin console</h1>
    <p className="auth-card-intro">Sign in to manage the ATTIKID archive.</p>
    <label>
      Username or email
      <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" placeholder="attikidllc" />
    </label>
    <label>
      Password
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="Enter your admin password" />
    </label>
    <div className="button-row">
      <button className="button" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Enter console'}</button>
      {onClosed && <button type="button" className="button secondary" onClick={onClosed}>Cancel</button>}
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
  </form>;
}

export function AdminAuthModal({ open, onClose, onSuccess }: AdminAuthModalProps) {
  const [shouldShow, setShouldShow] = useState(open);

  useEffect(() => {
    setShouldShow(open);
  }, [open]);

  if (!shouldShow) return null;

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="admin-auth-title" onClick={onClose}>
      <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
        <div className="admin-modal-header">
          <span className="eyebrow">PRIVATE ACCESS</span>
          <button type="button" className="modal-close" aria-label="Close admin access" onClick={onClose}>×</button>
        </div>
        <AdminAuthForm
          onClosed={onClose}
          onHandled={() => {
            onSuccess?.();
            onClose();
          }}
        />
      </div>
    </div>
  );
}

export function AdminLogin() {
  const navigate = useNavigate();
  return <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="admin-auth-title">
    <div className="admin-modal admin-login-modal">
      <div className="admin-modal-header">
        <span className="eyebrow">ATTIKID / ADMIN</span>
        <button type="button" className="modal-close" aria-label="Return to site" onClick={() => navigate('/')}>×</button>
      </div>
      <AdminAuthForm onClosed={() => navigate('/')} />
    </div>
  </div>;
}

export function AdminLoginEntry() {
  return <Navigate to="/admin" replace />;
}
