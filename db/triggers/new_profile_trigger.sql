-- 1. Create the function to insert into public_profiles
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

-- 2. Create the trigger on the auth.users table
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();