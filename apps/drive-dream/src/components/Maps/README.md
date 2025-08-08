# Google Maps Component

A React TypeScript component that provides an interactive Google Maps experience with Street View integration.

## Features

✅ Renders a standard 2D Google Map (roadmap mode)  
✅ Allows users to click anywhere on the map to drop a pin  
✅ Automatically switches to Street View at the exact pin location  
✅ Includes a "Back to Map" button overlaid on Street View  
✅ Preserves the pin when returning to the 2D map view

## Setup

### 1. Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Street View Static API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Environment Variable

Add your API key to your environment variables:

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Usage

### Basic Usage

```tsx
import GoogleMap from "./components/Maps/GoogleMap";

function MyComponent() {
  return (
    <GoogleMap
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      initialCenter={{ lat: 40.7128, lng: -74.006 }} // New York City
      initialZoom={12}
    />
  );
}
```

### Advanced Usage

```tsx
import GoogleMap from "./components/Maps/GoogleMap";

function MyComponent() {
  return (
    <GoogleMap
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      initialCenter={{ lat: 37.7749, lng: -122.4194 }} // San Francisco
      initialZoom={14}
      className="my-custom-map"
      style={{
        height: "500px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    />
  );
}
```

## Props

| Prop            | Type                           | Default                           | Description                        |
| --------------- | ------------------------------ | --------------------------------- | ---------------------------------- |
| `apiKey`        | `string`                       | **required**                      | Your Google Maps API key           |
| `initialCenter` | `{ lat: number; lng: number }` | `{ lat: 40.7128, lng: -74.0060 }` | Initial map center (New York City) |
| `initialZoom`   | `number`                       | `12`                              | Initial zoom level (0-21)          |
| `className`     | `string`                       | `''`                              | Additional CSS class names         |
| `style`         | `React.CSSProperties`          | `{}`                              | Inline styles for the container    |

## Component Structure

The component includes:

- **Map Container**: `id="map"` - The main map container
- **Back Button**: `id="back-btn"` - Initially hidden, appears during Street View
- **Responsive Design**: Adapts to container width, default height 400px

## CSS Classes and IDs

- `#map` - The main map container
- `#back-btn` - The back button (initially `display: none`)

## Browser Compatibility

- Modern browsers with JavaScript enabled
- Requires internet connection for Google Maps API
- Mobile-friendly with touch support

## Error Handling

The component includes error handling for:

- Missing API key
- Failed API loading
- Network connectivity issues

## Performance

- Lazy loads Google Maps API
- Efficient state management
- Minimal re-renders
- Cleanup on unmount

## Security

- API key should be restricted to your domain
- No sensitive data stored in component state
- Uses HTTPS for API calls
