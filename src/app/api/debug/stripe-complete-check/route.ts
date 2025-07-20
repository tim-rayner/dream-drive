import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(req: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Check secret key mode
    let secretKeyMode = "unknown";
    let secretKeyPrefix = "none";
    if (secretKey) {
      secretKeyPrefix = secretKey.substring(0, 7);
      if (secretKey.startsWith("sk_test_")) secretKeyMode = "test";
      else if (secretKey.startsWith("sk_live_")) secretKeyMode = "live";
    }

    // Check publishable key mode
    let publishableKeyMode = "unknown";
    let publishableKeyPrefix = "none";
    if (publishableKey) {
      publishableKeyPrefix = publishableKey.substring(0, 7);
      if (publishableKey.startsWith("pk_test_")) publishableKeyMode = "test";
      else if (publishableKey.startsWith("pk_live_"))
        publishableKeyMode = "live";
    }

    // Check webhook secret mode
    let webhookSecretMode = "unknown";
    if (webhookSecret) {
      if (webhookSecret.includes("whsec_test_")) webhookSecretMode = "test";
      else if (webhookSecret.includes("whsec_live_"))
        webhookSecretMode = "live";
      else webhookSecretMode = "unknown_format";
    }

    // Try to connect to Stripe
    let stripeConnection = null;
    if (secretKey) {
      try {
        const stripe = new Stripe(secretKey, {
          // @ts-expect-error Stripe types may lag behind latest API version
          apiVersion: "2023-10-16",
        });

        const account = await stripe.accounts.retrieve();
        stripeConnection = {
          success: true,
          accountId: account.id,
          mode: account.object === "account" ? "live" : "test",
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
        };
      } catch (error) {
        stripeConnection = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }

    // Get all environment variables for debugging
    const allEnvVars = {
      NODE_ENV: process.env.NODE_ENV,
      STRIPE_SECRET_KEY: secretKey ? `${secretKeyPrefix}...` : "NOT_SET",
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: publishableKey
        ? `${publishableKeyPrefix}...`
        : "NOT_SET",
      STRIPE_WEBHOOK_SECRET: webhookSecret ? "SET" : "NOT_SET",
      STRIPE_STARTER_PRICE_ID: process.env.STRIPE_STARTER_PRICE_ID || "NOT_SET",
      STRIPE_EXPLORER_PRICE_ID:
        process.env.STRIPE_EXPLORER_PRICE_ID || "NOT_SET",
      STRIPE_CRUISER_PRICE_ID: process.env.STRIPE_CRUISER_PRICE_ID || "NOT_SET",
      STRIPE_SCENIC_PRICE_ID: process.env.STRIPE_SCENIC_PRICE_ID || "NOT_SET",
      STRIPE_GRAND_TOURER_PRICE_ID:
        process.env.STRIPE_GRAND_TOURER_PRICE_ID || "NOT_SET",
      STRIPE_DEALERSHIP_PRICE_ID:
        process.env.STRIPE_DEALERSHIP_PRICE_ID || "NOT_SET",
      STRIPE_PRO_STUDIO_PRICE_ID:
        process.env.STRIPE_PRO_STUDIO_PRICE_ID || "NOT_SET",
      STRIPE_ENTERPRISE_PRICE_ID:
        process.env.STRIPE_ENTERPRISE_PRICE_ID || "NOT_SET",
    };

    return NextResponse.json({
      message: "Complete Stripe configuration check",
      summary: {
        secretKeyMode,
        publishableKeyMode,
        webhookSecretMode,
        allModesMatch:
          secretKeyMode === publishableKeyMode &&
          secretKeyMode === webhookSecretMode,
        isLiveMode: secretKeyMode === "live" && publishableKeyMode === "live",
      },
      details: {
        secretKey: {
          mode: secretKeyMode,
          prefix: secretKeyPrefix,
          set: !!secretKey,
        },
        publishableKey: {
          mode: publishableKeyMode,
          prefix: publishableKeyPrefix,
          set: !!publishableKey,
        },
        webhookSecret: {
          mode: webhookSecretMode,
          set: !!webhookSecret,
        },
        stripeConnection,
        environment: allEnvVars,
      },
    });
  } catch (error: unknown) {
    console.error("Error in complete Stripe check:", error);
    return NextResponse.json(
      { error: "Failed to check Stripe configuration", details: error },
      { status: 500 }
    );
  }
}
