import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client for user operations (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service client for admin operations (bypasses RLS) - only if service key is available
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export type Generation = {
  id: string;
  user_id: string;
  car_image_url: string;
  scene_image_url: string;
  lat: number;
  lng: number;
  time_of_day: "sunrise" | "afternoon" | "dusk" | "night";
  custom_instructions?: string;
  final_image_url: string;
  place_description: string;
  scene_description: string;
  original_generation_id?: string;
  is_revision: boolean;
  revision_used: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateGenerationData = Omit<
  Generation,
  | "id"
  | "user_id"
  | "created_at"
  | "updated_at"
  | "original_generation_id"
  | "is_revision"
  | "revision_used"
>;

export type RevisionRequest = {
  originalGenerationId: string;
  lat: number;
  lng: number;
  timeOfDay: "sunrise" | "afternoon" | "dusk" | "night";
  customInstructions?: string;
};
