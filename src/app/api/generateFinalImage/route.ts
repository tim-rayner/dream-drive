import { refundCredit } from "@/lib/actions/refundCredit";
import { supabaseAdmin, type CreateGenerationData } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

interface GenerateFinalImageRequest {
  carImage: string; // base64 or URL
  sceneImage: string; // base64 or URL
  lat: number;
  lng: number;
  timeOfDay: "sunrise" | "afternoon" | "dusk" | "night";
  customInstructions?: string; // Add optional customInstructions
  userId?: string; // Add user ID for saving generation
  isRevision?: boolean; // Flag to indicate if this is a revision
  originalGenerationId?: string; // ID of original generation for revisions
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
    throw new Error(`Replicate API error: ${response.status} - ${errorData}`);
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
      throw new Error(`Status check failed: ${statusResponse.status}`);
    const statusData = await statusResponse.json();
    if (statusData.status === "succeeded") {
      return statusData.output;
    } else if (statusData.status === "failed") {
      throw new Error("Replicate generation failed");
    }
    attempts++;
  }
  throw new Error("Replicate generation timed out");
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
    throw new Error("No output from car analysis");
  } catch (error) {
    console.error("Error analyzing car image:", error);
    return "a car"; // Fallback
  }
}

// Generate scene description using BLIP with focus on large structures
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
      caption: `Describe this location focusing on large structures, prominent features, and dramatic elements. Emphasize mountains, buildings, bridges, monuments, or any significant architectural or natural features. Include the overall atmosphere and scale. Location: ${placeDescription}`,
    },
  });
  if (typeof output === "string") return output;
  if (
    Array.isArray(output) &&
    output.length > 0 &&
    typeof output[0] === "string"
  )
    return output[0];
  throw new Error("No output from BLIP");
}

// Helper function to build the final prompt
function buildFinalPrompt({
  carDescription,
  sceneDescription,
  timeOfDayText,
  placeDescription,
  customInstructions,
}: {
  carDescription: string;
  sceneDescription: string;
  timeOfDayText: string;
  placeDescription: string;
  customInstructions?: string;
}): string {
  let prompt = `Generate EXACTLY ONE single ultra-realistic 4K photograph. NO COLLAGES. NO MULTIPLE IMAGES. NO SPLIT VIEWS. NO BEFORE/AFTER. NO COMPARISON SHOTS. ONLY ONE FINAL IMAGE.

CRITICAL ANTI-COLLAGE INSTRUCTIONS:
- Output EXACTLY ONE single photograph
- NO multiple images side by side
- NO before/after comparisons  
- NO split-screen layouts
- NO image grids or mosaics
- NO multiple angles or views
- NO separate car and scene images
- ONLY ONE unified final image

CRITICAL: Use ONLY the car from the first image. DO NOT use ANY other details from photo 1 - no background elements, no shadows, no reflections, no ground, no objects, no people, no text, no logos, no overlays. Extract ONLY the car itself and nothing else from the first image.

CRITICAL: Remove the driver from the car. The car should appear empty with no human occupants.

CRITICAL: Do not transfer any ground, shadows, or surface textures from the original car image. The car should be placed on the ground/surface of the second image with shadows and reflections that match the new environment.

CRITICAL: Remove ALL Google Maps overlays, watermarks, text, logos, and UI elements from the scene image. The final image must be completely clean with NO:
- Google Maps watermarks
- "Google" text or logos
- "CAM" indicators
- Street view overlays
- Navigation elements
- UI buttons or controls
- Text overlays of any kind
- Map interface elements
- Street view interface elements
- Any digital overlays or watermarks

Use the second uploaded image EXACTLY as the complete and final background, but REMOVE ALL digital overlays and watermarks. DO NOT reconstruct or invent the location — it must be identical to the provided scene image but completely clean. No AI-generated scenery. No hallucinated context.

IMPORTANT: Emphasize and preserve all large structures and prominent features from the scene. If mountains, buildings, bridges, monuments, or dramatic architectural/natural features are present, ensure they remain prominent in the final composition. The scene description indicates: "${sceneDescription}"

CRITICAL LIGHTING REQUIREMENT: The final image MUST be rendered with ${timeOfDayText} lighting. This is the most important aspect of the image. The entire scene, including the car, shadows, reflections, and background, must be illuminated as if it is ${timeOfDayText}. If the original scene image shows different lighting, you MUST override it to match ${timeOfDayText} lighting conditions.

LIGHTING SPECIFICATIONS:
- If sunrise: Warm golden-orange light, soft shadows, pink/orange sky tones
- If afternoon: Bright daylight, strong shadows, clear blue sky
- If dusk: Warm golden light, long shadows, orange/purple sky tones  
- If night: Dark sky, artificial lights, moonlit shadows, dark environment

Merge the car seamlessly into the scene with accurate shadows, natural reflections, and lighting that match ${timeOfDayText} in ${placeDescription}. Ensure large structures maintain their visual impact and scale.

Camera style: 50mm DSLR, f/2.8 aperture, eye-level framing, cinematic bokeh, natural depth of field, realistic lighting. 

FINAL REQUIREMENT: Output EXACTLY ONE single photograph showing the car integrated into the scene. NO EXCEPTIONS.

`;

  if (customInstructions?.trim()) {
    prompt += `Additional user instructions: ${customInstructions.trim()}\n`;
  }

  return prompt;
}

