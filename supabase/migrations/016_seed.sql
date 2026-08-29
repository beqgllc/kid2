insert into public.albums (title, artist_name, release_date, slug, description)
values ('First Transmission','ATTIKID',current_date,'first-transmission','Placeholder release. Replace with real catalog data through the admin console.')
on conflict (slug) do nothing;
