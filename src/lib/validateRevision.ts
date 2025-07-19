import { supabaseAdmin, type Generation } from "./supabase";

export interface RevisionValidationResult {
  isValid: boolean;
  error?: string;
  originalGeneration?: Generation;
}

/**
 * Validates a revision request to ensure it's secure and valid
 */
export async function validateRevisionRequest(
  userId: string,
  originalGenerationId: string,
  carImageUrl: string
): Promise<RevisionValidationResult> {
  try {
    if (!supabaseAdmin) {
      return {
        isValid: false,
        error: "Admin database access not configured",
      };
    }

    // 1. Fetch the original generation
    const { data: originalGeneration, error: fetchError } = await supabaseAdmin
      .from("generations")
      .select("*")
      .eq("id", originalGenerationId)
      .single();

    if (fetchError || !originalGeneration) {
      return {
        isValid: false,
        error: "Original generation not found",
      };
    }

    // 2. Validate user ownership
    if (originalGeneration.user_id !== userId) {
      return {
        isValid: false,
        error: "You do not own this generation",
      };
    }

    // 3. Check if revision is already used
    if (originalGeneration.revision_used) {
      return {
        isValid: false,
        error: "Revision already used for this generation",
      };
    }

    // 4. Check if this is already a revision
    if (originalGeneration.is_revision) {
      return {
        isValid: false,
        error: "Cannot create a revision of a revision",
      };
    }

    // 5. Validate car image hasn't changed
    if (originalGeneration.car_image_url !== carImageUrl) {
      return {
        isValid: false,
        error: "Car image cannot be changed in a revision",
      };
    }

    return {
      isValid: true,
      originalGeneration,
    };
  } catch (error) {
    console.error("Error validating revision request:", error);
    return {
      isValid: false,
      error: "Failed to validate revision request",
    };
  }
}

/**
 * Checks if a generation is eligible for revision
 */
export function isGenerationEligibleForRevision(
  generation: Generation
): boolean {
  return !generation.is_revision && !generation.revision_used;
}
