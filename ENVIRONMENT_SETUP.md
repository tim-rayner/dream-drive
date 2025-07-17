# Environment Setup for DreamDrive AI

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Replicate API for AI image generation
REPLICATE_API_TOKEN=your_replicate_api_token_here

# Google Maps API for geocoding and Street View
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## API Keys Setup

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

## Features

The refactored AI generation flow includes:

1. **Reverse Geocoding**: Converts lat/lng coordinates to place names
2. **LLM Scene Description**: Uses Replicate's LLM to describe the scene
3. **AI Image Generation**: Creates photorealistic car scenes with time of day
4. **Time of Day Selection**: Sunrise, Afternoon, Dusk, Night options

## API Endpoints

- `POST /api/generateFinalImage`: Main endpoint for AI image generation
- `POST /api/replicate`: Proxy for Replicate API calls
- `GET /api/replicate`: Status checking for Replicate predictions
