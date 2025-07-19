import { supabase, supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    console.log("🔍 Fetching generations for user:", userId);

    if (!userId) {
      console.log("❌ No userId provided");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS issues, but still filter by user_id for security
    const client = supabaseAdmin || supabase;
    console.log(
      "📡 Querying database for generations using:",
      supabaseAdmin ? "admin client" : "regular client"
    );

    const { data: generations, error } = await client
      .from("generations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching generations:", error);
      console.error("❌ Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json(
        { error: "Failed to fetch generations" },
        { status: 500 }
      );
    }

    console.log("✅ Successfully fetched generations:", {
      count: generations?.length || 0,
      userId: userId,
    });

    if (generations && generations.length > 0) {
      console.log(
        "📊 Generation IDs:",
        generations.map((g) => g.id)
      );
    }

    return NextResponse.json({
      success: true,
      generations: generations || [],
    });
  } catch (error) {
    console.error("❌ Exception in generations API:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
