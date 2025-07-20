-- Grant 10 credits for new users who sign up before August 1st, 2025
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

create trigger dev_grant_credits_trigger
after insert on auth.users
for each row
execute function public.dev_grant_credits();

-- Add policy to allow trigger to insert credits
create policy "Trigger can insert credits"
  on public.credits
  for insert
  with check (true);