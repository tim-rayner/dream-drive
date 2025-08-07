import {
  Brightness5 as AfternoonIcon,
  WbTwilight as DuskIcon,
  Map as MapIcon,
  Nightlight as NightIcon,
  PhotoCamera as PhotoCameraIcon,
  WbSunny as SunriseIcon,
} from "@mui/icons-material";
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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCredits } from "../../context/CreditsContext";
import { refundCredit } from "../../lib/actions/refundCredit";
import { spendCredit } from "../../lib/creditsService";

interface GenerateImageStepProps {
  onComplete: (imageUrl?: string, generationId?: string) => void;
  uploadedFile: File | null;
  sceneImage: string | null;
  mapData: {
    position: { lat: number; lng: number } | null;
    marker: unknown | null;
  };
  generatedImageUrl?: string | null;
}

type TimeOfDay = "sunrise" | "afternoon" | "dusk" | "night";

type GenerationStep = "idle" | "generating" | "completed";

const generateFinalImage = async ({
  carImage,
  sceneImage,
  lat,
  lng,
  timeOfDay,
  customInstructions,
  userId,
}: {
  carImage: string;
  sceneImage: string;
  lat: number;
  lng: number;
  timeOfDay: TimeOfDay;
  customInstructions: string;
  userId?: string;
}) => {
  try {
    const response = await fetch("/api/generateFinalImage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        carImage,
        sceneImage,
        lat,
        lng,
        timeOfDay,
        customInstructions,
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
    console.error("Error in generateFinalImage:", error);

    // Re-throw with a user-friendly message
    if (error instanceof Error) {
      throw new Error(`Image generation failed: ${error.message}`);
    } else {
      throw new Error("Image generation failed: Unknown error occurred");
    }
  }
};

export default function GenerateImageStep({
  onComplete,
  uploadedFile,
  sceneImage,
  mapData,
  generatedImageUrl,
}: GenerateImageStepProps) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("afternoon");
  const [carImageUrl, setCarImageUrl] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<GenerationStep>("idle");
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(
    generatedImageUrl || null
  );
  const [error, setError] = useState<string | null>(null);
  const [customInstructions, setCustomInstructions] = useState<string>("");
  const [creditError, setCreditError] = useState<string | null>(null);
  const { refreshCredits } = useCredits();
  const { user } = useAuth();

  // Initialize with existing generated image if available
  useEffect(() => {
    if (generatedImageUrl && !finalImageUrl) {
      setFinalImageUrl(generatedImageUrl);
    }
  }, [generatedImageUrl, finalImageUrl]);

  // Convert uploaded file to base64 for preview and API call
  useEffect(() => {
    if (uploadedFile) {
      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };
      fileToBase64(uploadedFile).then((base64) => {
        setCarImageUrl(base64);
      });
    } else {
      setCarImageUrl(null);
    }
  }, [uploadedFile]);

  const handleGenerateImage = async () => {
    console.log("GenerateImageStep - mapData received:", mapData);

    if (!carImageUrl || !sceneImage) {
      setError("Missing required data: car image or scene image");
      return;
    }

    // Require a valid map position - no fallback to 0,0
    if (!mapData.position) {
      setError(
        "Missing location data. Please select a location on the map before proceeding."
      );
      return;
    }

    setCurrentStep("generating");
    setError(null);
    setCreditError(null);
    setFinalImageUrl(null);

    try {
      const creditResult = await spendCredit();

      if (!creditResult.success) {
        setCurrentStep("idle");
        setCreditError(creditResult.error || "Failed to spend credit");
        return;
      }

      // Refresh credits in the context to update the navbar
      await refreshCredits();

      console.log("🚀 Starting image generation API call...");
      console.log("📍 Sending coordinates to API:", {
        lat: mapData.position.lat,
        lng: mapData.position.lng,
      });
      console.log("⏰ Time of day:", timeOfDay);
      console.log("📝 Custom instructions:", customInstructions);

      const result = await generateFinalImage({
        carImage: carImageUrl,
        sceneImage: sceneImage,
        lat: mapData.position.lat,
        lng: mapData.position.lng,
        timeOfDay,
        customInstructions, // Pass to backend
        userId: user?.id,
      });

      if (result.success && result.imageUrl) {
        setFinalImageUrl(result.imageUrl);
        setCurrentStep("completed");

        setTimeout(() => {
          onComplete(result.imageUrl, result.generationId || null);
        }, 150);
      } else {
        throw new Error("No image URL returned from API");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      setCurrentStep("idle");

      // If the API call failed, we need to refund the credit
      console.log(
        "🔄 Attempting to refund credit due to generation failure..."
      );
      try {
        if (user?.id) {
          const refundResult = await refundCredit(user.id);
          if (refundResult.success) {
            console.log(
              "✅ Credit refunded successfully due to generation failure"
            );
            // Refresh credits in the context to update the navbar
            await refreshCredits();
          } else {
            console.error("❌ Failed to refund credit:", refundResult.error);
          }
        } else {
          console.error("❌ Cannot refund credit: no user ID available");
        }
      } catch (refundError) {
        console.error("❌ Exception during credit refund:", refundError);
      }

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Our AI is down at the moment, come back soon...");
      }
    }
  };

  const handleComplete = () => {
    if (finalImageUrl) {
      // Save the generated image URL to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("generatedImageUrl", finalImageUrl);
      }
      onComplete(finalImageUrl);
    }
  };

  const handleRestart = () => {
    setCurrentStep("idle");
    setFinalImageUrl(null);
    setError(null);
  };

  const ImagePreviewCard = ({
    title,
    imageUrl,
    icon,
    isMissing,
    stepNumber,
  }: {
    title: string;
    imageUrl: string | null;
    icon: React.ReactNode;
    isMissing: boolean;
    stepNumber?: number;
  }) => (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "12px",
        border: "1px solid",
        borderColor: isMissing ? "divider" : "primary.main",
        boxShadow: isMissing ? "none" : "0 4px 12px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: isMissing
            ? "0 2px 8px rgba(0,0,0,0.1)"
            : "0 6px 16px rgba(0,0,0,0.15)",
        },
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 3 },
          flex: 1,
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
              backgroundColor: isMissing ? "grey.100" : "primary.main",
              color: isMissing ? "text.secondary" : "white",
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="h6"
            fontWeight={600}
            color={isMissing ? "text.secondary" : "text.primary"}
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            {title}
          </Typography>
          {stepNumber && (
            <Chip
              label={`Step ${stepNumber}`}
              color="primary"
              size="small"
              sx={{ ml: 1, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            />
          )}
          {!isMissing && (
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
          )}
        </Box>

        {isMissing ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "2px dashed",
              borderColor: "divider",
              borderRadius: "8px",
              p: { xs: 2, sm: 4 },
              backgroundColor: "grey.50",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: { xs: 48, sm: 60 },
                height: { xs: 48, sm: 60 },
                borderRadius: "50%",
                backgroundColor: "grey.200",
                color: "text.secondary",
                mb: 2,
              }}
            >
              {icon}
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              No image selected
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
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
              src={imageUrl || ""}
              alt={title}
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
        )}
      </CardContent>
    </Card>
  );

  const TimeOfDayToggle = () => (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h6"
        fontWeight={600}
        sx={{ mb: 2, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
      >
        Time of Day
      </Typography>
      <ToggleButtonGroup
        value={timeOfDay}
        exclusive
        onChange={(_, newValue) => {
          if (newValue !== null) {
            setTimeOfDay(newValue);
          }
        }}
        aria-label="time of day"
        sx={{
          flexWrap: "wrap",
          width: "100%",
          justifyContent: { xs: "center", sm: "flex-start" },
          gap: { xs: 1, sm: 2 },
          "& .MuiToggleButton-root": {
            borderRadius: "12px",
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 1.5 },
            textTransform: "none",
            fontWeight: 600,
            border: "2px solid",
            borderColor: "divider",
            fontSize: { xs: "0.875rem", sm: "1rem" },
            "&.Mui-selected": {
              backgroundColor: "primary.main",
              color: "white",
              borderColor: "primary.main",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            },
            "&:hover": {
              backgroundColor: "grey.100",
            },
            flex: "1 1 120px",
            minWidth: { xs: "45%", sm: "auto" },
            maxWidth: { xs: "100%", sm: "none" },
          },
        }}
      >
        <ToggleButton value="sunrise" aria-label="sunrise">
          <SunriseIcon sx={{ mr: 1, fontSize: { xs: 18, sm: 20 } }} />
          Sunrise
        </ToggleButton>
        <ToggleButton value="afternoon" aria-label="afternoon">
          <AfternoonIcon sx={{ mr: 1, fontSize: { xs: 18, sm: 20 } }} />
          Afternoon
        </ToggleButton>
        <ToggleButton value="dusk" aria-label="dusk">
          <DuskIcon sx={{ mr: 1, fontSize: { xs: 18, sm: 20 } }} />
          Dusk
        </ToggleButton>
        <ToggleButton value="night" aria-label="night">
          <NightIcon sx={{ mr: 1, fontSize: { xs: 18, sm: 20 } }} />
          Night
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );

  const isCarImageMissing = !carImageUrl;
  const isSceneImageMissing = !sceneImage;
  // Check if we have both map position AND scene image (both are required)
  const isLocationMissing = !mapData.position || !sceneImage;
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
            AI Scene Generation
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.95rem", sm: "1rem" }, lineHeight: 1.6 }}
          >
            Upload your car photo, select a location, choose time of day, and
            let AI create your dream scene
          </Typography>
        </Box>

        {/* Time of Day Selection */}
        <TimeOfDayToggle />

        {/* Custom Instructions Input */}
        <TextField
          label="Optional: Add extra details for the AI (e.g. mood, background elements, weather...)"
          multiline
          minRows={2}
          maxRows={6}
          value={customInstructions}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCustomInstructions(e.target.value)
          }
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
        />

        {/* Image Previews */}
        <Box>
          <Typography
            variant="h5"
            fontWeight={600}
            sx={{ mb: 3, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
          >
            Your Inputs
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <Box sx={{ flex: 1 }}>
              <ImagePreviewCard
                title="Your Car"
                imageUrl={carImageUrl}
                icon={<PhotoCameraIcon />}
                isMissing={isCarImageMissing}
                stepNumber={1}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <ImagePreviewCard
                title="Chosen Location"
                imageUrl={sceneImage}
                icon={<MapIcon />}
                isMissing={isSceneImageMissing}
                stepNumber={2}
              />
            </Box>
          </Stack>
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

          {isCarImageMissing || isSceneImageMissing || isLocationMissing ? (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                Please complete the previous steps to upload a car photo and
                select a location on the map before generating your scene.
              </Typography>
            </Alert>
          ) : currentStep === "completed" ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                ✅ Generation complete! Your AI scene is ready.
              </Typography>
            </Alert>
          ) : null}

          {currentStep === "idle" && (
            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={
                isCarImageMissing || isSceneImageMissing || isLocationMissing
              }
              onClick={handleGenerateImage}
              sx={{
                py: { xs: 1.5, sm: 2 },
                borderRadius: "12px",
                fontSize: { xs: "1rem", sm: "1.1rem" },
                fontWeight: 600,
                textTransform: "none",
                background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                boxShadow: "0 3px 5px 2px rgba(25, 118, 210, .3)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                },
                "&:disabled": {
                  background: "grey.500",
                  boxShadow: "none",
                },
              }}
            >
              🎨 Generate AI Scene
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
                Creating your dream scene...
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, fontSize: { xs: "0.875rem", sm: "1rem" } }}
              >
                This may take up to a minute ⏳
              </Typography>
            </Box>
          )}

          {currentStep === "completed" && (
            <Box sx={{ textAlign: "center" }}>
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
                  mr: 2,
                }}
              >
                ✅ Complete DriveDream
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
          )}
        </Box>
      </Stack>
    </Box>
  );
}
