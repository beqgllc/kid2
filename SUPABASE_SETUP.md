# Supabase setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill in the project URL, publishable key, and admin email.
3. Run migrations `001_extensions.sql` through `017_fan_mail_submit.sql` in order.
4. Enable Anonymous Sign-Ins in Supabase Auth if using public likes/comments/play analytics.
5. Create the admin email/password account in Supabase Auth.
6. In SQL Editor, grant that user's profile an admin role:

```sql
update public.profiles
set role = 'admin'
where id = 'YOUR_AUTH_USER_UUID';
```

7. Confirm the `attikid-audio`, `attikid-artwork`, and `attikid-assets` buckets exist.
8. Run `npm install` and `npm run dev`.

For a public launch, enable CAPTCHA / rate-limiting protections appropriate to anonymous authentication and public write endpoints.
