import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get("url");

    if (!videoUrl) {
      return NextResponse.json({ error: "Missing video URL" }, { status: 400 });
    }

    // Validate that the URL is from Replicate
    if (
      !videoUrl.includes("replicate.delivery") &&
      !videoUrl.includes("replicate.com")
    ) {
      return NextResponse.json({ error: "Invalid video URL" }, { status: 400 });
    }

    console.log("🎬 Proxying video request:", videoUrl);

    // Fetch the video from Replicate
    const response = await fetch(videoUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DreamDrive/1.0)",
      },
    });

    if (!response.ok) {
      console.error(
        "❌ Failed to fetch video:",
        response.status,
        response.statusText
      );
      return NextResponse.json(
        { error: `Failed to fetch video: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the video content
    const videoBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "video/mp4";

    console.log(
      "✅ Video proxied successfully, size:",
      videoBuffer.byteLength,
      "bytes"
    );

    // Return the video with proper headers
    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": videoBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("❌ Error proxying video:", error);
    return NextResponse.json(
      { error: "Failed to proxy video" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
