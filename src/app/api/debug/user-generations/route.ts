import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
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

    console.log("🔍 Debug: Testing user generations for:", user.id);

    // Test 1: Count all generations (admin view)
    console.log("📊 Debug: Testing admin count...");
    const { data: adminCount, error: adminError } = await supabase
      .from("generations")
      .select("id", { count: "exact", head: true });

    console.log("📊 Debug: Admin count result:", {
      count: adminCount,
      error: adminError,
    });

    // Test 2: Count user's generations (user view)
    console.log("📊 Debug: Testing user count...");
    const { data: userCount, error: userError } = await supabase
      .from("generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    console.log("📊 Debug: User count result:", {
      count: userCount,
      error: userError,
    });

    // Test 3: Get actual user generations
    console.log("📊 Debug: Testing user generations fetch...");
    const { data: userGenerations, error: fetchError } = await supabase
      .from("generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    console.log("📊 Debug: User generations result:", {
      count: userGenerations?.length || 0,
      error: fetchError,
      generations: userGenerations?.map((g) => ({
        id: g.id,
        created_at: g.created_at,
      })),
    });

    return NextResponse.json({
      success: true,
      debug: {
        userId: user.id,
        adminCount: adminCount,
        adminError: adminError,
        userCount: userCount,
        userError: userError,
        userGenerationsCount: userGenerations?.length || 0,
        fetchError: fetchError,
        sampleGenerations: userGenerations?.slice(0, 3).map((g) => ({
          id: g.id,
          user_id: g.user_id,
          created_at: g.created_at,
          place_description: g.place_description,
        })),
      },
    });
  } catch (error) {
    console.error("❌ Error in user generations debug:", error);
    return NextResponse.json(
      { error: "User generations debug failed" },
      { status: 500 }
    );
  }
}
