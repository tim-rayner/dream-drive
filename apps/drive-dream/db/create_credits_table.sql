-- Table: public.credits
-- One row per user, tracking total available credits.

create table public.credits (
  id uuid primary key references auth.users (id) on delete cascade, -- same as user.id
  available_credits integer not null default 0,                     -- remaining credits
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

-- Enable RLS
alter table public.credits enable row level security;

-- Policy: Only the user can read their own credits
create policy "Users can read own credits"
  on public.credits
  for select
  using (auth.uid() = id);

-- Policy: Only the user can update their own credits
create policy "Users can update own credits"
  on public.credits
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Policy: Only the user can insert their own credit row
create policy "Users can insert own credit row"
  on public.credits
  for insert
  with check (auth.uid() = id);

-- Auto-update updated_at on any update
create or replace function public.update_credits_timestamp()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger update_credits_timestamp
before update on public.credits
for each row
execute function public.update_credits_timestamp();