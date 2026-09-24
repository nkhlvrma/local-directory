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

### 4. Migrations

`supabase/schema.sql` is the source of truth for a fresh project. For a
database that already exists, apply the numbered files in
`supabase/migrations/` instead — they carry the same changes incrementally
and are safe to re-run.

## Tests

```bash
npm test         # vitest, one pass
npm run test:watch
npm run lint
```

Unit tests cover the pure logic in `src/lib` — opening hours (including
windows that cross midnight), PIN validation, slugs, WhatsApp link building,
browse-page filtering, and the rate limiter.

## Caching

Public pages are prerendered and served from the edge; only `/search`,
`/report` and `/admin/*` run per request.

Freshness comes from purging, not from waiting: every admin action that
changes what a visitor sees (approve, reject, verify, edit, delete, and
adding a category or neighborhood) revalidates exactly the affected paths,
and the category/neighborhood lists are cached by the `taxonomy` tag. The
one-hour `revalidate` on those pages is only a backstop for changes made
outside the admin UI — for example, editing a row straight in Supabase,
which will take up to an hour to appear.

Listing photos upload with a one-year `Cache-Control` under a timestamped
path that is never overwritten, so `images.minimumCacheTTL` is long too. A
new photo gets a new URL.

Server-side Supabase clients carry a request timeout (`lib/supabase/fetch.ts`)
so an outage fails fast instead of holding a function open, and `unwrap()`
turns a failed query on a cached page into a thrown error, which keeps the
last good copy in place rather than caching an empty one.

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
