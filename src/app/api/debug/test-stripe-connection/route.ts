import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(req: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json({
        error: "STRIPE_SECRET_KEY not set",
        success: false,
      });
    }

    console.log("🔍 Testing Stripe connection...");
    console.log("🔍 Secret key prefix:", secretKey.substring(0, 7));

    const stripe = new Stripe(secretKey, {
      // @ts-expect-error Stripe types may lag behind latest API version
      apiVersion: "2023-10-16",
    });

    // Test basic Stripe connection by getting account info
    const account = await stripe.accounts.retrieve();

    console.log("✅ Stripe connection successful");
    console.log("✅ Account ID:", account.id);
    console.log("✅ Account mode:", account.object);

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        object: account.object,
        business_type: account.business_type,
        country: account.country,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      },
      configuration: {
        secretKeyPrefix: secretKey.substring(0, 7),
        isTestMode: secretKey.startsWith("sk_test_"),
        isLiveMode: secretKey.startsWith("sk_live_"),
      },
    });
  } catch (error: unknown) {
    console.error("❌ Stripe connection failed:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorName = error instanceof Error ? error.name : "UnknownError";

    return NextResponse.json(
      {
        success: false,
        error: {
          message: errorMessage,
          type: errorName,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
