insert into storage.buckets (id,name,public)
values ('attikid-videos','attikid-videos',true)
on conflict (id) do update set public=true;

drop policy if exists videos_public_read on storage.objects;
create policy videos_public_read
on storage.objects
for select
to public
using (bucket_id='attikid-videos');

drop policy if exists videos_admin_write on storage.objects;
create policy videos_admin_write
on storage.objects
for all
to authenticated
using (bucket_id='attikid-videos' and public.is_admin())
with check (bucket_id='attikid-videos' and public.is_admin());
