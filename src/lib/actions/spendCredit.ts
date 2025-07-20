"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function spendCredit() {
  try {
    // Use secure cookie-based authentication
    const cookieStore = cookies();
    const supabase = createServerActionClient({ cookies: () => cookieStore });

    // Get the current user from secure cookies
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized: No valid session");
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
          throw new Error("Failed to initialize credits");
        }

        throw new Error("Insufficient credits: 0 available");
      }
      throw new Error("Failed to fetch credits");
    }

    if (!creditData || creditData.available_credits < 1) {
      throw new Error(
        `Insufficient credits: ${creditData?.available_credits || 0} available`
      );
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
      throw new Error("Failed to spend credit");
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
