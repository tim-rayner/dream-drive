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
