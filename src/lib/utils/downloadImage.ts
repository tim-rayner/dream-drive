/**
 * Downloads an image from a URL to the user's device
 * @param imageUrl - The URL of the image to download
 * @param filename - Optional filename for the downloaded file
 */
export const downloadImage = async (
  imageUrl: string,
  filename?: string
): Promise<void> => {
  try {
    // Fetch the image as a blob
    const response = await fetch(imageUrl, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      headers: {
        Accept: "image/*",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();

    // Create a blob URL
    const blobUrl = window.URL.createObjectURL(blob);

    // Create a temporary anchor element
    const link = document.createElement("a");
    link.href = blobUrl;

    // Set the download filename
    const defaultFilename = `dreamdrive-${Date.now()}.jpg`;
    link.download = filename || defaultFilename;

    // Append to DOM, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the blob URL
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (error) {
    console.error("Error downloading image:", error);

    // Fallback: try canvas method for cross-origin images
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }

      const img = new Image();

      img.crossOrigin = "anonymous";

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = filename || `dreamdrive-${Date.now()}.jpg`;
              link.style.display = "none";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
            }
          },
          "image/jpeg",
          0.9
        );
      };

      img.onerror = () => {
        console.error("Failed to load image for canvas method");
        throw new Error("Failed to download image. Please try again.");
      };

      img.src = imageUrl;
    } catch (canvasError) {
      console.error("Canvas method failed:", canvasError);
      throw new Error("Failed to download image. Please try again.");
    }
  }
};

/**
 * Downloads an image with a custom filename based on generation details
 * @param imageUrl - The URL of the image to download
 * @param generation - Optional generation object for filename
 */
export const downloadGenerationImage = async (
  imageUrl: string,
  generation?: { time_of_day?: string; place_description?: string }
): Promise<void> => {
  try {
    let filename = "dreamdrive";

    if (generation?.time_of_day) {
      filename += `-${generation.time_of_day}`;
    }

    if (generation?.place_description) {
      // Clean the place description for filename
      const cleanPlace = generation.place_description
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
        .substring(0, 20);
      filename += `-${cleanPlace}`;
    }

    filename += `-${Date.now()}.jpg`;

    await downloadImage(imageUrl, filename);
  } catch (error) {
    console.error("Error downloading generation image:", error);
    throw new Error("Failed to download image. Please try again.");
  }
};
