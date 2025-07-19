-- Table: public.generations
-- Stores all AI image generations with revision tracking

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  
  -- Original generation data
  car_image_url text not null,
  scene_image_url text not null,
  lat numeric(10, 8) not null,
  lng numeric(11, 8) not null,
  time_of_day text not null check (time_of_day in ('sunrise', 'afternoon', 'dusk', 'night')),
  custom_instructions text,
  
  -- Generated result
  final_image_url text not null,
  place_description text not null,
  scene_description text not null,
  
  -- Revision tracking
  original_generation_id uuid references public.generations(id) on delete cascade,
  is_revision boolean default false,
  revision_used boolean default false,
  
  -- Metadata
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

-- Enable RLS
alter table public.generations enable row level security;

-- Policy: Users can read their own generations
create policy "Users can read own generations"
  on public.generations
  for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own generations
create policy "Users can insert own generations"
  on public.generations
  for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own generations (for revision_used flag)
create policy "Users can update own generations"
  on public.generations
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-update updated_at on any update
create or replace function public.update_generations_timestamp()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger update_generations_timestamp
before update on public.generations
for each row
execute function public.update_generations_timestamp();

-- Index for performance
create index idx_generations_user_id on public.generations(user_id);
create index idx_generations_original_id on public.generations(original_generation_id);
create index idx_generations_created_at on public.generations(created_at); 