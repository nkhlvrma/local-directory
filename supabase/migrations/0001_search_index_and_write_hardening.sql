-- Migration for databases created before these changes landed.
-- schema.sql is the source of truth for a fresh install and already includes
-- everything below; run this file against an existing project instead.
--
-- Safe to run more than once.

-- ---------------------------------------------------------------------------
-- 1. Make text search indexable.
--
-- /search runs `name ilike '%q%' or description ilike '%q%'`. A leading
-- wildcard defeats a btree index, so each search was a sequential scan over
-- every approved listing. gin_trgm_ops is the operator class that makes an
-- unanchored ILIKE use an index.
--
-- On a large table use `create index concurrently` (outside a transaction)
-- instead, so writes aren't blocked while the index builds.
-- ---------------------------------------------------------------------------

create extension if not exists pg_trgm;

create index if not exists listings_name_trgm_idx
  on listings using gin (name gin_trgm_ops);

create index if not exists listings_description_trgm_idx
  on listings using gin (description gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- 2. Remove anonymous INSERT rights on the three append-only tables.
--
-- Each was `with check (true)`, so anyone holding the publishable anon key
-- could write rows directly, without going through the app at all. Every
-- legitimate write already happens server-side through the service-role
-- client, which bypasses RLS — so dropping these policies costs nothing and
-- closes an unmetered write path into the database.
--
-- Public event reporting still works: it goes through POST /api/track, which
-- now checks origin, rate limits per IP, validates the event name against a
-- known list, and caps metadata size.
-- ---------------------------------------------------------------------------

drop policy if exists "public insert analytics_events" on analytics_events;
drop policy if exists "public insert search_events" on search_events;
drop policy if exists "public insert reports" on listing_reports;
