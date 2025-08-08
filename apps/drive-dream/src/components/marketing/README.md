# Marketing Components

This directory contains the cinematic marketing components for the unauthenticated homepage.

## Components

### Hero.tsx

- Full-screen hero section with split layout
- Left: Blurred text panel with call-to-action
- Right: Background image controlled by carousel
- Responsive design that stacks on mobile

### BackgroundCarousel.tsx

- Cycles through automotive-themed images with dynamic content
- **Slide data structure**: Each slide contains image, header, body text, and CTA
- Automatic fade transitions every 7 seconds
- **Navigation controls**: Next arrow button and dot indicators
- **Keyboard support**: Right arrow key for navigation
- **Accessibility**: ARIA labels and keyboard navigation
- Uses Pexels images for automotive content

### FeatureStrip.tsx

- Three-column feature grid
- Displays key features with icons and statistics
- Dark background with gradient text accents

### MediaHighlight.tsx

- Optional media showcase section
- Background image with play button overlay
- Call-to-action for video content

### CTAFooter.tsx

- Final call-to-action section
- Gradient background with signup focus
- Includes trust indicators and benefits

## Usage

```tsx
import {
  Hero,
  FeatureStrip,
  MediaHighlight,
  CTAFooter,
} from "@/components/marketing";

// In your page component
<Box>
  <Hero />
  <FeatureStrip />
  <MediaHighlight />
  <CTAFooter />
</Box>;
```

## Styling

All components follow the existing theme:

- Dark mode with purple/indigo gradients
- Consistent typography and spacing
- Responsive breakpoints
- Blur effects and overlays for premium feel

## Slide Data Structure

Each slide contains dynamic content that changes with the carousel:

```typescript
interface SlideData {
  id: number;
  imageUrl: string;
  header: string;
  bodyText: string;
  ctaText: string;
  ctaLink?: string;
}
```

### Example Slides:

- **Create Your Dream Drive**: Upload car photos and choose locations
- **Transform Any Location**: AI-powered scene generation
- **Cinematic AI Scenes**: Realistic environments with perfect lighting
- **Professional Results**: High-quality automotive photography
- **Your Car, Anywhere**: Endless possibilities for car placement

## Navigation Features

The BackgroundCarousel includes multiple ways to navigate:

- **Next arrow**: Single chevron button on the right side (clear image area)
- **Dot indicators**: Click any dot on the left panel to jump to that specific slide
- **Keyboard navigation**: Use right arrow key (→) to advance
- **Auto-play**: Automatically advances every 7 seconds
- **Smooth transitions**: 1.5s fade transitions between slides

## Image Sources

Currently using Pexels for placeholder images:

- High-quality automotive photography
- Professional car and driving scenes
- Optimized for web performance

These can be replaced with actual product images or optimized automotive photography.
