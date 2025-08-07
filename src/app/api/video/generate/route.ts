import { generationRateLimiter, rateLimit } from "@/lib/rateLimit";
import { callReplicate } from "@/lib/replicate";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Analyze car image to get specific details
async function analyzeCarImage(carImage: string): Promise<string> {
  try {
    const output = await callReplicate({
      version:
        "salesforce/blip:2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746",
      input: {
        image: carImage,
        task: "image_captioning",
        caption:
          "Describe this car in detail including make, model, color, body style, wheels, headlights, and any distinctive features. Be specific about the car's appearance.",
      },
    });
    if (typeof output === "string") return output;
    if (
      Array.isArray(output) &&
      output.length > 0 &&
      typeof output[0] === "string"
    )
      return output[0];
    throw new Error(
      "Our servers are currently experiencing high load, please check back later"
    );
  } catch (error) {
    console.error("Error analyzing car image:", error);
    return "a car"; // Fallback
  }
}

interface GenerateVideoRequest {
  imageUrl: string; // The generated image to animate
  prompt?: string; // Optional additional instructions for video generation
  carMake?: string; // Car make (optional)
  carModel?: string; // Car model (optional)
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 🔒 SECURITY: Apply rate limiting
    const rateLimitResult = rateLimit(request, generationRateLimiter);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Get authenticated user from secure cookies
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("❌ Authentication failed:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔒 CRITICAL SECURITY: Validate and deduct credits BEFORE any processing
    const { data: creditData, error: creditError } = await supabase
      .from("credits")
      .select("available_credits")
      .eq("id", user.id)
      .single();

    if (creditError) {
      console.error("❌ Error fetching credits:", creditError);
      // If no credits row exists, create one with 0 credits
      if (creditError.code === "PGRST116") {
        const { data: newCreditData, error: insertError } = await supabase
          .from("credits")
          .insert({ id: user.id, available_credits: 0 })
          .select("available_credits")
          .single();

        if (insertError) {
          console.error("❌ Failed to initialize credits:", insertError);
          return NextResponse.json(
            { error: "Failed to initialize credits" },
            { status: 500 }
          );
        }

        return NextResponse.json(
          { error: "Insufficient credits: 0 available" },
          { status: 402 }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch credits" },
        { status: 500 }
      );
    }

    if (!creditData || creditData.available_credits < 10) {
      console.error("❌ Insufficient credits:", {
        available: creditData?.available_credits || 0,
        userId: user.id,
      });
      return NextResponse.json(
        {
          error: `Insufficient credits: ${
            creditData?.available_credits || 0
          } available (10 required for video generation)`,
        },
        { status: 402 }
      );
    }

    // 🔒 CRITICAL SECURITY: Deduct 10 credits BEFORE any video generation
    const { data: updatedCredits, error: deductError } = await supabase
      .from("credits")
      .update({
        available_credits: creditData.available_credits - 10,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .eq("available_credits", creditData.available_credits) // Optimistic locking
      .select("available_credits")
      .single();

    if (deductError || !updatedCredits) {
      console.error("❌ Failed to deduct credit:", deductError);
      return NextResponse.json(
        { error: "Failed to process credit deduction" },
        { status: 500 }
      );
    }

    const body: GenerateVideoRequest = await request.json();

    // Validate required fields
    if (!body.imageUrl) {
      return NextResponse.json(
        {
          error: "Missing required field: imageUrl",
        },
        { status: 400 }
      );
    }

    console.log("🎬 Starting video generation...");
    console.log("🖼️ Image URL:", body.imageUrl);
    console.log("📝 User prompt:", body.prompt);

    // Use provided car make/model if available, otherwise analyze the image
    let carDescription: string;
    if (
      body.carMake &&
      body.carModel &&
      body.carMake.trim() &&
      body.carModel.trim()
    ) {
      carDescription = `${body.carMake.trim()} ${body.carModel.trim()}`;
    } else {
      carDescription = await analyzeCarImage(body.imageUrl);
    }

    // Build a descriptive prompt for realistic car motion with car context - rolling shot style
    const basePrompt = `A cinematic rolling shot video featuring ${carDescription} being filmed from another car driving alongside it. There should be a driver in th car. The camera should be positioned at the same height as the car, capturing a dynamic side-angle view as both vehicles drive forward down the road/terrain. The ${carDescription} should be driving at a realistic speed with proper physics - wheels rotating naturally, suspension responding to road conditions, and the vehicle maintaining smooth forward motion. The shot should look like it was filmed by a professional camera car, with the subject car being the main focus while maintaining cinematic quality and realistic driving dynamics.`;

    const fullPrompt =
      body.prompt && body.prompt.trim()
        ? `${basePrompt}. ${body.prompt.trim()}`
        : basePrompt;

    // Generate video using minimax/hailuo-02 model
    const videoResult = await callReplicate({
      version: "minimax/hailuo-02",
      input: {
        prompt: fullPrompt,
        duration: 6,
        resolution: "1080p",
        prompt_optimizer: true,
        first_frame_image: body.imageUrl,
      },
    });

    if (!videoResult || typeof videoResult !== "string") {
      throw new Error("Invalid video generation response");
    }

    console.log("✅ Video generation completed:", videoResult);

    // Save video generation to database
    let savedVideoId: string | null = null;
    try {
      const { data: savedVideo, error: saveError } = await supabase
        .from("video_generations")
        .insert({
          user_id: user.id,
          image_url: body.imageUrl,
          prompt: body.prompt || "", // Use empty string if no prompt provided
          video_url: videoResult,
          status: "completed",
        })
        .select("id")
        .single();

      if (saveError) {
        console.error(
          "❌ Error saving video generation to database:",
          saveError
        );
        // Don't fail the request if database save fails
      } else {
        savedVideoId = savedVideo?.id || null;
      }
    } catch (error) {
      console.error("❌ Error saving video generation to database:", error);
    }

    return NextResponse.json({
      success: true,
      videoUrl: videoResult,
      videoId: savedVideoId,
      creditsRemaining: updatedCredits.available_credits,
    });
  } catch (error) {
    console.error("Error in generateVideo:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
