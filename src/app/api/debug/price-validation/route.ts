import { creditPacks } from "@/lib/constants/stripeCreditPacks";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-expect-error Stripe types may lag behind latest API version
  apiVersion: "2023-10-16",
});

export async function GET(req: NextRequest) {
  try {
    // Get all Stripe prices
    const prices = await stripe.prices.list({
      limit: 100,
      active: true,
    });

    const priceList = prices.data.map((price) => ({
      id: price.id,
      nickname: price.nickname,
      unit_amount: price.unit_amount,
      currency: price.currency,
      recurring: price.recurring,
      type: price.type,
    }));

    // Get environment variables (only show if they exist)
    const envVars = {
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

    // Check which price IDs from creditPacks exist in Stripe
    const expectedPriceIds = Object.keys(creditPacks);
    const availablePriceIds = priceList.map((p) => p.id);

    const validationResults = expectedPriceIds.map((priceId) => ({
      priceId,
      existsInStripe: availablePriceIds.includes(priceId),
      existsInEnv: Object.values(envVars).includes(priceId),
      isFallback:
        !Object.values(envVars).includes(priceId) &&
        creditPacks[priceId as keyof typeof creditPacks],
    }));

    return NextResponse.json({
      message: "Price ID validation results",
      environment: {
        nodeEnv: process.env.NODE_ENV,
        envVars,
      },
      creditPacks: {
        expectedPriceIds,
        packDetails: creditPacks,
      },
      stripe: {
        availablePriceIds,
        priceCount: priceList.length,
        prices: priceList,
      },
      validation: {
        results: validationResults,
        summary: {
          totalExpected: expectedPriceIds.length,
          totalAvailable: availablePriceIds.length,
          matchingIds: validationResults.filter((r) => r.existsInStripe).length,
          missingIds: validationResults.filter((r) => !r.existsInStripe).length,
        },
      },
    });
  } catch (error: unknown) {
    console.error("Error in price validation:", error);
    return NextResponse.json(
      { error: "Failed to validate prices", details: error },
      { status: 500 }
    );
  }
}