// Generate final image with car in scene
async function generateFinalImage(
  carImage: string,
  sceneImage: string,
  timeOfDay: string,
  placeDescription: string,
  customInstructions?: string
): Promise<string> {
  // Analyze car image to get specific details
  const carDescription = await analyzeCarImage(carImage);
  console.log("🚗 Car analysis result:", carDescription);

  // Generate scene description focusing on large structures
  const sceneDescription = await generateSceneDescription(
    sceneImage,
    placeDescription
  );
  console.log(
    "🏔️ Scene description (focusing on large structures):",
    sceneDescription
  );

  const finalPrompt = buildFinalPrompt({
    carDescription,
    sceneDescription,
    timeOfDayText: timeOfDay,
    placeDescription,
    customInstructions,
  });

  console.log("🎨 Final image generation prompt:");
  console.log("=".repeat(80));
  console.log(finalPrompt);
  console.log("=".repeat(80));

  const output = await callReplicate({
    version: "flux-kontext-apps/multi-image-kontext-pro",
    input: {
      input_image_1: carImage,
      input_image_2: sceneImage,
      prompt: finalPrompt,
      negative_prompt:
        "collage, multiple images, split view, before after, comparison, grid, mosaic, side by side, multiple angles, separate images, image grid, photo grid, multiple photos, dual image, split screen, before/after, comparison shot, multiple views, separate car and scene, image montage, photo montage, multiple scenes, dual scene, split image, divided image, image division, photo division, multiple frames, image frames, photo frames, multiple panels, image panels, photo panels, triptych, diptych, polyptych, image series, photo series, multiple shots, multiple photographs, image array, photo array, multiple pictures, image collection, photo collection, multiple views, multiple perspectives, image comparison, photo comparison, side-by-side comparison, split comparison, dual comparison, multiple comparison, image split, photo split, image division, photo division, image separation, photo separation, multiple images in one, multiple photos in one, image collage, photo collage, image montage, photo montage, image grid, photo grid, image array, photo array, multiple images side by side, multiple photos side by side, image grid layout, photo grid layout, image array layout, photo array layout, multiple image layout, multiple photo layout, image grid format, photo grid format, image array format, photo array format, multiple image format, multiple photo format, image grid style, photo grid style, image array style, photo array style, multiple image style, multiple photo style, image grid composition, photo grid composition, image array composition, photo array composition, multiple image composition, multiple photo composition, image grid arrangement, photo grid arrangement, image array arrangement, photo array arrangement, multiple image arrangement, multiple photo arrangement, image grid pattern, photo grid pattern, image array pattern, photo array pattern, multiple image pattern, multiple photo pattern, image grid structure, photo grid structure, image array structure, photo array structure, multiple image structure, multiple photo structure, image grid design, photo grid design, image array design, photo array design, multiple image design, multiple photo design, image grid layout, photo grid layout, image array layout, photo array layout, multiple image layout, multiple photo layout, image grid format, photo grid format, image array format, photo array format, multiple image format, multiple photo format, image grid style, photo grid style, image array style, photo array style, multiple image style, multiple photo style, image grid composition, photo grid composition, image array composition, photo array composition, multiple image composition, multiple photo composition, image grid arrangement, photo grid arrangement, image array arrangement, photo array arrangement, multiple image arrangement, multiple photo arrangement, image grid pattern, photo grid pattern, image array pattern, photo array pattern, multiple image pattern, multiple photo pattern, image grid structure, photo grid structure, image array structure, photo array structure, multiple image structure, multiple photo structure, image grid design, photo grid design, image array design, photo array design, multiple image design, multiple photo design, watermark, watermarks, google maps, google maps overlay, google maps watermark, google watermark, maps overlay, maps watermark, street view overlay, street view watermark, navigation overlay, navigation watermark, UI overlay, UI watermark, interface overlay, interface watermark, text overlay, text watermark, logo overlay, logo watermark, digital overlay, digital watermark, map interface, street view interface, navigation interface, UI elements, interface elements, control elements, button overlay, button watermark, CAM indicator, CAM text, google text, google logo, maps text, maps logo, street view text, street view logo, navigation text, navigation logo, overlay text, overlay logo, watermark text, watermark logo, digital text, digital logo, interface text, interface logo, UI text, UI logo, control text, control logo, button text, button logo, element text, element logo, google maps text, google maps logo, street view text, street view logo, navigation text, navigation logo, overlay elements, watermark elements, digital elements, interface elements, UI elements, control elements, button elements, text elements, logo elements",
    },
  });

  // Ensure only one final image is returned
  console.log("🔍 Raw output from Replicate:", output);

  if (typeof output === "string") {
    console.log("✅ Single string output received");
    return output;
  }

  if (Array.isArray(output)) {
    console.log(`📊 Array output received with ${output.length} items`);

    // Filter out any non-string items
    const stringOutputs = output.filter((item) => typeof item === "string");
    console.log(`📋 Found ${stringOutputs.length} string items`);

    if (stringOutputs.length > 0) {
      // Return only the first image to prevent collages
      console.log("✅ Returning first image from array");
      return stringOutputs[0];
    }
  }

  console.error("❌ Invalid output format from image generation");
  throw new Error(
    "Invalid output format from image generation - expected single image"
  );
}

