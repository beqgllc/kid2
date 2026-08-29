insert into storage.buckets (id,name,public) values ('attikid-audio','attikid-audio',true) on conflict (id) do update set public=true;
insert into storage.buckets (id,name,public) values ('attikid-artwork','attikid-artwork',true) on conflict (id) do update set public=true;
insert into storage.buckets (id,name,public) values ('attikid-assets','attikid-assets',true) on conflict (id) do update set public=true;

drop policy if exists audio_public_read on storage.objects;
create policy audio_public_read on storage.objects for select to public using (bucket_id='attikid-audio');
drop policy if exists audio_admin_insert on storage.objects;
create policy audio_admin_insert on storage.objects for insert to authenticated with check (bucket_id='attikid-audio' and public.is_admin());
drop policy if exists audio_admin_update on storage.objects;
create policy audio_admin_update on storage.objects for update to authenticated using (bucket_id='attikid-audio' and public.is_admin());
drop policy if exists audio_admin_delete on storage.objects;
create policy audio_admin_delete on storage.objects for delete to authenticated using (bucket_id='attikid-audio' and public.is_admin());

create policy artwork_public_read on storage.objects for select to public using (bucket_id='attikid-artwork');
create policy artwork_admin_write on storage.objects for all to authenticated using (bucket_id='attikid-artwork' and public.is_admin()) with check (bucket_id='attikid-artwork' and public.is_admin());
create policy assets_public_read on storage.objects for select to public using (bucket_id='attikid-assets');
create policy assets_admin_write on storage.objects for all to authenticated using (bucket_id='attikid-assets' and public.is_admin()) with check (bucket_id='attikid-assets' and public.is_admin());
