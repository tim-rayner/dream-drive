import { Videocam as VideocamIcon } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCredits } from "../../context/CreditsContext";
import VideoPlayer from "../VideoPlayer";

interface GenerateVideoStepProps {
  onComplete: (videoUrl?: string, videoId?: string) => void;
  generatedImageUrl: string;
  originalGeneration?: { final_image_url?: string };
  carMake?: string;
  carModel?: string;
  onBack?: () => void;
}

type GenerationStep = "idle" | "generating" | "completed";

const generateVideo = async ({
  imageUrl,
  prompt,
  carMake,
  carModel,
  userId,
}: {
  imageUrl: string;
  prompt: string;
  carMake?: string;
  carModel?: string;
  userId?: string;
}) => {
  try {
    const response = await fetch("/api/video/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl,
        prompt,
        carMake,
        carModel,
        userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorData}`);
    }

    const result = await response.json();

    // Validate the response structure
    if (!result || typeof result !== "object") {
      throw new Error("Invalid response format from API");
    }

    return result;
  } catch (error) {
    console.error("Error in generateVideo:", error);

    // Re-throw with a user-friendly message
    if (error instanceof Error) {
      throw new Error(`Video generation failed: ${error.message}`);
    } else {
      throw new Error("Video generation failed: Unknown error occurred");
    }
  }
};

export default function GenerateVideoStep({
  onComplete,
  generatedImageUrl,
  originalGeneration,
  carMake,
  carModel,
  onBack,
}: GenerateVideoStepProps) {
  const [currentStep, setCurrentStep] = useState<GenerationStep>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [localCarMake, setLocalCarMake] = useState<string>(carMake || "");
  const [localCarModel, setLocalCarModel] = useState<string>(carModel || "");
  const [creditError, setCreditError] = useState<string | null>(null);
  const { refreshCredits } = useCredits();
  const { user } = useAuth();

  const handleGenerateVideo = async () => {
    if (!generatedImageUrl) {
      setError("Missing generated image");
      return;
    }

    setCurrentStep("generating");
    setError(null);
    setCreditError(null);
    setVideoUrl(null);

    try {
      console.log("🎬 Starting video generation API call...");
      console.log("🖼️ Image URL:", generatedImageUrl);
      console.log("📝 Prompt:", prompt);

      const result = await generateVideo({
        imageUrl: generatedImageUrl,
        prompt: prompt.trim() || "", // Pass empty string if no prompt
        carMake: localCarMake,
        carModel: localCarModel,
        userId: user?.id,
      });

      if (result.success && result.videoUrl) {
        console.log("🎬 Video URL received:", result.videoUrl);
        setVideoUrl(result.videoUrl);
        setCurrentStep("completed");

        // Refresh credits in the context to update the navbar
        await refreshCredits();

        setTimeout(() => {
          onComplete(result.videoUrl, result.videoId || null);
        }, 150);
      } else {
        throw new Error("No video URL returned from API");
      }
    } catch (error) {
      console.error("Error generating video:", error);
      setCurrentStep("idle");

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Our AI is down at the moment, come back soon...");
      }
    }
  };

  const handleComplete = () => {
    if (videoUrl) {
      onComplete(videoUrl);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleRestart = () => {
    setCurrentStep("idle");
    setVideoUrl(null);
    setError(null);
  };

  const isGenerating = currentStep === "generating";

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
      <Stack spacing={{ xs: 3, sm: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", px: { xs: 2, sm: 0 } }}>
          <Typography
            variant="h4"
            component="h2"
            fontWeight={600}
            gutterBottom
            sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" } }}
          >
            Generate Video
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.95rem", sm: "1rem" }, lineHeight: 1.6 }}
          >
            Transform your generated image into a dynamic video with custom
            motion and effects
          </Typography>
        </Box>

        {/* Image Preview */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={600}
            sx={{ mb: 3, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
          >
            Selected Image for Video Generation
          </Typography>

          <Card
            sx={{
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "primary.main",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
              },
            }}
          >
            <CardContent
              sx={{
                p: { xs: 2, sm: 3 },
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
                    borderRadius: "50%",
                    backgroundColor: "primary.main",
                    color: "white",
                    mr: 2,
                  }}
                >
                  <VideocamIcon />
                </Box>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                >
                  {generatedImageUrl === originalGeneration?.final_image_url
                    ? "Original"
                    : "Revised"}{" "}
                  Image
                </Typography>
                <Chip
                  label="Ready"
                  color="success"
                  size="small"
                  sx={{
                    ml: "auto",
                    backgroundColor: "success.main",
                    color: "white",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                />
              </Box>

              <Box
                sx={{
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "background.paper",
                  aspectRatio: "1 / 1",
                  maxWidth: { xs: "calc(100vw - 64px)", sm: "none" },
                  maxHeight: { xs: "calc(100vw - 64px)", sm: "none" },
                }}
              >
                <Image
                  src={generatedImageUrl}
                  alt="Generated image for video"
                  width={400}
                  height={400}
                  priority
                  style={{
                    display: "block",
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Optional Video Instructions Input */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={600}
            sx={{ mb: 3, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
          >
            Optional Additional Instructions
          </Typography>

          <TextField
            label="Add extra details for video motion and effects (optional)"
            multiline
            minRows={2}
            maxRows={6}
            value={prompt}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPrompt(e.target.value)
            }
            variant="outlined"
            fullWidth
            placeholder="Example: with dramatic camera angles, add rain effects, include traffic in background..."
            sx={{ mb: 2 }}
          />

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            💡 Tip: Leave empty for default motion, or add specific details like
            camera angles, weather effects, or background elements.
          </Typography>

          {/* Car Information Section */}
          <Box sx={{ my: 3 }}>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ mb: 2, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
            >
              Car Information (Optional)
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              Help us create a more accurate video by providing your car&apos;s
              make and model. This information will be used to enhance the video
              generation with specific car details.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Car Make (e.g. Nissan, Subaru, Toyota)"
                value={localCarMake}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setLocalCarMake(e.target.value)
                }
                variant="outlined"
                fullWidth
                placeholder="e.g. Nissan, Subaru, Toyota"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Car Model (e.g. GTR, Impreza, ae86)"
                value={localCarModel}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setLocalCarModel(e.target.value)
                }
                variant="outlined"
                fullWidth
                placeholder="e.g. GTR, Impreza, ae86"
                sx={{ flex: 1 }}
              />
            </Stack>
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Default Motion:</strong> The video will create a cinematic
              rolling shot of your car being filmed from another vehicle driving
              alongside it. The camera will capture a dynamic side-angle view as
              both vehicles drive down the road, creating a professional car
              commercial-style shot with realistic physics - natural wheel
              rotation, proper steering, and smooth acceleration. Add
              instructions above to customize the video effects further.
            </Typography>
          </Alert>
        </Box>

        {/* Status and Action */}
        <Box>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                {error}
              </Typography>
            </Alert>
          )}

          {creditError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                {creditError}
              </Typography>
            </Alert>
          )}

          {currentStep === "completed" ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                ✅ Video generation complete! Your dynamic video is ready.
              </Typography>
            </Alert>
          ) : null}

          {currentStep === "idle" && (
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleGenerateVideo}
              sx={{
                py: { xs: 1.5, sm: 2 },
                borderRadius: "12px",
                fontSize: { xs: "1rem", sm: "1.1rem" },
                fontWeight: 600,
                textTransform: "none",
                background: "linear-gradient(45deg, #8B5CF6 30%, #A78BFA 90%)",
                boxShadow: "0 3px 5px 2px rgba(139, 92, 246, .3)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #7C3AED 30%, #8B5CF6 90%)",
                },
                "&:disabled": {
                  background: "grey.500",
                  boxShadow: "none",
                },
              }}
            >
              🎬 Generate Video
            </Button>
          )}

          {isGenerating && (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography
                variant="h6"
                color="primary"
                sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
              >
                Creating your dynamic video...
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                This may take up to 4-5 minutes ⏳
              </Typography>
            </Box>
          )}

          {currentStep === "completed" && (
            <Box>
              <Typography
                variant="h5"
                fontWeight={600}
                sx={{
                  mb: 3,
                  textAlign: "center",
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                }}
              >
                🎬 Your Video is Ready!
              </Typography>

              {/* Video Display */}
              {videoUrl && (
                <Box sx={{ mb: 3 }}>
                  <VideoPlayer
                    videoUrl={videoUrl}
                    title="Dream Drive Video"
                    onDownload={() => {
                      // Create a proper download link for the video
                      const isReplicateUrl =
                        videoUrl.includes("replicate.delivery") ||
                        videoUrl.includes("replicate.com");
                      const downloadUrl = isReplicateUrl
                        ? `/api/video/proxy?url=${encodeURIComponent(videoUrl)}`
                        : videoUrl;

                      const link = document.createElement("a");
                      link.href = downloadUrl;
                      link.download = "dream-drive-video.mp4";
                      link.click();
                    }}
                    width="100%"
                    height={400}
                  />
                </Box>
              )}

              {/* Action Buttons */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleComplete}
                  sx={{
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 3, sm: 4 },
                    borderRadius: "12px",
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    fontWeight: 600,
                    textTransform: "none",
                    background:
                      "linear-gradient(45deg, #10B981 30%, #34D399 90%)",
                    boxShadow: "0 3px 5px 2px rgba(16, 185, 129, .3)",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #059669 30%, #10B981 90%)",
                    },
                  }}
                >
                  ✅ Complete Video
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleRestart}
                  sx={{
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 3, sm: 4 },
                    borderRadius: "12px",
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    fontWeight: 600,
                    textTransform: "none",
                  }}
                >
                  🔄 Generate Again
                </Button>
              </Box>
            </Box>
          )}

          {/* Back Button */}
          {currentStep === "idle" && onBack && (
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Button
                variant="text"
                onClick={handleBack}
                sx={{
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                ← Back to Image
              </Button>
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
