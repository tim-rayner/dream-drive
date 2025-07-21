# 🔄 DriveDream Revision System

## Overview

The DriveDream revision system allows users to regenerate AI images **once per original credit use** with modified parameters while maintaining the same car image. This system is designed to be secure, controlled, and user-friendly.

## 🎯 Key Features

### ✅ Allowed Changes

- **Location**: New coordinates (lat/lng)
- **Time of Day**: Sunrise, Afternoon, Dusk, Night
- **Custom Instructions**: Additional AI prompts

### ❌ Restricted Changes

- **Car Image**: Cannot be changed (must match original)
- **Scene Image**: Can be different (new location context)

### 🛡️ Security Features

- **Server-side validation**: All checks performed on backend
- **User ownership**: Only generation owners can request revisions
- **One-time use**: Maximum 1 revision per original generation
- **No revision chains**: Cannot revise a revision

## 📊 Database Schema

### Generations Table

```sql
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
```

## 🔧 API Endpoints

### 1. Generate Final Image (Enhanced)

**POST** `/api/generateFinalImage`

Now saves generations to database and supports revision flags:

```typescript
interface GenerateFinalImageRequest {
  carImage: string;
  sceneImage: string;
  lat: number;
  lng: number;
  timeOfDay: "sunrise" | "afternoon" | "dusk" | "night";
  customInstructions?: string;
  userId?: string; // New: for saving generation
  isRevision?: boolean; // New: revision flag
  originalGenerationId?: string; // New: links to original
}
```

### 2. Revision Request

**POST** `/api/revision`

Secure endpoint for revision requests:

```typescript
interface RevisionRequest {
  originalGenerationId: string;
  carImage: string; // Must match original
  sceneImage: string; // Can be different
  lat: number;
  lng: number;
  timeOfDay: "sunrise" | "afternoon" | "dusk" | "night";
  customInstructions?: string;
  userId: string;
}
```

### 3. Fetch User Generations

**GET** `/api/generations?userId={userId}`

Returns user's generations for display.

## 🔒 Security Implementation

### Validation Chain

1. **User Authentication**: Verify user owns the generation
2. **Revision Eligibility**: Check `!is_revision && !revision_used`
3. **Car Image Integrity**: Ensure car image matches original
4. **Atomic Updates**: Mark original as `revision_used = true`
5. **Database Constraints**: Enforce relationships and constraints

### Server-Side Validation

```typescript
// validateRevision.ts
export async function validateRevisionRequest(
  userId: string,
  originalGenerationId: string,
  carImageUrl: string
): Promise<RevisionValidationResult>;
```

## 🎨 Frontend Components

### GenerationResult Component

- Displays generation with revision eligibility
- Shows "Request Revision" button only when eligible
- Modal dialog for revision parameters
- Real-time validation and error handling

### Generations Page

- Lists all user generations
- Handles revision completion updates
- Responsive design with loading states

## 🚀 Usage Flow

### 1. Original Generation

```typescript
// User creates original generation
const result = await generateFinalImage({
  carImage: carBase64,
  sceneImage: sceneBase64,
  lat: 40.7128,
  lng: -74.006,
  timeOfDay: "afternoon",
  customInstructions: "Make it cinematic",
  userId: user.id,
});
// Generation saved with is_revision: false, revision_used: false
```

### 2. Revision Request

```typescript
// User requests revision
const revision = await fetch("/api/revision", {
  method: "POST",
  body: JSON.stringify({
    originalGenerationId: "gen-uuid",
    carImage: originalCarImage, // Must match
    sceneImage: newSceneImage, // Can be different
    lat: 34.0522, // New location
    lng: -118.2437,
    timeOfDay: "dusk", // New time
    customInstructions: "Add dramatic lighting",
    userId: user.id,
  }),
});
// Original marked as revision_used: true
// New generation created with is_revision: true
```

## 📁 File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generateFinalImage/route.ts (enhanced)
│   │   ├── revision/route.ts (new)
│   │   └── generations/route.ts (new)
│   └── (protected)/
│       └── generations/page.tsx (new)
├── components/
│   ├── GenerationResult.tsx (new)
│   └── NavBar.tsx (enhanced)
├── lib/
│   ├── supabase.ts (new)
│   └── validateRevision.ts (new)
└── db/
    └── create_generations_table.sql (new)
```

## 🔄 Revision Eligibility Logic

```typescript
export function isGenerationEligibleForRevision(
  generation: Generation
): boolean {
  return !generation.is_revision && !generation.revision_used;
}
```

## 🎯 User Experience

### Visual Indicators

- **Original Generation**: Clean display with "Request Revision" button
- **Revision**: Shows "Revision" chip, no revision button
- **Used Original**: Shows "Revision already used" message

### Error Handling

- Clear error messages for validation failures
- Loading states during revision generation
- Graceful fallbacks for network issues

## 🛠️ Setup Instructions

1. **Database Migration**:

   ```sql
   -- Run in Supabase SQL Editor
   \i db/create_generations_table.sql
   ```

2. **Environment Variables**:
   Ensure `SUPABASE_SERVICE_ROLE_KEY` is set for admin operations

3. **Frontend Integration**:
   - Import `GenerationResult` component
   - Add navigation to `/generations`
   - Update generation flow to save to database

## 🔍 Testing Scenarios

### Valid Revision Requests

- ✅ Original generation with unused revision
- ✅ Valid coordinates and time of day
- ✅ Matching car image
- ✅ User owns the generation

### Invalid Revision Requests

- ❌ Already revised generation
- ❌ Revision of a revision
- ❌ Different car image
- ❌ User doesn't own generation
- ❌ Invalid coordinates/time

## 🚀 Future Enhancements

- **Bulk Operations**: Multiple revision requests
- **Revision History**: Track all revision attempts
- **Advanced Validation**: Scene image similarity checks
- **Analytics**: Revision usage patterns
- **Premium Features**: Multiple revisions for premium users
