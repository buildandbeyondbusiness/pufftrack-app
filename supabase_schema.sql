-- ==============================================================================
-- SuperBase (Supabase) Database Schema for PuffTrack
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query -> Run
-- Safe to run multiple times (Idempotent)
-- ==============================================================================

-- 1. PUFFS TABLE: Individual puff hits with high-precision timestamp and mood tags
create table if not exists public.puffs (
  id text primary key,
  user_id text not null,
  timestamp bigint not null,
  mood text,
  note text,
  created_at timestamptz default now()
);

-- Index for instant retrieval sorted by timestamp
create index if not exists idx_puffs_user_timestamp on public.puffs (user_id, timestamp desc);

-- 2. USER PROFILES TABLE: Custom device, limits, and settings
create table if not exists public.user_profiles (
  user_id text primary key,
  vape_profile jsonb,
  app_settings jsonb,
  updated_at timestamptz default now()
);

-- 3. POD REFILLS TABLE: Refill history & financial spend calculations
create table if not exists public.pod_refills (
  id text primary key,
  user_id text not null,
  timestamp bigint not null,
  cost_inr numeric default 0,
  puffs_logged integer default 0,
  device_name text,
  pod_capacity_ml numeric,
  created_at timestamptz default now()
);

create index if not exists idx_pod_refills_user on public.pod_refills (user_id, timestamp desc);

-- Enable Row Level Security (RLS)
alter table public.puffs enable row level security;
alter table public.user_profiles enable row level security;
alter table public.pod_refills enable row level security;

-- Drop existing policies if any so this script can be re-run safely
drop policy if exists "Allow all operations for puffs with user_id" on public.puffs;
drop policy if exists "Allow all operations for user_profiles" on public.user_profiles;
drop policy if exists "Allow all operations for pod_refills" on public.pod_refills;

-- Permissive public policies for user_id key based storage (allows guest & authenticated user sync)
create policy "Allow all operations for puffs with user_id"
  on public.puffs for all
  using (true)
  with check (true);

create policy "Allow all operations for user_profiles"
  on public.user_profiles for all
  using (true)
  with check (true);

create policy "Allow all operations for pod_refills"
  on public.pod_refills for all
  using (true)
  with check (true);

-- Enable Realtime publication safely for instant cross-device updates
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'puffs'
  ) then
    alter publication supabase_realtime add table public.puffs;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'user_profiles'
  ) then
    alter publication supabase_realtime add table public.user_profiles;
  end if;
exception
  when undefined_object then
    -- If publication doesn't exist yet, create it
    create publication supabase_realtime for table public.puffs, public.user_profiles;
end $$;
