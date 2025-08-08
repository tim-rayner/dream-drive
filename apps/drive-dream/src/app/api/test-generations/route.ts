import { apiRateLimiter, rateLimit } from "@/lib/rateLimit";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // 🔒 SECURITY: Apply rate limiting
    const rateLimitResult = rateLimit(request, apiRateLimiter);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Get authenticated user from secure cookies
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("❌ Authentication failed:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(
      "🧪 Test: Checking generations for authenticated user:",
      user.id
    );

    // Simple test - just get the count
    const { count, error } = await supabase
      .from("generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    console.log("🧪 Test: Count result:", { count, error });

    // Also try to get actual data
    const { data, error: dataError } = await supabase
      .from("generations")
      .select("id, user_id, created_at, place_description")
      .eq("user_id", user.id)
      .limit(5);

    console.log("🧪 Test: Data result:", {
      count: data?.length || 0,
      error: dataError,
      data: data?.map((g) => ({ id: g.id, created_at: g.created_at })),
    });

    return NextResponse.json({
      success: true,
      test: {
        userId: user.id,
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
