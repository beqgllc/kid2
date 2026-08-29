create or replace view public.song_analytics as
select
  s.id as song_id,
  coalesce((select count(*) from public.play_events p where p.song_id=s.id),0)::bigint as play_count,
  coalesce((select count(*) from public.reactions r where r.song_id=s.id and r.reaction='like'),0)::bigint as like_count,
  coalesce((select count(*) from public.reactions r where r.song_id=s.id and r.reaction='dislike'),0)::bigint as dislike_count,
  coalesce((select count(*) from public.comments c where c.song_id=s.id),0)::bigint as comment_count
from public.songs s;

create or replace view public.album_analytics as
select
  a.id as album_id,
  coalesce((select count(*) from public.play_events p join public.songs s on s.id=p.song_id where s.album_id=a.id),0)::bigint as play_count,
  coalesce((select count(*) from public.reactions r join public.songs s on s.id=r.song_id where s.album_id=a.id and r.reaction='like'),0)::bigint as like_count,
  coalesce((select count(*) from public.reactions r join public.songs s on s.id=r.song_id where s.album_id=a.id and r.reaction='dislike'),0)::bigint as dislike_count,
  coalesce((select count(*) from public.comments c join public.songs s on s.id=c.song_id where s.album_id=a.id),0)::bigint as comment_count
from public.albums a;

create or replace view public.admin_analytics_summary as
select
  (select count(*) from public.songs)::bigint as total_songs,
  (select count(*) from public.albums)::bigint as total_albums,
  (select count(*) from public.play_events)::bigint as total_plays,
  (select count(*) from public.reactions where reaction='like')::bigint as total_likes,
  (select count(*) from public.reactions where reaction='dislike')::bigint as total_dislikes,
  (select count(*) from public.comments)::bigint as total_comments,
  (select count(*) from public.fan_mail where is_read=false)::bigint as unread_fan_mail;
