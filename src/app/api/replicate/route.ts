import { NextRequest, NextResponse } from "next/server";

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

    // If the input contains a base64 image, we'll use it directly
    // Most Replicate models accept base64 data URLs directly
    const imageUrl = body.input?.image;
    if (imageUrl && imageUrl.startsWith("data:image/")) {
      // Keep the base64 image as is - many Replicate models accept this format
      // If this specific model doesn't support base64, we'll get a clear error
      console.log("Using base64 image directly with Replicate");
    }

    // Forward the request to Replicate API
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${replicateToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Replicate API error:", response.status, errorData);
      console.error("Request body sent:", JSON.stringify(body, null, 2));

      // Handle specific error cases
      if (response.status === 402) {
        return NextResponse.json(
          { error: "Our AI is down at the moment, come back soon..." },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: `Replicate API error: ${response.status} - ${errorData}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in Replicate API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const predictionId = searchParams.get("id");

    if (!predictionId) {
      return NextResponse.json(
        { error: "Prediction ID is required" },
        { status: 400 }
      );
    }

    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (!replicateToken) {
      return NextResponse.json(
        { error: "Replicate API token not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Token ${replicateToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Replicate API error:", response.status, errorData);
      return NextResponse.json(
        { error: `Replicate API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in Replicate API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
