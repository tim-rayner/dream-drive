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
    const { priceId }: { priceId: keyof typeof creditPacks } = await req.json();

    if (!priceId || !creditPacks[priceId]) {
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

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price: priceId,
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

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: unknown) {
    console.error("Stripe Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
