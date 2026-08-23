-- Local Directory — schema, RLS, seed
-- Run this once in the Supabase SQL editor for a fresh project.

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists cities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  active boolean not null default true
);

create table if not exists neighborhoods (
  id uuid primary key default uuid_generate_v4(),
  city_id uuid not null references cities(id) on delete cascade,
  name text not null,
  slug text not null,
  unique (city_id, slug)
);

create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  icon text,
  parent_id uuid references categories(id) on delete set null
);

do $$ begin
  create type listing_status as enum ('pending', 'approved', 'rejected', 'removed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type listing_source as enum ('self_serve', 'manual', 'import');
exception when duplicate_object then null; end $$;

create table if not exists listings (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null,
  category_id uuid not null references categories(id) on delete restrict,
  neighborhood_id uuid not null references neighborhoods(id) on delete restrict,
  description text,
  whatsapp_number text not null,           -- E.164, e.g. +919812345678
  hours_json jsonb,
  photo_url text,
  verified boolean not null default false, -- "we messaged this WhatsApp and got a reply"
  status listing_status not null default 'pending',
  source listing_source not null default 'self_serve',
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id) on delete set null,
  unique (neighborhood_id, slug),
  constraint whatsapp_e164 check (whatsapp_number ~ '^\+[1-9][0-9]{7,14}$')
);

create index if not exists listings_status_idx on listings(status);
create index if not exists listings_category_idx on listings(category_id);
create index if not exists listings_neighborhood_idx on listings(neighborhood_id);
create index if not exists listings_verified_idx on listings(verified);

create table if not exists listing_reports (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references listings(id) on delete cascade,
  reason text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

do $$ begin
  create type outreach_status as enum ('lead', 'contacted', 'yes', 'no', 'no_response');
exception when duplicate_object then null; end $$;

-- Outreach queue: candidate businesses (scraped from Google Maps / Justdial /
-- word of mouth) that we plan to message on WhatsApp for consent. Only "yes"
-- replies get promoted to listings.
create table if not exists outreach_leads (
  id uuid primary key default uuid_generate_v4(),
  business_name text not null,
  whatsapp_number text not null,
  category_id uuid references categories(id) on delete set null,
  neighborhood_id uuid references neighborhoods(id) on delete set null,
  source_note text,
  status outreach_status not null default 'lead',
  contacted_at timestamptz,
  replied_at timestamptz,
  listing_id uuid references listings(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint outreach_whatsapp_e164 check (whatsapp_number ~ '^\+[1-9][0-9]{7,14}$')
);
create index if not exists outreach_status_idx on outreach_leads(status);

-- Helper: is the current session an admin?
create or replace function is_admin() returns boolean
language sql stable security definer as $$
  select exists (select 1 from admin_users where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table cities          enable row level security;
alter table neighborhoods   enable row level security;
alter table categories      enable row level security;
alter table listings        enable row level security;
alter table listing_reports enable row level security;
alter table admin_users     enable row level security;
alter table outreach_leads  enable row level security;

-- Reference tables: public read
drop policy if exists "public read cities" on cities;
create policy "public read cities" on cities for select using (true);
drop policy if exists "public read neighborhoods" on neighborhoods;
create policy "public read neighborhoods" on neighborhoods for select using (true);
drop policy if exists "public read categories" on categories;
create policy "public read categories" on categories for select using (true);

-- Listings: public can read only approved rows; admins can read all
drop policy if exists "public read approved listings" on listings;
create policy "public read approved listings" on listings for select using (status = 'approved');
drop policy if exists "admin read all listings" on listings;
create policy "admin read all listings" on listings for select using (is_admin());

-- Listings: admin-only write. Public submissions go through the service-role
-- key in a server action, which bypasses RLS.
drop policy if exists "admin insert listings" on listings;
create policy "admin insert listings" on listings for insert with check (is_admin());
drop policy if exists "admin update listings" on listings;
create policy "admin update listings" on listings for update using (is_admin()) with check (is_admin());
drop policy if exists "admin delete listings" on listings;
create policy "admin delete listings" on listings for delete using (is_admin());

-- Reports: public can insert, admin can read
drop policy if exists "public insert reports" on listing_reports;
create policy "public insert reports" on listing_reports for insert with check (true);
drop policy if exists "admin read reports" on listing_reports;
create policy "admin read reports" on listing_reports for select using (is_admin());

-- admin_users: admin-only read (service-role bootstraps the first admin row)
drop policy if exists "admin read admin_users" on admin_users;
create policy "admin read admin_users" on admin_users for select using (is_admin());

-- Outreach: admin-only, all operations
drop policy if exists "admin all outreach" on outreach_leads;
create policy "admin all outreach" on outreach_leads for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- Seed — Lucknow + 5 neighborhoods + the category taxonomy
-- ---------------------------------------------------------------------------

insert into cities (name, slug) values ('Lucknow', 'lucknow')
  on conflict (slug) do nothing;

insert into neighborhoods (city_id, name, slug)
select c.id, n.name, n.slug
from cities c,
     (values
       ('Gomti Nagar','gomti-nagar'),
       ('Hazratganj','hazratganj'),
       ('Aliganj','aliganj'),
       ('Indira Nagar','indira-nagar'),
       ('Alambagh','alambagh')
     ) as n(name, slug)
where c.slug = 'lucknow'
on conflict (city_id, slug) do nothing;

insert into categories (name, slug, icon) values
  ('Tiffin Services','tiffin-services','🍱'),
  ('Home Cleaning','home-cleaning','🧹'),
  ('Tailors','tailors','🧵'),
  ('Electricians','electricians','⚡'),
  ('Plumbers','plumbers','🔧'),
  ('Tuition & Coaching','tuition-coaching','📚'),
  ('Car & Bike Repair','car-bike-repair','🔩'),
  ('Salons','salons','💇')
on conflict (slug) do nothing;
