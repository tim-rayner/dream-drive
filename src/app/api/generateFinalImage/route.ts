import { generationRateLimiter, rateLimit } from "@/lib/rateLimit";
import { callReplicate } from "@/lib/replicate";
import { supabaseAdmin, type CreateGenerationData } from "@/lib/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface GenerateFinalImageRequest {
  carImage: string; // base64 or URL
  sceneImage: string; // base64 or URL
  lat: number;
  lng: number;
  timeOfDay: "sunrise" | "afternoon" | "dusk" | "night";
  customInstructions?: string; // Add optional customInstructions
  userId?: string; // New: for saving generation
  isRevision?: boolean; // New: revision flag
  originalGenerationId?: string; // New: links to original
}

// Reverse geocoding to get place names
async function getPlaceDescription(lat: number, lng: number): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      throw new Error("Google Maps API key is missing");
    }

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    const response = await fetch(geocodeUrl);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Geocoding API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error(
        `Geocoding API error: ${data.status}${
          data.error_message ? ` - ${data.error_message}` : ""
        }`
      );
    }

    if (!data.results || data.results.length === 0) {
      throw new Error("No location data found");
    }

    const result = data.results[0];
    const addressComponents = result.address_components;

    // Extract locality (city/town) and administrative_area_level_1 (state/county)
    let locality = "";
    let administrativeArea = "";
    let country = "";
    let streetNumber = "";
    let route = "";
    let postalCode = "";
    let sublocality = "";
    let neighborhood = "";

    for (const component of addressComponents) {
      if (component.types.includes("locality")) {
        locality = component.long_name;
      } else if (component.types.includes("administrative_area_level_1")) {
        administrativeArea = component.long_name;
      } else if (component.types.includes("country")) {
        country = component.long_name;
      } else if (component.types.includes("street_number")) {
        streetNumber = component.long_name;
      } else if (component.types.includes("route")) {
        route = component.long_name;
      } else if (component.types.includes("postal_code")) {
        postalCode = component.long_name;
      } else if (component.types.includes("sublocality")) {
        sublocality = component.long_name;
      } else if (component.types.includes("neighborhood")) {
        neighborhood = component.long_name;
      }
    }

    // Build a natural place description
    let placeDescription = "";
    if (locality && administrativeArea) {
      placeDescription = `${locality}, ${administrativeArea}`;
    } else if (locality) {
      placeDescription = locality;
    } else if (sublocality && administrativeArea) {
      placeDescription = `${sublocality}, ${administrativeArea}`;
    } else if (sublocality) {
      placeDescription = sublocality;
    } else if (administrativeArea) {
      placeDescription = administrativeArea;
    } else if (neighborhood) {
      placeDescription = neighborhood;
    } else if (route) {
      // Use street name if available
      placeDescription = route;
      if (streetNumber) {
        placeDescription = `${streetNumber} ${route}`;
      }
    } else if (country) {
      placeDescription = country;
    } else {
      placeDescription = "this location";
    }

    if (
      country &&
      country !== administrativeArea &&
      !placeDescription.includes(country)
    ) {
      placeDescription += `, ${country}`;
    }

    return placeDescription;
  } catch (error) {
    return "this location";
  }
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
      width: 1024,
      height: 1024,
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

    if (!creditData || creditData.available_credits < 1) {
      console.error("❌ Insufficient credits:", {
        available: creditData?.available_credits || 0,
        userId: user.id,
      });
      return NextResponse.json(
        {
          error: `Insufficient credits: ${
            creditData?.available_credits || 0
          } available`,
        },
        { status: 402 }
      );
    }

    // 🔒 CRITICAL SECURITY: Deduct credit BEFORE any image generation
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
      console.error("❌ Failed to deduct credit:", deductError);
      return NextResponse.json(
        { error: "Failed to process credit deduction" },
        { status: 500 }
      );
    }

    const body: GenerateFinalImageRequest = await request.json();

    // Validate required fields
    if (!body.carImage || !body.sceneImage || !body.timeOfDay) {
      return NextResponse.json(
        {
          error: "Missing required fields: carImage, sceneImage, timeOfDay",
        },
        { status: 400 }
      );
    }

    // Validate coordinates are provided and valid
    if (
      typeof body.lat !== "number" ||
      typeof body.lng !== "number" ||
      body.lat === 0 ||
      body.lng === 0 ||
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

    // Step 1: Get place description from coordinates
    let placeDescription = "this location"; // Default fallback
    try {
      placeDescription = await getPlaceDescription(body.lat, body.lng);
    } catch (error) {}

    // Step 2: Generate scene description using BLIP
    const sceneDescription = await generateSceneDescription(
      body.sceneImage,
      placeDescription
    );

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

    // Save generation to database for authenticated user
    let savedGenerationId: string | null = null;
    try {
      const generationData: CreateGenerationData = {
        car_image_url: body.carImage,
        scene_image_url: body.sceneImage,
        lat: body.lat,
        lng: body.lng,
        time_of_day: body.timeOfDay,
        custom_instructions: body.customInstructions,
        final_image_url: finalImageUrl,
        place_description: placeDescription,
        scene_description: sceneDescription,
      };

      // Use admin client if available, otherwise use authenticated client
      const client = supabaseAdmin || supabase;

      const { data: savedGeneration, error: saveError } = await client
        .from("generations")
        .insert({
          ...generationData,
          user_id: user.id,
          is_revision: body.isRevision || false,
          original_generation_id: body.originalGenerationId || null,
          revision_used: false,
        })
        .select("id")
        .single();

      if (saveError) {
        console.error("❌ Error saving generation to database:", saveError);
        console.error("❌ Error details:", {
          code: saveError.code,
          message: saveError.message,
          details: saveError.details,
          hint: saveError.hint,
        });
        // Don't fail the request if database save fails
      } else {
        savedGenerationId = savedGeneration?.id || null;
      }
    } catch (error) {
      // Don't fail the request if database save fails
      console.error("❌ Error saving generation to database:", error);
    }

    return NextResponse.json({
      success: true,
      imageUrl: finalImageUrl,
      placeDescription,
      sceneDescription,
      timeOfDay: body.timeOfDay,
      generationId: savedGenerationId,
      creditsRemaining: updatedCredits.available_credits,
    });
  } catch (error) {
    console.error("Error in generateFinalImage:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
