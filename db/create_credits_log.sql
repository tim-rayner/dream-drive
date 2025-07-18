create table public.credits_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  amount integer not null,
  source text default 'stripe',
  price_id text,
  session_id text,
  price_amount decimal(10,2),
  price_currency text default 'GBP',
  created_at timestamp with time zone default timezone('utc', now())
);
alter table public.credits_log enable row level security;

-- Allow only the owner to read their logs
create policy "Users can read their own logs"
  on public.credits_log for select
  using (auth.uid() = user_id);

-- Allow server to insert logs (use service role in webhook handler)
create policy "Service can insert logs"
  on public.credits_log for insert
  with check (true);