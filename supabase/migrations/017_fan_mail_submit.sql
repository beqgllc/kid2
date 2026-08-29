-- Fan mail is submitted by the public client after anonymous sign-in.
-- Keep reads and moderation restricted to admins.
drop policy if exists fan_mail_insert on public.fan_mail;
create policy fan_mail_insert on public.fan_mail
for insert to authenticated
with check (auth.uid() is not null);