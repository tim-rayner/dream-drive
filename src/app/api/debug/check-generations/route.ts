import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Debug: Checking all generations in database");

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Admin client not available" },
        { status: 500 }
      );
    }

    // Get all generations (admin view, bypasses RLS)
    const { data: allGenerations, error } = await supabaseAdmin
      .from("generations")
      .select("id, user_id, created_at, place_description, is_revision")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("❌ Error fetching all generations:", error);
      return NextResponse.json(
        { error: "Failed to fetch generations" },
        { status: 500 }
      );
    }

    console.log("📊 Debug: Found generations:", {
      total: allGenerations?.length || 0,
      generations: allGenerations?.map((g) => ({
        id: g.id,
        user_id: g.user_id,
        created_at: g.created_at,
        place_description: g.place_description,
        is_revision: g.is_revision,
      })),
    });

    // Group by user_id to see distribution
    const userDistribution =
      allGenerations?.reduce((acc, gen) => {
        acc[gen.user_id] = (acc[gen.user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

    console.log("📊 Debug: User distribution:", userDistribution);

    return NextResponse.json({
      success: true,
      debug: {
        totalGenerations: allGenerations?.length || 0,
        userDistribution,
        sampleGenerations: allGenerations?.slice(0, 10).map((g) => ({
          id: g.id,
          user_id: g.user_id,
          created_at: g.created_at,
          place_description: g.place_description,
          is_revision: g.is_revision,
        })),
      },
    });
  } catch (error) {
    console.error("❌ Error in check-generations debug:", error);
    return NextResponse.json(
      { error: "Check generations debug failed" },
      { status: 500 }
    );
  }
}
