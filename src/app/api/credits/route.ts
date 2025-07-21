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

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Continue with logic...
    return NextResponse.json({ message: "You are authenticated!", user });
  } catch (error) {
    console.error("❌ Credits API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
