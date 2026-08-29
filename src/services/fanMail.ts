import { requireSupabase } from '../lib/supabase/client';
import { assertEmail, assertText } from '../lib/validation';
import type { FanMail } from '../types/models';

export async function sendFanMail(senderName: string, senderEmail: string, message: string) {
  const supabase = requireSupabase();
  const { error } = await supabase.from('fan_mail').insert({
    sender_name: senderName.trim().slice(0, 100) || null,
    sender_email: assertEmail(senderEmail).slice(0, 254) || null,
    message: assertText(message, 'Message', 1, 5000),
  });
  if (error) throw error;
}

export async function getFanMail() {
  const supabase = requireSupabase();
  const { data, error } = await supabase.from('fan_mail').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as FanMail[];
}

export async function markFanMailRead(id: string, read = true) {
  const supabase = requireSupabase();
  const { error } = await supabase.from('fan_mail').update({ is_read: read }).eq('id', id);
  if (error) throw error;
}

export async function deleteFanMail(id: string) {
  const supabase = requireSupabase();
  const { error } = await supabase.from('fan_mail').delete().eq('id', id);
  if (error) throw error;
}
