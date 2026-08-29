import { requireSupabase } from '../lib/supabase/client';

export async function signInAdmin(username: string, password: string) {
  const supabase = requireSupabase();
  const configuredEmail = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;
  const email = username.includes('@') ? username : configuredEmail;
  if (!email) throw new Error('Admin email is not configured.');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  const supabase = requireSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const supabase = requireSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getMyProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (error) throw error;
  return data;
}
