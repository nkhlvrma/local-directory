-- Local WhatsApp Directory — schema, RLS, seed
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

create type listing_status as enum ('pending', 'approved', 'rejected', 'removed');
create type listing_source as enum ('self_serve', 'manual');

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

-- Reference tables: public read
create policy "public read cities"        on cities        for select using (true);
create policy "public read neighborhoods" on neighborhoods for select using (true);
create policy "public read categories"    on categories    for select using (true);

-- Listings: public can read only approved rows; admins can read all
create policy "public read approved listings"
  on listings for select using (status = 'approved');
create policy "admin read all listings"
  on listings for select using (is_admin());

-- Listings: admin-only write (public submissions go through the service-role
-- key in a server action, which bypasses RLS).
create policy "admin insert listings" on listings for insert with check (is_admin());
create policy "admin update listings" on listings for update using (is_admin()) with check (is_admin());
create policy "admin delete listings" on listings for delete using (is_admin());

-- Reports: public can insert, admin can read
create policy "public insert reports" on listing_reports for insert with check (true);
create policy "admin read reports"    on listing_reports for select using (is_admin());

-- admin_users: admin-only read (service-role bootstraps the first admin row)
create policy "admin read admin_users" on admin_users for select using (is_admin());

-- ---------------------------------------------------------------------------
-- Seed — one city, a few neighborhoods, a starter category set, a demo listing
-- ---------------------------------------------------------------------------

insert into cities (name, slug) values ('Bangalore', 'bangalore')
  on conflict (slug) do nothing;

insert into neighborhoods (city_id, name, slug)
select c.id, n.name, n.slug
from cities c,
     (values
       ('Koramangala','koramangala'),
       ('Indiranagar','indiranagar'),
       ('HSR Layout','hsr-layout'),
       ('Jayanagar','jayanagar')
     ) as n(name, slug)
where c.slug = 'bangalore'
on conflict (city_id, slug) do nothing;

insert into categories (name, slug, icon) values
  ('Electricians','electricians','⚡'),
  ('Plumbers','plumbers','🔧'),
  ('Tiffin Services','tiffin-services','🍱'),
  ('Tailors','tailors','🧵'),
  ('Home Cleaning','home-cleaning','🧹'),
  ('Tuition & Coaching','tuition-coaching','📚'),
  ('Car & Bike Repair','car-bike-repair','🔩'),
  ('Salons','salons','💇')
on conflict (slug) do nothing;

-- One demo approved listing so pages render before you have real data.
insert into listings (name, slug, category_id, neighborhood_id, description, whatsapp_number, status, source, approved_at)
select
  'Ravi Electricals',
  'ravi-electricals',
  cat.id,
  nb.id,
  'Neighborhood electrician. Wiring, fans, geysers, MCB, quick call-outs.',
  '+919812345678',
  'approved',
  'manual',
  now()
from categories cat, neighborhoods nb
where cat.slug = 'electricians' and nb.slug = 'koramangala'
on conflict (neighborhood_id, slug) do nothing;
