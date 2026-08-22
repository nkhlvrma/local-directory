# Supabase setup

1. Create a new Supabase project at https://supabase.com/dashboard.
2. In the SQL Editor, paste and run `schema.sql`.
3. Copy `../.env.example` to `../.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Settings → API → service_role. Server-only.)
4. Create your admin account:
   - Authentication → Users → "Add user" → enter your email + password.
   - Then in the SQL Editor:
     ```sql
     insert into admin_users (user_id)
     select id from auth.users where email = 'you@example.com';
     ```
5. Storage (optional for listing photos):
   - Storage → Create bucket `listing-photos`, set it public.
