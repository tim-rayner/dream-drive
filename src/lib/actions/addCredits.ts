"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Allowed credit amounts
const ALLOWED_CREDIT_AMOUNTS = [1, 10, 50, 100, 150, 1000];

export async function addCredits(amount: number) {
  try {
    // Validate amount
    if (!ALLOWED_CREDIT_AMOUNTS.includes(amount)) {
      throw new Error(
        `Invalid credit amount: ${amount}. Allowed amounts: ${ALLOWED_CREDIT_AMOUNTS.join(
          ", "
        )}`
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      throw new Error("Unauthorized: No valid session");
    }

    const userId = session.user.id;

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
        throw new Error("Failed to create credits row");
      }

      return {
        success: true,
        totalCredits: newCredits.available_credits,
        addedCredits: amount,
      };
    } else if (fetchError) {
      throw new Error("Failed to fetch credits");
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
      throw new Error("Failed to update credits");
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
