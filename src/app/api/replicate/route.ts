import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (!replicateToken) {
      return NextResponse.json(
        { error: "Replicate API token not configured" },
        { status: 500 }
      );
    }
    const replicate = new Replicate({ auth: replicateToken });
    // The model/version and input should be provided in the body
    if (!body.version || !body.input) {
      return NextResponse.json(
        { error: "Missing model version or input in request body" },
        { status: 400 }
      );
    }
    const output = await replicate.run(body.version, { input: body.input });
    return NextResponse.json({ output });
  } catch (error) {
    console.error("Error in Replicate API route:", error);
    return NextResponse.json(
      {
        error:
          "Our servers are currently experiencing high load, please check back later",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: "Not implemented. Use POST." },
    { status: 405 }
  );
}
