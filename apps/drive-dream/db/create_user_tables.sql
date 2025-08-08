-- Run this inside Supabase SQL Editor
create table public.public_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Allow users to read anyone's profile
alter table public.public_profiles enable row level security;

create policy "Public can read profiles"
  on public.public_profiles
  for select
  using (true);

-- Allow user to insert/update their own profile
create policy "Users can insert own profile"
  on public.public_profiles
  for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.public_profiles
  for update
  using (auth.uid() = id);