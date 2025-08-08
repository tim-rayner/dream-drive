# Environment Setup for DriveDream AI

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Replicate API for AI image generation
REPLICATE_API_TOKEN=your_replicate_api_token_here

# Google Maps API for geocoding and Street View
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## API Keys Setup

### Supabase Configuration

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings > API
4. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

**Important**: The `SUPABASE_SERVICE_ROLE_KEY` is required for the credits system to work properly. This key bypasses Row Level Security (RLS) and should be kept secret.

### Replicate API Token

1. Sign up at [replicate.com](https://replicate.com)
2. Go to your account settings
3. Generate an API token
4. Add it to your `.env.local` file

### Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Geocoding API
   - Maps JavaScript API
   - Street View Static API
4. Create credentials (API Key)
5. Add it to your `.env.local` file

## Database Setup

The credits system requires a `credits` table in your Supabase database:

```sql
CREATE TABLE public.credits (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  available_credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read/update their own credits
CREATE POLICY "Users can view own credits" ON public.credits
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own credits" ON public.credits
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own credits" ON public.credits
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## Features

The refactored AI generation flow includes:

1. **Reverse Geocoding**: Converts lat/lng coordinates to place names
2. **LLM Scene Description**: Uses Replicate's LLM to describe the scene
3. **AI Image Generation**: Creates photorealistic car scenes with time of day
4. **Time of Day Selection**: Sunrise, Afternoon, Dusk, Night options
5. **Credits System**: Secure credit management with server actions

## API Endpoints

- `POST /api/generateFinalImage`: Main endpoint for AI image generation
- `POST /api/replicate`: Proxy for Replicate API calls
- `GET /api/replicate`: Status checking for Replicate predictions

## Credits System

The credits system includes:

- Secure server actions for spending/adding credits
- Protected buy credits page (`/buy`)
- Credit display in navigation
- Integration with image generation workflow
