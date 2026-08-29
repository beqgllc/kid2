revoke all on table public.profiles, public.albums, public.songs, public.lyrics, public.reactions, public.comments, public.play_events, public.fan_mail from anon, authenticated;
revoke all on public.song_analytics, public.album_analytics, public.admin_analytics_summary from anon, authenticated;

grant select on public.albums, public.songs, public.lyrics, public.comments to anon, authenticated;
grant insert on public.comments, public.reactions, public.play_events, public.fan_mail to authenticated;
grant select, insert, update, delete on public.reactions to authenticated;
grant select on public.song_analytics, public.album_analytics, public.admin_analytics_summary to authenticated;
grant select, insert, update, delete on public.albums, public.songs, public.lyrics to authenticated;
grant select, update on public.comments to authenticated;
grant select, update, delete on public.fan_mail to authenticated;
grant select, update on public.profiles to authenticated;
