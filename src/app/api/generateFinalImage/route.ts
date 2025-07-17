import { NextRequest, NextResponse } from "next/server";

interface GenerateFinalImageRequest {
  carImage: string; // base64 or URL
  sceneImage: string; // base64 or URL
  lat: number;
  lng: number;
  timeOfDay: "sunrise" | "afternoon" | "dusk" | "night";
}

interface ReplicatePrediction {
  id: string;
  version: string;
  input: Record<string, unknown>;
  logs: string;
  output: string | null;
  data_removed: boolean;
  error: string | null;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  created_at: string;
  started_at: string;
  completed_at: string;
  urls: {
    cancel: string;
    get: string;
    stream: string;
    web: string;
  };
  metrics: {
    image_count: number;
    predict_time: number;
  };
}

// Reverse geocoding to get place names
async function getPlaceDescription(lat: number, lng: number): Promise<string> {
  try {
    console.log(`🔍 Reverse geocoding coordinates: ${lat}, ${lng}`);
    console.log(
      `🔑 Using API key: ${
        process.env.GOOGLE_MAPS_API_KEY ? "Present" : "Missing"
      }`
    );

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    console.log(
      `🌐 Geocoding URL: ${geocodeUrl.replace(
        process.env.GOOGLE_MAPS_API_KEY || "",
        "[API_KEY]"
      )}`
    );

    const response = await fetch(geocodeUrl);
    console.log(
      `📡 Geocoding response status: ${response.status} ${response.statusText}`
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

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      throw new Error("No location data found");
    }

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
      }
    }

    console.log("🏘️ Extracted location data:", {
      streetNumber,
      route,
      locality,
      administrativeArea,
      country,
      postalCode,
    });

    // Build a natural place description
    let placeDescription = "";
    if (locality && administrativeArea) {
      placeDescription = `${locality}, ${administrativeArea}`;
    } else if (locality) {
      placeDescription = locality;
    } else if (administrativeArea) {
      placeDescription = administrativeArea;
    } else {
      placeDescription = "this location";
    }

    if (country && country !== administrativeArea) {
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

// Generate scene description using BLIP
async function generateSceneDescription(
  sceneImage: string,
  placeDescription: string
): Promise<string> {
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  if (!replicateToken) throw new Error("Replicate API token not configured");

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${replicateToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version:
        "salesforce/blip:2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746",
      input: {
        image: sceneImage, // base64 data URI
        task: "image_captioning",
        caption: `Describe this place in a natural, engaging way. Focus on the visual elements, atmosphere, and mood. Location: ${placeDescription}`,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`LLM API error: ${response.status} - ${errorData}`);
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
      if (statusData.output && typeof statusData.output === "string") {
        return statusData.output;
      }
      if (Array.isArray(statusData.output) && statusData.output.length > 0) {
        return statusData.output[0];
      }
      throw new Error("No output from BLIP");
    } else if (statusData.status === "failed") {
      throw new Error("BLIP generation failed");
    }
    attempts++;
  }
  throw new Error("BLIP generation timed out");
}

// Generate final image with car in scene
async function generateFinalImage(
  carImage: string,
  sceneDescription: string,
  timeOfDay: string,
  placeDescription: string
): Promise<string> {
  try {
    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (!replicateToken) {
      throw new Error("Replicate API token not configured");
    }

    // Compose the final prompt with location and car preservation
    const finalPrompt = `${sceneDescription} ${timeOfDay} in ${placeDescription}. A photorealistic Nissan GT-R is seamlessly integrated into this scene, maintaining the exact original car's appearance, color, and details while blending naturally with the environment. The car should look exactly like the reference image.`;

    console.log("🎨 Final image generation prompt:", finalPrompt);
    console.log("📊 Prompt components:", {
      sceneDescription,
      timeOfDay,
      placeDescription,
    });

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${replicateToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "recraft-ai/recraft-v3",
        input: {
          prompt: finalPrompt,
          image: carImage,
          strength: 0.6,
          num_inference_steps: 50,
          guidance_scale: 11,
          seed: Math.floor(Math.random() * 1000000),
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Image generation API error: ${response.status} - ${errorData}`
      );
    }

    const prediction: ReplicatePrediction = await response.json();

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes max for image generation

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

      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.status}`);
      }

      const statusData: ReplicatePrediction = await statusResponse.json();

      if (statusData.status === "succeeded") {
        if (statusData.output && typeof statusData.output === "string") {
          return statusData.output;
        }
        throw new Error("No output from image generation");
      } else if (statusData.status === "failed") {
        throw new Error("Image generation failed");
      }

      attempts++;
    }

    throw new Error("Image generation timed out");
  } catch (error) {
    console.error("Error generating final image:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
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

    console.log("🌍 Starting reverse geocoding for coordinates:", {
      lat: body.lat,
      lng: body.lng,
    });

    // Step 1: Get place description from coordinates
    let placeDescription = "this location"; // Default fallback
    try {
      placeDescription = await getPlaceDescription(body.lat, body.lng);
      console.log("✅ Place description retrieved:", placeDescription);
    } catch (error) {
      console.error("❌ Failed to get place description:", error);
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
      sceneDescription,
      timeOfDayText,
      placeDescription
    );
    console.log("Final image generated:", finalImageUrl);

    return NextResponse.json({
      success: true,
      imageUrl: finalImageUrl,
      placeDescription,
      sceneDescription,
      timeOfDay: body.timeOfDay,
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
