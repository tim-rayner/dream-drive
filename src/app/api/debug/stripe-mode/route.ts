import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(req: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json({
        error: "STRIPE_SECRET_KEY not set",
        mode: "unknown",
      });
    }

    // Check if it's test or live mode based on the key prefix
    const isTestMode = secretKey.startsWith("sk_test_");
    const isLiveMode = secretKey.startsWith("sk_live_");

    let mode = "unknown";
    if (isTestMode) mode = "test";
    if (isLiveMode) mode = "live";

    // Try to create a Stripe instance to verify the key
    let stripeInfo = null;
    try {
      const stripe = new Stripe(secretKey, {
        // @ts-expect-error Stripe types may lag behind latest API version
        apiVersion: "2023-10-16",
      });

      // Get account info to verify the key works
      const account = await stripe.accounts.retrieve();
      stripeInfo = {
        id: account.id,
        business_type: account.business_type,
        country: account.country,
        default_currency: account.default_currency,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      };
    } catch (error) {
      stripeInfo = { error: "Failed to connect to Stripe" };
    }

    return NextResponse.json({
      mode,
      keyPrefix: secretKey.substring(0, 7) + "...",
      isTestMode,
      isLiveMode,
      stripeInfo,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        STRIPE_SECRET_KEY_SET: !!secretKey,
      },
    });
  } catch (error: unknown) {
    console.error("Error checking Stripe mode:", error);
    return NextResponse.json(
      { error: "Failed to check Stripe mode", details: error },
      { status: 500 }
    );
  }
}
