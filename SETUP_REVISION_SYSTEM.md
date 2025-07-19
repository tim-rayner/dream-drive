# 🚀 DreamDrive Revision System Setup Guide

## Prerequisites

Before using the revision system, you need to set up the required environment variables and database.

## 1. Environment Variables

Add these to your `.env.local` file:

```bash
# Required for revision system
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Existing variables (should already be set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
REPLICATE_API_TOKEN=your_replicate_api_token_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Getting the Service Role Key

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **service_role secret** key
5. Add it to your `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Important**: The service role key bypasses Row Level Security (RLS) and should be kept secret. Never expose it in client-side code.

## 2. Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Create the generations table
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
```

## 3. Testing the Setup

### Test 1: Environment Variables

```bash
# Check if service role key is set
echo $SUPABASE_SERVICE_ROLE_KEY
```

### Test 2: Database Connection

1. Go to your app
2. Try to generate an image
3. Check the console for "Generation saved with ID:" message

### Test 3: Revision System

1. Generate an image
2. Go to `/generations` page
3. Click "Request Revision" on a generation
4. Modify parameters and submit

## 4. Troubleshooting

### Error: "Admin database access not configured"

- Check that `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
- Restart your development server after adding the variable

### Error: "Table 'generations' does not exist"

- Run the SQL script in your Supabase SQL Editor
- Check that the table was created successfully

### Error: "Policy violation"

- Ensure RLS policies are created correctly
- Check that the user is authenticated

### Error: "Invalid coordinates"

- Ensure lat/lng are valid numbers
- Lat: -90 to 90, Lng: -180 to 180

## 5. Features Available After Setup

✅ **Generation History**: View all your AI generations at `/generations`

✅ **One-Time Revisions**: Request one revision per original generation

✅ **Parameter Changes**: Modify location, time of day, and custom instructions

✅ **Security**: Server-side validation prevents abuse

✅ **User Interface**: Clean UI with revision eligibility indicators

## 6. Optional: Development Mode

If you want to test without the service role key (limited functionality):

```typescript
// The system will work but won't save generations to database
// Revisions will show "Admin database access not configured" error
```

## 7. Production Deployment

For production deployment:

1. **Environment Variables**: Set all required variables in your hosting platform
2. **Database**: Ensure the generations table exists in production
3. **Testing**: Test the revision flow in production environment

## 8. Monitoring

Check these logs for system health:

```bash
# Generation save success
"Generation saved with ID: uuid"

# Revision validation
"✅ Revision validation passed, starting image generation..."

# Database errors
"Error saving generation to database:"
"Error marking revision as used:"
```

## 9. Security Notes

- ✅ Service role key is server-side only
- ✅ User ownership enforced on all operations
- ✅ One revision per generation limit
- ✅ Car image integrity maintained
- ✅ No client-side validation bypass possible

The revision system is now ready to use! 🎉
