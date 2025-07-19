"use server";

import { supabaseAdmin } from "../supabase";

export async function refundCredit(userId: string) {
  try {
    if (!supabaseAdmin) {
      console.error("❌ Supabase admin client not available for credit refund");
      return {
        success: false,
        error: "Admin client not available",
      };
    }

    console.log("🔄 Attempting to refund credit for user:", userId);

    // Get current credits
    const { data: creditData, error: fetchError } = await supabaseAdmin
      .from("credits")
      .select("available_credits")
      .eq("id", userId)
      .single();

    if (fetchError) {
      console.error("❌ Error fetching credits for refund:", fetchError);
      return {
        success: false,
        error: "Failed to fetch credits",
      };
    }

    if (!creditData) {
      console.error("❌ No credits record found for user:", userId);
      return {
        success: false,
        error: "No credits record found",
      };
    }

    // Refund 1 credit using atomic update
    const { data: updatedData, error: updateError } = await supabaseAdmin
      .from("credits")
      .update({
        available_credits: creditData.available_credits + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .eq("available_credits", creditData.available_credits) // Optimistic locking
      .select("available_credits")
      .single();

    if (updateError) {
      console.error("❌ Error updating credits for refund:", updateError);
      return {
        success: false,
        error: "Failed to refund credit",
      };
    }

    console.log(
      "✅ Credit refunded successfully. New balance:",
      updatedData.available_credits
    );

    return {
      success: true,
      remainingCredits: updatedData.available_credits,
    };
  } catch (error) {
    console.error("❌ Exception during credit refund:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
