// Server-side utility for calling Replicate API
export async function callReplicate({
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
    throw new Error(errorData);
  }

  const prediction = await response.json();

  // Poll for completion
  let attempts = 0;
  const maxAttempts = version.includes("hailuo") ? 300 : 60; // 5 minutes for video generation
  const pollInterval = version.includes("hailuo") ? 2000 : 1000; // 2 seconds for video generation

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval));

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
        "Our servers are currently experiencing high load, please check back later: " +
          JSON.stringify(statusResponse, null, 2)
      );

    const statusData = await statusResponse.json();

    if (statusData.status === "succeeded") {
      return statusData.output;
    } else if (statusData.status === "failed") {
      throw new Error(
        "Our servers are currently experiencing high load, please check back later: " +
          JSON.stringify(statusData, null, 2)
      );
    }

    console.log("polling replicate");
    attempts++;
  }

  throw new Error(
    "Our servers are currently experiencing high load, please check back later: " +
      JSON.stringify(prediction, null, 2)
  );
}
