-- Fix for new user signup database error
-- This migration addresses the "Database error saving new user" issue
-- by allowing triggers to insert data into RLS-protected tables

-- 1. Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS dev_grant_credits_trigger ON auth.users;

-- 2. Update the profile trigger function to use security definer
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_email text;
  user_name text;
  user_avatar text;
begin
  -- Extract user metadata if available (from raw_user_meta_data)
  user_email := new.email;
  user_name := new.raw_user_meta_data->>'full_name';
  user_avatar := new.raw_user_meta_data->>'avatar_url';

  insert into public.public_profiles (id, email, full_name, avatar_url)
  values (new.id, user_email, user_name, user_avatar);

  return new;
end;
$$ language plpgsql security definer;

-- 3. Update the credits trigger function to use security definer with date-based logic
create or replace function public.dev_grant_credits()
returns trigger as $$
begin
  -- Only grant credits if user signs up before August 1st, 2025
  if new.created_at < '2025-08-01 00:00:00+00' then
    insert into public.credits (id, available_credits)
    values (new.id, 10);
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- 4. Recreate the triggers
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger dev_grant_credits_trigger
after insert on auth.users
for each row
execute function public.dev_grant_credits();

-- 5. Add policy to allow trigger to insert profiles (if not exists)
drop policy if exists "Trigger can insert profiles" on public.public_profiles;
create policy "Trigger can insert profiles"
  on public.public_profiles
  for insert
  with check (true);

-- 6. Add policy to allow trigger to insert credits (if not exists)
drop policy if exists "Trigger can insert credits" on public.credits;
create policy "Trigger can insert credits"
  on public.credits
  for insert
  with check (true); 