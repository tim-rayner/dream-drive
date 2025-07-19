import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    console.log("🔍 RLS Test: Testing policies for user:", userId);

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Test 1: Try to read with regular client (should respect RLS)
    console.log("📊 RLS Test: Testing with regular client...");
    const { data: regularData, error: regularError } = await supabase
      .from("generations")
      .select("id, user_id, created_at")
      .eq("user_id", userId)
      .limit(5);

    console.log("📊 RLS Test: Regular client result:", {
      count: regularData?.length || 0,
      error: regularError,
      data: regularData?.map((g) => ({ id: g.id, user_id: g.user_id })),
    });

    // Test 2: Check if the user is authenticated in the current session
    console.log("📊 RLS Test: Checking current session...");
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();

    console.log("📊 RLS Test: Session result:", {
      currentUser: user?.id,
      sessionError: sessionError,
      matchesTargetUser: user?.id === userId,
    });

    // Test 3: Try to read without user_id filter (should be blocked by RLS)
    console.log("📊 RLS Test: Testing without user filter...");
    const { data: allData, error: allError } = await supabase
      .from("generations")
      .select("id, user_id, created_at")
      .limit(5);

    console.log("📊 RLS Test: All data result:", {
      count: allData?.length || 0,
      error: allError,
      data: allData?.map((g) => ({ id: g.id, user_id: g.user_id })),
    });

    return NextResponse.json({
      success: true,
      rlsTest: {
        userId,
        regularClientResult: {
          count: regularData?.length || 0,
          error: regularError,
          data: regularData?.slice(0, 3),
        },
        sessionResult: {
          currentUser: user?.id,
          sessionError: sessionError,
          matchesTargetUser: user?.id === userId,
        },
        allDataResult: {
          count: allData?.length || 0,
          error: allError,
          data: allData?.slice(0, 3),
        },
      },
    });
  } catch (error) {
    console.error("❌ RLS Test error:", error);
    return NextResponse.json({ error: "RLS test failed" }, { status: 500 });
  }
}
