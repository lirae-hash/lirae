-- Lirae Database Schema
-- Run this in your Supabase SQL Editor

-- Readers (extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  age_confirmed boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Static catalogue of adventures (one row per Setting Sheet)
create table if not exists adventures (
  id text primary key,
  title text not null,
  trope text not null,
  blurb text,
  setting_sheet jsonb not null,
  cover_image_url text,
  published boolean default false,
  sort_order int default 0
);

-- Enable RLS
alter table adventures enable row level security;

-- Adventures policies (public read for published)
create policy "Anyone can view published adventures"
  on adventures for select
  using (published = true);

-- A reader's playthrough of one adventure
create table if not exists playthroughs (
  id uuid primary key default gen_random_uuid(),
  reader_id uuid references profiles(id) on delete cascade,
  adventure_id text references adventures(id),
  vibe text not null check (vibe in ('dark', 'gold', 'rose', 'sage')),
  spice int not null check (spice between 1 and 3),
  protagonist_name text,
  choice_log jsonb default '[]',
  current_chapter int default 1,
  ending text check (ending in ('hea', 'hfn', 'heartbreak')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table playthroughs enable row level security;

-- Playthroughs policies
create policy "Users can view own playthroughs"
  on playthroughs for select
  using (auth.uid() = reader_id);

create policy "Users can create own playthroughs"
  on playthroughs for insert
  with check (auth.uid() = reader_id);

create policy "Users can update own playthroughs"
  on playthroughs for update
  using (auth.uid() = reader_id);

-- Generated chapter cache
create table if not exists chapters_cache (
  id uuid primary key default gen_random_uuid(),
  adventure_id text references adventures(id),
  chapter_no int not null,
  vibe text not null,
  spice int not null,
  path_hash text not null,
  prose text not null,
  choices jsonb,
  scene_image_url text,
  created_at timestamptz default now(),
  unique (adventure_id, chapter_no, vibe, spice, path_hash)
);

-- Enable RLS
alter table chapters_cache enable row level security;

-- Chapters cache policies (public read)
create policy "Anyone can view cached chapters"
  on chapters_cache for select
  using (true);

-- Purchases (paywall)
create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  reader_id uuid references profiles(id) on delete cascade,
  adventure_id text references adventures(id),
  stripe_session_id text,
  amount_cents int,
  status text default 'pending' check (status in ('pending', 'paid', 'refunded')),
  created_at timestamptz default now(),
  unique (reader_id, adventure_id)
);

-- Enable RLS
alter table purchases enable row level security;

-- Purchases policies
create policy "Users can view own purchases"
  on purchases for select
  using (auth.uid() = reader_id);

create policy "Users can create own purchases"
  on purchases for insert
  with check (auth.uid() = reader_id);
