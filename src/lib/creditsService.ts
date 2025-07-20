import { supabase } from "../context/AuthContext";

// Allowed credit amounts
const ALLOWED_CREDIT_AMOUNTS = [1, 10, 50, 100, 150, 1000];

export interface CreditsResult {
  success: boolean;
  error?: string;
  remainingCredits?: number;
  totalCredits?: number;
  addedCredits?: number;
}

export async function spendCredit(): Promise<CreditsResult> {
  try {
    // Get the current user from secure cookies
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Unauthorized: No valid session",
      };
    }

    const userId = user.id;

    // Get current credits
    const { data: creditData, error: fetchError } = await supabase
      .from("credits")
      .select("available_credits")
      .eq("id", userId)
      .single();

    if (fetchError) {
      // If no credits row exists, create one with 0 credits
      if (fetchError.code === "PGRST116") {
        const { data: newCreditData, error: insertError } = await supabase
          .from("credits")
          .insert({ id: userId, available_credits: 0 })
          .select("available_credits")
          .single();

        if (insertError) {
          return {
            success: false,
            error: "Failed to initialize credits",
          };
        }

        return {
          success: false,
          error: "Insufficient credits: 0 available",
        };
      }
      return {
        success: false,
        error: "Failed to fetch credits",
      };
    }

    if (!creditData || creditData.available_credits < 1) {
      return {
        success: false,
        error: `Insufficient credits: ${
          creditData?.available_credits || 0
        } available`,
      };
    }

    // Spend 1 credit using atomic update
    const { data: updatedData, error: updateError } = await supabase
      .from("credits")
      .update({
        available_credits: creditData.available_credits - 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .eq("available_credits", creditData.available_credits) // Optimistic locking
      .select("available_credits")
      .single();

    if (updateError) {
      return {
        success: false,
        error: "Failed to spend credit",
      };
    }

    return {
      success: true,
      remainingCredits: updatedData.available_credits,
    };
  } catch (error) {
    console.error("Error spending credit:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function addCredits(amount: number): Promise<CreditsResult> {
  try {
    // Validate amount
    if (!ALLOWED_CREDIT_AMOUNTS.includes(amount)) {
      return {
        success: false,
        error: `Invalid credit amount: ${amount}. Allowed amounts: ${ALLOWED_CREDIT_AMOUNTS.join(
          ", "
        )}`,
      };
    }

    // Get the current user from secure cookies
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Unauthorized: No valid session",
      };
    }

    const userId = user.id;

    // Check if credits row exists
    const { data: existingCredits, error: fetchError } = await supabase
      .from("credits")
      .select("available_credits")
      .eq("id", userId)
      .single();

    if (fetchError && fetchError.code === "PGRST116") {
      // Create new credits row
      const { data: newCredits, error: insertError } = await supabase
        .from("credits")
        .insert({
          id: userId,
          available_credits: amount,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("available_credits")
        .single();

      if (insertError) {
        return {
          success: false,
          error: "Failed to create credits row",
        };
      }

      return {
        success: true,
        totalCredits: newCredits.available_credits,
        addedCredits: amount,
      };
    } else if (fetchError) {
      return {
        success: false,
        error: "Failed to fetch credits",
      };
    }

    // Update existing credits
    const { data: updatedCredits, error: updateError } = await supabase
      .from("credits")
      .update({
        available_credits: existingCredits.available_credits + amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("available_credits")
      .single();

    if (updateError) {
      return {
        success: false,
        error: "Failed to update credits",
      };
    }

    return {
      success: true,
      totalCredits: updatedCredits.available_credits,
      addedCredits: amount,
    };
  } catch (error) {
    console.error("Error adding credits:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
