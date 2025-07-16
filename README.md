# Dream Drive

DreamDrive is a web-based AI studio where users upload photos of their car and place it anywhere in the world. DreamDrive lets users "capture" a Street View snapshot from Google Maps, providing rich, realistic background context for their shot. The system then generates high-quality, cinematic images of their car in that chosen real-world scene.

## Features

✅ **Car Photo Upload**: Upload and preview your car photos  
✅ **Interactive Map**: Choose any location worldwide with Google Maps  
✅ **Street View Capture**: Capture realistic scene backgrounds  
✅ **AI Scene Generation**: Generate photorealistic car scenes using Replicate's SDXL  
✅ **Custom Prompts**: Add optional details to guide AI generation  
✅ **Responsive Design**: Works on desktop and mobile devices

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Google Maps API Key (required for location selection)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Replicate API Token (required for AI image generation)
REPLICATE_API_TOKEN=your_replicate_api_token_here
```

#### Getting API Keys:

**Google Maps API Key:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Street View Static API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

**Replicate API Token:**

1. Go to [Replicate](https://replicate.com/account/api-tokens)
2. Create an account or sign in
3. Generate a new API token
4. Copy the token to your `.env.local` file

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

1. **Upload Car Photo**: Drag and drop or click to upload a photo of your car
2. **Choose Location**: Click anywhere on the map to drop a pin and switch to Street View
3. **Capture Scene**: Click "Choose Scene" to capture the Street View image
4. **Generate AI Scene**: Add optional details and click "Generate AI Scene"
5. **Download Result**: View and download your generated photorealistic car scene

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **Maps**: Google Maps JavaScript API
- **AI Generation**: Replicate API with SDXL model
- **Styling**: Tailwind CSS, Emotion

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Environment Variables

| Variable                          | Description                                 | Required |
| --------------------------------- | ------------------------------------------- | -------- |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key for location selection  | Yes      |
| `REPLICATE_API_TOKEN`             | Replicate API token for AI image generation | Yes      |

## Security Notes

- Google Maps API key is exposed to the client (required for frontend functionality)
- Replicate API token is kept server-side and proxied through API routes
- Restrict Google Maps API key to your domain
- Monitor Replicate API usage to control costs
- API routes provide secure proxy for external API calls
