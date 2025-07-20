import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-expect-error Stripe types may lag behind latest API version
  apiVersion: "2023-10-16",
});

export async function GET(req: NextRequest) {
  try {
    // List all prices from your Stripe account
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

    return NextResponse.json({
      message: "Available Stripe prices",
      count: priceList.length,
      prices: priceList,
    });
  } catch (error: unknown) {
    console.error("Error fetching Stripe prices:", error);
    return NextResponse.json(
      { error: "Failed to fetch prices" },
      { status: 500 }
    );
  }
}
