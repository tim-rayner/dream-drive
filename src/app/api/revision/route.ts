import { refundCredit } from "@/lib/actions/refundCredit";
import { supabaseAdmin } from "@/lib/supabase";
import { validateRevisionRequest } from "@/lib/validateRevision";
import { NextRequest, NextResponse } from "next/server";

interface RevisionRequest {
  originalGenerationId: string;
  carImage: string; // Must match original
  sceneImage: string; // Can be different
  lat: number;
  lng: number;
  timeOfDay: "sunrise" | "afternoon" | "dusk" | "night";
  customInstructions?: string;
  userId: string;
}

export async function POST(request: NextRequest) {
  let originalGenerationUpdated = false;
  let requestBody: RevisionRequest | null = null;

  try {
    const body: RevisionRequest = await request.json();
    requestBody = body;

    // Validate required fields
    if (
      !body.originalGenerationId ||
      !body.carImage ||
      !body.sceneImage ||
      !body.userId
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: originalGenerationId, carImage, sceneImage, userId",
        },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (
      typeof body.lat !== "number" ||
      typeof body.lng !== "number" ||
      body.lat < -90 ||
      body.lat > 90 ||
      body.lng < -180 ||
      body.lng > 180
    ) {
      return NextResponse.json(
        {
          error: "Valid coordinates (lat, lng) are required",
        },
        { status: 400 }
      );
    }

    // Validate time of day
    const validTimeOfDay = ["sunrise", "afternoon", "dusk", "night"];
    if (!validTimeOfDay.includes(body.timeOfDay)) {
      return NextResponse.json(
        {
          error:
            "Invalid timeOfDay. Must be one of: sunrise, afternoon, dusk, night",
        },
        { status: 400 }
      );
    }

    console.log(
      "🔄 Starting revision validation for generation:",
      body.originalGenerationId
    );

    // Validate the revision request
    const validation = await validateRevisionRequest(
      body.userId,
      body.originalGenerationId,
      body.carImage
    );

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || "Revision validation failed" },
        { status: 400 }
      );
    }

    const originalGeneration = validation.originalGeneration!;

    console.log("✅ Revision validation passed, starting image generation...");

    // Mark the original generation as having a revision used
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Admin database access not configured" },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("generations")
      .update({ revision_used: true })
      .eq("id", body.originalGenerationId);

    if (updateError) {
      console.error("Error marking revision as used:", updateError);
      return NextResponse.json(
        { error: "Failed to update original generation" },
        { status: 500 }
      );
    }

    originalGenerationUpdated = true;
    console.log("✅ Original generation marked as revision used");

    // Call the main generation API with revision flags
    const generationResponse = await fetch(
      `${request.nextUrl.origin}/api/generateFinalImage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carImage: body.carImage,
          sceneImage: body.sceneImage,
          lat: body.lat,
          lng: body.lng,
          timeOfDay: body.timeOfDay,
          customInstructions: body.customInstructions,
          userId: body.userId,
          isRevision: true,
          originalGenerationId: body.originalGenerationId,
        }),
      }
    );

    if (!generationResponse.ok) {
      const errorData = await generationResponse.text();
      console.error("Generation API error:", errorData);
      return NextResponse.json(
        { error: `Image generation failed: ${errorData}` },
        { status: 500 }
      );
    }

    const generationResult = await generationResponse.json();

    return NextResponse.json({
      success: true,
      imageUrl: generationResult.imageUrl,
      placeDescription: generationResult.placeDescription,
      sceneDescription: generationResult.sceneDescription,
      timeOfDay: generationResult.timeOfDay,
      generationId: generationResult.generationId,
      isRevision: true,
      originalGenerationId: body.originalGenerationId,
    });
  } catch (error) {
    console.error("❌ Error in revision API:", error);

    // If we marked the original generation as having a revision used but the generation failed,
    // we need to refund the credit and potentially revert the revision_used flag
    if (originalGenerationUpdated && requestBody) {
      console.log("🔄 Attempting to refund credit due to revision failure");
      try {
        const refundResult = await refundCredit(requestBody.userId);
        if (refundResult.success) {
          console.log(
            "✅ Credit refunded successfully due to revision failure"
          );

          // Optionally revert the revision_used flag if the generation failed
          if (supabaseAdmin) {
            const { error: revertError } = await supabaseAdmin
              .from("generations")
              .update({ revision_used: false })
              .eq("id", requestBody.originalGenerationId);

            if (revertError) {
              console.error(
                "❌ Failed to revert revision_used flag:",
                revertError
              );
            } else {
              console.log(
                "✅ Reverted revision_used flag for original generation"
              );
            }
          }
        } else {
          console.error("❌ Failed to refund credit:", refundResult.error);
        }
      } catch (refundError) {
        console.error("❌ Exception during credit refund:", refundError);
      }
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
