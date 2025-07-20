import { creditPacks } from "@/lib/constants/stripeCreditPacks";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-expect-error Stripe types may lag behind latest API version
  apiVersion: "2023-10-16",
});

export async function POST(req: NextRequest) {
  try {
    // Check if Stripe secret key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("❌ STRIPE_SECRET_KEY not configured");
      return NextResponse.json(
        {
          error: "Stripe configuration error",
          details: "Secret key not configured",
        },
        { status: 500 }
      );
    }

    // Check if the secret key is valid format
    if (!process.env.STRIPE_SECRET_KEY.startsWith("sk_")) {
      console.error(
        "❌ STRIPE_SECRET_KEY format invalid:",
        process.env.STRIPE_SECRET_KEY.substring(0, 10) + "..."
      );
      return NextResponse.json(
        {
          error: "Stripe configuration error",
          details: "Invalid secret key format",
        },
        { status: 500 }
      );
    }

    const { priceId }: { priceId: keyof typeof creditPacks } = await req.json();

    console.log("🔍 Received priceId:", priceId);
    console.log("🔍 Available creditPacks keys:", Object.keys(creditPacks));
    console.log("🔍 creditPacks[priceId]:", creditPacks[priceId]);
    console.log("🔍 Environment variables:");
    console.log(
      "   STRIPE_STARTER_PRICE_ID:",
      process.env.STRIPE_STARTER_PRICE_ID || "NOT_SET"
    );
    console.log(
      "   STRIPE_EXPLORER_PRICE_ID:",
      process.env.STRIPE_EXPLORER_PRICE_ID || "NOT_SET"
    );
    console.log(
      "   STRIPE_CRUISER_PRICE_ID:",
      process.env.STRIPE_CRUISER_PRICE_ID || "NOT_SET"
    );
    console.log(
      "   STRIPE_SCENIC_PRICE_ID:",
      process.env.STRIPE_SCENIC_PRICE_ID || "NOT_SET"
    );
    console.log(
      "   STRIPE_GRAND_TOURER_PRICE_ID:",
      process.env.STRIPE_GRAND_TOURER_PRICE_ID || "NOT_SET"
    );
    console.log(
      "   STRIPE_DEALERSHIP_PRICE_ID:",
      process.env.STRIPE_DEALERSHIP_PRICE_ID || "NOT_SET"
    );
    console.log(
      "   STRIPE_PRO_STUDIO_PRICE_ID:",
      process.env.STRIPE_PRO_STUDIO_PRICE_ID || "NOT_SET"
    );
    console.log(
      "   STRIPE_ENTERPRISE_PRICE_ID:",
      process.env.STRIPE_ENTERPRISE_PRICE_ID || "NOT_SET"
    );

    if (!priceId || !creditPacks[priceId]) {
      console.log("❌ Invalid priceId validation failed");
      console.log("❌ priceId:", priceId);
      console.log("❌ creditPacks keys:", Object.keys(creditPacks));
      return NextResponse.json({ error: "Invalid priceId" }, { status: 400 });
    }

    // Get the JWT token from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing authorization token" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Validate the JWT token with Supabase
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {
            // Not needed for token validation
          },
        },
      }
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    console.log("🔍 Auth result:", { user: user?.id, error });

    if (error || !user) {
      console.log("❌ Authentication failed:", error);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ User authenticated:", user.id);

    // Log Stripe configuration
    console.log(
      "🔍 Stripe secret key prefix:",
      process.env.STRIPE_SECRET_KEY?.substring(0, 7)
    );
    console.log("🔍 Creating checkout session for priceId:", priceId);
    console.log("🔍 Origin URL:", req.nextUrl.origin);

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: priceId as string,
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        price_id: priceId,
      },
      success_url: `${req.nextUrl.origin}/buy?success=true`,
      cancel_url: `${req.nextUrl.origin}/buy?canceled=true`,
    });

    console.log("✅ Checkout session created:", checkoutSession.id);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: unknown) {
    console.error("Stripe Checkout error:", error);

    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Return more specific error information
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorName = error instanceof Error ? error.name : "UnknownError";

    return NextResponse.json(
      {
        error: "Internal server error",
        details: {
          message: errorMessage,
          type: errorName,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
