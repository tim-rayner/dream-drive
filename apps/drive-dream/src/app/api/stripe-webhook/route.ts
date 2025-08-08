import { creditPacks } from "@/lib/constants/stripeCreditPacks";
import { apiRateLimiter, rateLimit } from "@/lib/rateLimit";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-expect-error Stripe types may lag behind latest API version
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // 🔒 SECURITY: Apply rate limiting (but be more lenient for webhooks)
    const rateLimitResult = rateLimit(req, apiRateLimiter);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("No Stripe signature in webhook");
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("Received webhook event:", event.type);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Processing checkout session:", session.id);

        // Extract metadata
        const user_id = session.metadata?.user_id;
        const price_id = session.metadata?.price_id;

        if (!user_id || !price_id) {
          console.error("Missing metadata in checkout session:", session.id);
          return NextResponse.json(
            { error: "Missing metadata" },
            { status: 400 }
          );
        }

        console.log("User ID:", user_id, "Price ID:", price_id);

        // Look up credit amount from server-only map
        const creditPack = creditPacks[price_id as keyof typeof creditPacks];
        if (!creditPack) {
          console.error("Invalid price_id in session:", price_id);
          return NextResponse.json(
            { error: "Invalid price_id" },
            { status: 400 }
          );
        }

        console.log("Credit pack found:", creditPack);

        try {
          // First, check if user has a credits row, create if not
          const { data: existingCredits, error: selectError } = await supabase
            .from("credits")
            .select("available_credits")
            .eq("id", user_id)
            .single();

          if (selectError && selectError.code !== "PGRST116") {
            console.error("Error checking existing credits:", selectError);
            return NextResponse.json(
              { error: "Failed to check credits" },
              { status: 500 }
            );
          }

          if (!existingCredits) {
            // Create new credits row for user
            const { error: insertError } = await supabase
              .from("credits")
              .insert({
                id: user_id,
                available_credits: creditPack.credits,
              });

            if (insertError) {
              console.error("Failed to create credits row:", insertError);
              return NextResponse.json(
                { error: "Failed to create credits" },
                { status: 500 }
              );
            }

            console.log(
              `Created new credits row for user ${user_id} with ${creditPack.credits} credits`
            );
          } else {
            // Update existing credits row
            const { error: updateError } = await supabase
              .from("credits")
              .update({
                available_credits:
                  existingCredits.available_credits + creditPack.credits,
              })
              .eq("id", user_id);

            if (updateError) {
              console.error("Failed to update credits:", updateError);
              return NextResponse.json(
                { error: "Failed to update credits" },
                { status: 500 }
              );
            }

            console.log(
              `Updated credits for user ${user_id}: added ${creditPack.credits} credits`
            );
          }

          // Log the credit purchase
          const { error: logError } = await supabase
            .from("credits_log")
            .insert({
              user_id,
              amount: creditPack.credits,
              source: "stripe",
              price_id,
              session_id: session.id,
              price_amount: session.amount_total
                ? session.amount_total / 100
                : null, // Convert from cents
              price_currency: session.currency?.toUpperCase() || "GBP",
            });

          if (logError) {
            console.error("Failed to log credit purchase:", logError);
            // Don't fail the webhook for logging errors
          } else {
            console.log(
              `Successfully logged credit purchase: ${creditPack.credits} credits for user ${user_id}`
            );
          }

          console.log(
            `Successfully processed webhook: added ${creditPack.credits} credits to user ${user_id}`
          );
        } catch (error) {
          console.error("Error processing webhook:", error);
          return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
          );
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
