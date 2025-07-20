import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Check if environment variables are loaded
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? "SET" : "NOT_SET",
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

    // Count how many are set vs not set
    const setCount = Object.values(envCheck).filter(
      (val) => val !== "NOT_SET"
    ).length;
    const totalCount = Object.keys(envCheck).length;

    return NextResponse.json({
      message: "Environment variable check",
      environment: envCheck,
      summary: {
        totalVariables: totalCount,
        setVariables: setCount,
        missingVariables: totalCount - setCount,
        percentageSet: Math.round((setCount / totalCount) * 100),
      },
    });
  } catch (error: unknown) {
    console.error("Error checking environment:", error);
    return NextResponse.json(
      { error: "Failed to check environment", details: error },
      { status: 500 }
    );
  }
}
