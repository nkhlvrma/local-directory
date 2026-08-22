# Local Directory

A hyperlocal, WhatsApp-native directory of neighborhood businesses. Built with Next.js 15 (App Router), Tailwind, and Supabase.

## Stack

- Next.js 15, React 19, TypeScript, Tailwind v4
- Supabase (Postgres, Auth, RLS)
- Deploy target: Vercel

## Setup

### 1. Supabase

1. Create a project at https://supabase.com/dashboard.
2. Open the SQL Editor, paste and run `supabase/schema.sql`.
3. Create your admin account:
   - Auth → Users → **Add user** (email + password).
   - Back in SQL Editor:
     ```sql
     insert into admin_users (user_id)
     select id from auth.users where email = 'you@example.com';
     ```

### 2. Env

```bash
cp .env.example .env.local
```

Fill in the three Supabase values from **Project Settings → API**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, never exposed to the browser)

### 3. Run

```bash
npm run dev
```

Open http://localhost:3000.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Home — categories + neighborhoods for the active city |
| `/[city]/[category]` | All approved listings in a category |
| `/[city]/n/[neighborhood]` | All approved listings in a neighborhood |
| `/[city]/[neighborhood]/[category]/[listing]` | Listing detail with WhatsApp CTA |
| `/list-your-business` | Public submission form (goes to `pending`) |
| `/admin/login` | Admin sign-in |
| `/admin` | Approve/reject pending queue |
| `/report?listing=…` | Report a listing |
| `/sitemap.xml`, `/robots.txt` | SEO |

## Sanity check (end-to-end)

1. Submit a listing at `/list-your-business` — should say "submitted for review".
2. Sign in at `/admin/login`, approve it in the queue.
3. Visit `/[city]/[category]` and confirm it renders.
4. Tap the WhatsApp button on a phone — should open WhatsApp with a pre-filled opener.

## What's intentionally missing (MVP)

No user accounts, no reviews, no payments, no featured listings, no mobile app, no multi-city. See `~/.claude/plans/i-want-to-create-piped-honey.md` for the full plan and the triggers for adding those.
