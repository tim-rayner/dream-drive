import { creditPacks } from "@/lib/constants/stripeCreditPacks";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const priceId = searchParams.get("priceId");

    if (!priceId) {
      return NextResponse.json({
        error: "Missing priceId parameter",
        usage: "Add ?priceId=your_price_id to test",
      });
    }

    const isValid =
      creditPacks[priceId as keyof typeof creditPacks] !== undefined;
    const packDetails = creditPacks[priceId as keyof typeof creditPacks];

    return NextResponse.json({
      priceId,
      isValid,
      packDetails,
      availablePriceIds: Object.keys(creditPacks),
      environment: {
        STRIPE_STARTER_PRICE_ID:
          process.env.STRIPE_STARTER_PRICE_ID || "NOT_SET",
        STRIPE_EXPLORER_PRICE_ID:
          process.env.STRIPE_EXPLORER_PRICE_ID || "NOT_SET",
        STRIPE_CRUISER_PRICE_ID:
          process.env.STRIPE_CRUISER_PRICE_ID || "NOT_SET",
        STRIPE_SCENIC_PRICE_ID: process.env.STRIPE_SCENIC_PRICE_ID || "NOT_SET",
        STRIPE_GRAND_TOURER_PRICE_ID:
          process.env.STRIPE_GRAND_TOURER_PRICE_ID || "NOT_SET",
        STRIPE_DEALERSHIP_PRICE_ID:
          process.env.STRIPE_DEALERSHIP_PRICE_ID || "NOT_SET",
        STRIPE_PRO_STUDIO_PRICE_ID:
          process.env.STRIPE_PRO_STUDIO_PRICE_ID || "NOT_SET",
        STRIPE_ENTERPRISE_PRICE_ID:
          process.env.STRIPE_ENTERPRISE_PRICE_ID || "NOT_SET",
      },
    });
  } catch (error: unknown) {
    console.error("Error testing price ID:", error);
    return NextResponse.json(
      { error: "Failed to test price ID", details: error },
      { status: 500 }
    );
  }
}
