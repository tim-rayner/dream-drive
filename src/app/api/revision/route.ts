import { refundCredit } from "@/lib/actions/refundCredit";
import { generationRateLimiter, rateLimit } from "@/lib/rateLimit";
import { supabaseAdmin } from "@/lib/supabase";
import { validateRevisionRequest } from "@/lib/validateRevision";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface RevisionRequest {
  originalGenerationId: string;
  carImage: string; // Must match original
  sceneImage: string; // Can be different
  lat: number;
  lng: number;
  timeOfDay: "sunrise" | "afternoon" | "dusk" | "night";
  customInstructions?: string;
}

// Reverse geocoding to get place names
async function getPlaceDescription(lat: number, lng: number): Promise<string> {
  console.log("🚀 getPlaceDescription function called");
  try {
    console.log(`🔍 Reverse geocoding coordinates: ${lat}, ${lng}`);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    console.log(
      `🔑 Environment variable check: ${
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? "Present" : "Missing"
      }`
    );

    if (!apiKey) {
      console.error(
        "❌ Google Maps API key is missing from environment variables"
      );
      throw new Error("Google Maps API key is missing");
    }

    console.log(`🔑 API key present: ${apiKey ? "Yes" : "No"}`);
    console.log(`🔑 API key length: ${apiKey.length}`);
    console.log(`🔑 API key starts with: ${apiKey.substring(0, 10)}...`);

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    console.log(
      `🌐 Geocoding URL: ${geocodeUrl.replace(
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        "[API_KEY]"
      )}`
    );
    console.log(`🔍 Full URL (with key): ${geocodeUrl}`);

    const response = await fetch(geocodeUrl);
    console.log(
      `📡 Geocoding response status: ${response.status} ${response.statusText}`
    );

    // Log response headers for debugging
    console.log(
      "📋 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ Geocoding API error: ${response.status} - ${errorText}`
      );
      throw new Error(`Geocoding API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("📍 Raw geocoding response:", JSON.stringify(data, null, 2));

    if (data.status !== "OK") {
      console.error("❌ Geocoding API returned status:", data.status);
      if (data.error_message) {
        console.error("❌ Error message:", data.error_message);
      }

      // Handle specific error cases
      if (data.status === "REQUEST_DENIED") {
        console.error("❌ Request denied - check API key and billing");
        console.error(
          "❌ Make sure Geocoding API is enabled and billing is set up"
        );
      } else if (data.status === "OVER_QUERY_LIMIT") {
        console.error("❌ Over query limit - check billing and quotas");
      } else if (data.status === "ZERO_RESULTS") {
        console.error("❌ No results found for these coordinates");
      }

      throw new Error(
        `Geocoding API error: ${data.status}${
          data.error_message ? ` - ${data.error_message}` : ""
        }`
      );
    }

    if (!data.results || data.results.length === 0) {
      console.error("❌ No results found in geocoding response");
      throw new Error("No location data found");
    }

    console.log("✅ Geocoding API call successful");
    console.log("📊 Number of results:", data.results.length);

    const result = data.results[0];
    const addressComponents = result.address_components;

    console.log("🏠 Full address components:", addressComponents);

    // Extract locality (city/town) and administrative_area_level_1 (state/county)
    let locality = "";
    let administrativeArea = "";
    let country = "";
    let streetNumber = "";
    let route = "";
    let postalCode = "";
    let sublocality = "";
    let neighborhood = "";

    console.log("🔍 Processing address components...");
    for (const component of addressComponents) {
      console.log(
        `  📝 Component: ${component.long_name} (${component.types.join(", ")})`
      );

      if (component.types.includes("locality")) {
        locality = component.long_name;
        console.log(`    ✅ Found locality: ${locality}`);
      } else if (component.types.includes("administrative_area_level_1")) {
        administrativeArea = component.long_name;
        console.log(`    ✅ Found administrative area: ${administrativeArea}`);
      } else if (component.types.includes("country")) {
        country = component.long_name;
        console.log(`    ✅ Found country: ${country}`);
      } else if (component.types.includes("street_number")) {
        streetNumber = component.long_name;
        console.log(`    ✅ Found street number: ${streetNumber}`);
      } else if (component.types.includes("route")) {
        route = component.long_name;
        console.log(`    ✅ Found route: ${route}`);
      } else if (component.types.includes("postal_code")) {
        postalCode = component.long_name;
        console.log(`    ✅ Found postal code: ${postalCode}`);
      } else if (component.types.includes("sublocality")) {
        sublocality = component.long_name;
        console.log(`    ✅ Found sublocality: ${sublocality}`);
      } else if (component.types.includes("neighborhood")) {
        neighborhood = component.long_name;
        console.log(`    ✅ Found neighborhood: ${neighborhood}`);
      }
    }

    console.log("🏘️ Extracted location data:", {
      streetNumber,
      route,
      locality,
      administrativeArea,
      country,
      postalCode,
      sublocality,
      neighborhood,
    });

    // Build a natural place description
    console.log("🏗️ Building place description...");
    let placeDescription = "";
    if (locality && administrativeArea) {
      placeDescription = `${locality}, ${administrativeArea}`;
      console.log(
        `    ✅ Using locality + administrative area: ${placeDescription}`
      );
    } else if (locality) {
      placeDescription = locality;
      console.log(`    ✅ Using locality only: ${placeDescription}`);
    } else if (sublocality && administrativeArea) {
      placeDescription = `${sublocality}, ${administrativeArea}`;
      console.log(
        `    ✅ Using sublocality + administrative area: ${placeDescription}`
      );
    } else if (sublocality) {
      placeDescription = sublocality;
      console.log(`    ✅ Using sublocality only: ${placeDescription}`);
    } else if (administrativeArea) {
      placeDescription = administrativeArea;
      console.log(`    ✅ Using administrative area only: ${placeDescription}`);
    } else if (neighborhood) {
      placeDescription = neighborhood;
      console.log(`    ✅ Using neighborhood: ${placeDescription}`);
    } else if (route) {
      // Use street name if available
      placeDescription = route;
      if (streetNumber) {
        placeDescription = `${streetNumber} ${route}`;
      }
      console.log(`    ✅ Using route: ${placeDescription}`);
    } else if (country) {
      placeDescription = country;
      console.log(`    ✅ Using country: ${placeDescription}`);
    } else {
      placeDescription = "this location";
      console.log(
        `    ❌ No usable address components found, using fallback: ${placeDescription}`
      );
    }

    if (
      country &&
      country !== administrativeArea &&
      !placeDescription.includes(country)
    ) {
      placeDescription += `, ${country}`;
    }

    console.log("🎯 Final place description:", placeDescription);
    return placeDescription;
  } catch (error) {
    console.error("❌ Error in reverse geocoding:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return "this location";
  }
}

// Helper to call Replicate API with fetch
async function callReplicate({
  version,
  input,
}: {
  version: string;
  input: unknown;
}): Promise<unknown> {
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  if (!replicateToken) throw new Error("Replicate API token not configured");
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${replicateToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ version, input }),
  });
  if (!response.ok) {
    const errorData = await response.text();

    // Show user-friendly message for any Replicate API error
    throw new Error(
      "Our servers are currently experiencing high load, please check back later"
    );
  }
  const prediction = await response.json();
  // Poll for completion
  let attempts = 0;
  const maxAttempts = 60;
  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const statusResponse = await fetch(
      `https://api.replicate.com/v1/predictions/${prediction.id}`,
      {
        headers: {
          Authorization: `Token ${replicateToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!statusResponse.ok)
      throw new Error(
        "Our servers are currently experiencing high load, please check back later"
      );
    const statusData = await statusResponse.json();
    if (statusData.status === "succeeded") {
      return statusData.output;
    } else if (statusData.status === "failed") {
      throw new Error(
        "Our servers are currently experiencing high load, please check back later"
      );
    }
    attempts++;
  }
  throw new Error(
    "Our servers are currently experiencing high load, please check back later"
  );
}

// Generate scene description using BLIP
async function generateSceneDescription(
  sceneImage: string,
  placeDescription: string
): Promise<string> {
  const output = await callReplicate({
    version:
      "salesforce/blip:2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746",
    input: {
      image: sceneImage, // base64 data URI
      task: "image_captioning",
      caption: `Describe this place in a natural, engaging way. Focus on the visual elements, atmosphere, and mood. Location: ${placeDescription}`,
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
}

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

// Generate final image with car in scene
async function generateFinalImage(
  carImage: string,
  sceneImage: string,
  sceneDescription: string,
  timeOfDay: string,
  placeDescription: string,
  customInstructions?: string
): Promise<string> {
  // Compose the improved prompt
  const carDescription = await analyzeCarImage(carImage);
  console.log("🚗 Car analysis result:", carDescription);
  let finalPrompt = `Generate a single, photorealistic image of the car from the uploaded photo, placed in the provided location scene (${sceneDescription} ${timeOfDay} in ${placeDescription}). CRITICAL: Remove ALL text, overlays, watermarks, logos, copyright notices, or any Google-related elements (including "Google", "Google Maps", "© Google", or any similar text) from both the car image and the location image. The final image must contain NO text, watermarks, or overlays whatsoever. IMPORTANT: The time of day must be ${timeOfDay} and there must be NO mention or depiction of any other time of day. Only show the time of day provided, and do not reference or suggest any other time of day. STRICT RULE: Do NOT generate collages, split views, or multiple images—output only ONE single, natural, realistic shot. Do not invent or add any other vehicles, objects, or features. The background should be the provided location image, and the car should be seamlessly integrated with natural lighting and shadows matching the ${timeOfDay} setting. Do not alter the car's appearance, color, or shape. Only adapt the background and lighting to match the new scene. Ultra-realistic, cinematic, high resolution.`;
  if (customInstructions && customInstructions.trim().length > 0) {
    finalPrompt += ` ${customInstructions.trim()}`;
  }
  console.log("🎨 Final image generation prompt:", finalPrompt);
  const output = await callReplicate({
    version: "flux-kontext-apps/multi-image-kontext-pro",
    input: {
      input_image_1: carImage,
      input_image_2: sceneImage,
      prompt: finalPrompt,
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
}

export async function POST(request: NextRequest) {
  let originalGenerationUpdated = false;
  let requestBody: RevisionRequest | null = null;

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
      console.log("❌ Authentication failed:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: RevisionRequest = await request.json();
    requestBody = body;

    // Validate required fields
    if (!body.originalGenerationId || !body.carImage || !body.sceneImage) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: originalGenerationId, carImage, sceneImage",
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

    // Validate the revision request using authenticated user
    const validation = await validateRevisionRequest(
      user.id,
      body.originalGenerationId,
      body.carImage
    );

    if (!validation.isValid) {
      console.log("❌ Revision validation failed:", validation.error);
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    console.log("✅ Revision validation passed");

    // 🔒 CRITICAL SECURITY: Ensure user has credits before proceeding
    const { data: creditData, error: creditError } = await supabase
      .from("credits")
      .select("available_credits")
      .eq("id", user.id)
      .single();

    if (creditError || !creditData || creditData.available_credits < 1) {
      console.log("❌ Insufficient credits for revision:", {
        error: creditError,
        credits: creditData?.available_credits || 0,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Insufficient credits for revision" },
        { status: 402 }
      );
    }

    console.log(
      "✅ User has sufficient credits:",
      creditData.available_credits
    );

    // 🔒 CRITICAL SECURITY: Deduct credit BEFORE processing
    const { data: updatedCredits, error: deductError } = await supabase
      .from("credits")
      .update({
        available_credits: creditData.available_credits - 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .eq("available_credits", creditData.available_credits) // Optimistic locking
      .select("available_credits")
      .single();

    if (deductError || !updatedCredits) {
      console.log("❌ Failed to deduct credit:", deductError);
      return NextResponse.json(
        { error: "Failed to process credit deduction" },
        { status: 500 }
      );
    }

    console.log(
      "✅ Credit deducted successfully:",
      updatedCredits.available_credits
    );

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

    // Generate image internally instead of calling external API
    console.log("🌍 Starting reverse geocoding for coordinates:", {
      lat: body.lat,
      lng: body.lng,
    });

    // Step 1: Get place description from coordinates
    let placeDescription = "this location"; // Default fallback
    console.log("🔄 About to call getPlaceDescription function...");
    try {
      placeDescription = await getPlaceDescription(body.lat, body.lng);
      console.log("✅ Place description retrieved:", placeDescription);
    } catch (error) {
      console.error("❌ Failed to get place description:", error);
      console.error("❌ Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      console.error("❌ Using fallback place description");
    }

    // Log the final place description that will be used
    console.log("🎯 Final place description for prompt:", placeDescription);

    // Step 2: Generate scene description using BLIP
    const sceneDescription = await generateSceneDescription(
      body.sceneImage,
      placeDescription
    );
    console.log("Scene description:", sceneDescription);

    // Step 3: Generate final image
    const timeOfDayText =
      body.timeOfDay === "sunrise"
        ? "at sunrise"
        : body.timeOfDay === "afternoon"
        ? "in the afternoon"
        : body.timeOfDay === "dusk"
        ? "at dusk"
        : "at night";

    const finalImageUrl = await generateFinalImage(
      body.carImage,
      body.sceneImage,
      sceneDescription,
      timeOfDayText,
      placeDescription,
      body.customInstructions
    );
    console.log("Final image generated:", finalImageUrl);

    // Save generation to database for authenticated user
    let savedGenerationId: string | null = null;
    try {
      console.log(
        "💾 Saving revision generation to database for user:",
        user.id
      );

      const generationData = {
        car_image_url: body.carImage,
        scene_image_url: body.sceneImage,
        lat: body.lat,
        lng: body.lng,
        time_of_day: body.timeOfDay,
        custom_instructions: body.customInstructions,
        final_image_url: finalImageUrl,
        place_description: placeDescription,
        scene_description: sceneDescription,
        user_id: user.id,
        is_revision: true,
        original_generation_id: body.originalGenerationId,
        revision_used: false,
      };

      // Use admin client if available, otherwise use authenticated client
      const client = supabaseAdmin || supabase;
      console.log(
        "📡 Using database client:",
        supabaseAdmin ? "admin" : "authenticated"
      );

      const { data: savedGeneration, error: saveError } = await client
        .from("generations")
        .insert(generationData)
        .select("id")
        .single();

      if (saveError) {
        console.error(
          "❌ Error saving revision generation to database:",
          saveError
        );
        console.error("❌ Error details:", {
          code: saveError.code,
          message: saveError.message,
          details: saveError.details,
          hint: saveError.hint,
        });
        // Don't fail the request if database save fails
      } else {
        savedGenerationId = savedGeneration?.id || null;
        console.log("✅ Revision generation saved with ID:", savedGenerationId);
      }
    } catch (error) {
      console.error("❌ Exception saving revision generation:", error);
      console.error("❌ Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Don't fail the request if database save fails
    }

    return NextResponse.json({
      success: true,
      imageUrl: finalImageUrl,
      placeDescription,
      sceneDescription,
      timeOfDay: body.timeOfDay,
      generationId: savedGenerationId,
      isRevision: true,
      originalGenerationId: body.originalGenerationId,
      creditsRemaining: updatedCredits.available_credits,
    });
  } catch (error) {
    console.error("❌ Error in revision API:", error);

    // If we marked the original generation as having a revision used but the generation failed,
    // we need to refund the credit and potentially revert the revision_used flag
    if (originalGenerationUpdated && requestBody) {
      console.log("🔄 Attempting to refund credit due to revision failure");
      try {
        // Get user from secure cookies for refund
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({
          cookies: () => cookieStore,
        });
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const refundResult = await refundCredit(user.id);
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
