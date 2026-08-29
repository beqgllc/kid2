create policy albums_public_read on public.albums for select to anon, authenticated using (true);
create policy albums_admin_insert on public.albums for insert to authenticated with check (public.is_admin());
create policy albums_admin_update on public.albums for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy albums_admin_delete on public.albums for delete to authenticated using (public.is_admin());

create policy songs_public_read on public.songs for select to anon, authenticated using (true);
create policy songs_admin_insert on public.songs for insert to authenticated with check (public.is_admin());
create policy songs_admin_update on public.songs for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy songs_admin_delete on public.songs for delete to authenticated using (public.is_admin());

create policy lyrics_public_read on public.lyrics for select to anon, authenticated using (true);
create policy lyrics_admin_insert on public.lyrics for insert to authenticated with check (public.is_admin());
create policy lyrics_admin_update on public.lyrics for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy lyrics_admin_delete on public.lyrics for delete to authenticated using (public.is_admin());

create policy reactions_read_own_or_admin on public.reactions for select to authenticated using (visitor_id = auth.uid() or public.is_admin());
create policy reactions_insert_own on public.reactions for insert to authenticated with check (visitor_id = auth.uid() and not public.is_admin());
create policy reactions_update_own on public.reactions for update to authenticated using (visitor_id = auth.uid()) with check (visitor_id = auth.uid());
create policy reactions_delete_own on public.reactions for delete to authenticated using (visitor_id = auth.uid());

create policy comments_public_read on public.comments for select to anon, authenticated using (true);
create policy comments_insert_own on public.comments for insert to authenticated with check (visitor_id = auth.uid() and not public.is_admin());
create policy comments_update_admin on public.comments for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy comments_delete_admin on public.comments for delete to authenticated using (public.is_admin());

create policy play_events_insert on public.play_events for insert to authenticated with check (visitor_id = auth.uid() or visitor_id is null);
create policy play_events_admin_read on public.play_events for select to authenticated using (public.is_admin());

create policy fan_mail_insert on public.fan_mail for insert to authenticated with check (not public.is_admin());
create policy fan_mail_admin_read on public.fan_mail for select to authenticated using (public.is_admin());
create policy fan_mail_admin_update on public.fan_mail for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy fan_mail_admin_delete on public.fan_mail for delete to authenticated using (public.is_admin());

create policy profiles_read_self on public.profiles for select to authenticated using (id=auth.uid());
create policy profiles_update_self on public.profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid());
