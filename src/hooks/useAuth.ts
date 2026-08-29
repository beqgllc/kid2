import { useEffect, useState } from 'react';
import { requireSupabase } from '../lib/supabase/client';
import { ensureAnonymousSession } from '../utils/visitor';

export function useSessionBootstrap() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const supabase = requireSupabase();
        const { data } = await supabase.auth.getSession();
        if (!data.session && (import.meta.env.VITE_ENABLE_ANONYMOUS_AUTH ?? 'true') !== 'false') await ensureAnonymousSession();
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Initialization failed.');
      } finally { if (mounted) setReady(true); }
    })();
    return () => { mounted = false; };
  }, []);
  return { ready, error };
}
