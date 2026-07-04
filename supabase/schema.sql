-- Free Plug — V1 database schema
-- Run this in the Supabase SQL editor (or via the Supabase CLI) on a fresh project.
--
-- NOTE: this version of the schema replaces an earlier iteration
-- (category/school/image_url/host_* columns). It DROPS and recreates the
-- listings table — this is destructive. Only run it against a project
-- whose listings data you're fine losing (re-seed with seed.sql after).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- listings
-- ---------------------------------------------------------------------------
drop table if exists listings cascade;

create table listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  listing_type text not null,
  location text,
  -- Events: starts_at/ends_at are the time frame.
  -- Deals: starts_at is unused; ends_at doubles as the deadline
  --   (null ends_at = no deadline / ongoing deal).
  starts_at timestamptz,
  ends_at timestamptz,
  -- Unified classification + search: replaces the old category/school
  -- enums. Free-form, admin-extensible, also drives the public filter pills.
  tags text[] not null default '{}',
  thumbnail_url text not null,
  source_url text not null,
  cta_label text not null default 'Open Link',
  -- Optional code-mapped id (a school key, or a simple-icons brand slug) —
  -- resolved to an icon in src/features/listings/establishments.ts.
  -- Null when there's no matching logo for the host.
  establishment_id text,
  establishment_name text not null,
  status text not null default 'draft',
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint listings_listing_type_check check (listing_type in ('event', 'deal')),
  constraint listings_status_check check (
    status in ('draft', 'published', 'expired', 'archived')
  )
);

create index listings_status_idx on listings (status);
create index listings_listing_type_idx on listings (listing_type);
create index listings_is_featured_idx on listings (is_featured);
create index listings_starts_at_idx on listings (starts_at);
create index listings_ends_at_idx on listings (ends_at);
create index listings_tags_idx on listings using gin (tags);

create trigger listings_set_updated_at
  before update on listings
  for each row
  execute function set_updated_at();

-- Public read rule (enforced in application queries):
--   select * from listings
--   where status = 'published'
--     and (ends_at is null or ends_at > now())

-- ---------------------------------------------------------------------------
-- submissions
-- ---------------------------------------------------------------------------
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  email text,
  description text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint submissions_status_check check (
    status in ('pending', 'reviewed', 'approved', 'rejected')
  )
);

create index if not exists submissions_status_idx on submissions (status);

drop trigger if exists submissions_set_updated_at on submissions;
create trigger submissions_set_updated_at
  before update on submissions
  for each row
  execute function set_updated_at();

-- Admin login is handled entirely via the ADMIN_PASSWORD / ADMIN_PASSWORD_SECRET
-- env vars (see .env.example) — there is no admin_settings table in V1.

-- ---------------------------------------------------------------------------
-- Storage — listing thumbnails
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('public_bucket', 'public_bucket', true)
on conflict (id) do nothing;

drop policy if exists "Public can read public_bucket" on storage.objects;
create policy "Public can read public_bucket"
  on storage.objects for select
  to public
  using (bucket_id = 'public_bucket');

-- No anon/authenticated insert/update/delete policy on storage.objects —
-- uploads only happen through the service-role admin client (bypasses RLS).

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- All reads/writes for these tables happen through server-side Supabase
-- clients (anon client for public listing reads + submission inserts, service
-- role client for admin mutations). RLS is enabled with narrow policies so the
-- anon key can never write/delete listings directly.

alter table listings enable row level security;
alter table submissions enable row level security;

drop policy if exists "Public can read published listings" on listings;
create policy "Public can read published listings"
  on listings for select
  to anon, authenticated
  using (status = 'published' and (ends_at is null or ends_at > now()));

drop policy if exists "Public can submit listing ideas" on submissions;
create policy "Public can submit listing ideas"
  on submissions for insert
  to anon, authenticated
  with check (true);

-- No anon/authenticated policies exist for listings writes or submissions
-- reads/updates — those go through the service role client.
