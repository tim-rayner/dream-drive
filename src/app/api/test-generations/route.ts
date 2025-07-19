import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    console.log("🧪 Test: Checking generations for user:", userId);

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Simple test - just get the count
    const { count, error } = await supabase
      .from("generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    console.log("🧪 Test: Count result:", { count, error });

    // Also try to get actual data
    const { data, error: dataError } = await supabase
      .from("generations")
      .select("id, user_id, created_at, place_description")
      .eq("user_id", userId)
      .limit(5);

    console.log("🧪 Test: Data result:", {
      count: data?.length || 0,
      error: dataError,
      data: data?.map((g) => ({ id: g.id, created_at: g.created_at })),
    });

    return NextResponse.json({
      success: true,
      test: {
        userId,
        countResult: { count, error },
        dataResult: {
          count: data?.length || 0,
          error: dataError,
          sampleData: data?.slice(0, 3),
        },
      },
    });
  } catch (error) {
    console.error("❌ Test error:", error);
    return NextResponse.json({ error: "Test failed" }, { status: 500 });
  }
}