export async function POST(request: NextRequest) {
  let creditSpent = false;
  let userId: string | undefined;

  try {
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

    // Store userId for potential refund
    userId = body.userId;

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

    // Step 2: Generate final image
    const timeOfDayText =
      body.timeOfDay === "sunrise"
        ? "golden hour sunrise lighting with warm orange and pink hues, early morning shadows"
        : body.timeOfDay === "afternoon"
        ? "bright daylight with strong shadows, clear blue sky, midday lighting"
        : body.timeOfDay === "dusk"
        ? "golden hour sunset lighting with warm orange and purple hues, long shadows"
        : "nighttime lighting with dark sky, artificial lights, moonlit shadows";

    console.log("⏰ Time of day processing:");
    console.log("  - Original selection:", body.timeOfDay);
    console.log("  - Processed text:", timeOfDayText);

    // Generate scene description focusing on large structures
    const sceneDescription = await generateSceneDescription(
      body.sceneImage,
      placeDescription
    );
    console.log(
      "🏔️ Scene description (focusing on large structures):",
      sceneDescription
    );

    const finalImageUrl = await generateFinalImage(
      body.carImage,
      body.sceneImage,
      timeOfDayText,
      placeDescription,
      body.customInstructions
    );
    console.log("Final image generated:", finalImageUrl);

    // Mark that credit was successfully spent
    creditSpent = true;

    // Save generation to database if user ID is provided
    let generationId: string | undefined;
    if (body.userId) {
      console.log("🔍 Attempting to save generation for user:", body.userId);
      console.log("🔍 Supabase admin client available:", !!supabaseAdmin);

      try {
        if (!supabaseAdmin) {
          console.warn(
            "⚠️ Supabase admin client not available - skipping generation save"
          );
          console.warn(
            "⚠️ Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file"
          );
        } else {
          console.log(
            "✅ Supabase admin client available, saving generation..."
          );

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

          console.log("📝 Generation data prepared:", {
            user_id: body.userId,
            is_revision: body.isRevision || false,
            original_generation_id: body.originalGenerationId || null,
            place_description: placeDescription,
            time_of_day: body.timeOfDay,
          });

          const { data: generation, error } = await supabaseAdmin
            .from("generations")
            .insert({
              ...generationData,
              user_id: body.userId,
              is_revision: body.isRevision || false,
              original_generation_id: body.originalGenerationId || null,
            })
            .select()
            .single();

          if (error) {
            console.error("❌ Error saving generation:", error);
            console.error("❌ Error details:", {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint,
            });
          } else {
            generationId = generation.id;
            console.log(
              "✅ Generation saved successfully with ID:",
              generationId
            );
          }
        }
      } catch (error) {
        console.error(
          "❌ Exception while saving generation to database:",
          error
        );
      }
    } else {
      console.log("⚠️ No userId provided, skipping generation save");
    }

    return NextResponse.json({
      success: true,
      imageUrl: finalImageUrl,
      placeDescription,
      sceneDescription,
      timeOfDay: body.timeOfDay,
      generationId,
    });
  } catch (error) {
    console.error("❌ Error in generateFinalImage:", error);

    // If we have a userId and credit was spent, attempt to refund
    if (userId && creditSpent) {
      console.log("🔄 Attempting to refund credit due to generation failure");
      try {
        const refundResult = await refundCredit(userId);
        if (refundResult.success) {
          console.log(
            "✅ Credit refunded successfully due to generation failure"
          );
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
