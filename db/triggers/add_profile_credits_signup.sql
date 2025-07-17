-- Dev-only trigger: Add 10 credits for new users
create or replace function public.dev_grant_credits()
returns trigger as $$
begin
  insert into public.credits (id, available_credits)
  values (new.id, 10);
  return new;
end;
$$ language plpgsql;

create trigger dev_grant_credits_trigger
after insert on auth.users
for each row
execute function public.dev_grant_credits();