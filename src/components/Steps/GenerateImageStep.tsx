import {
  AutoAwesome as AutoAwesomeIcon,
  Map as MapIcon,
  PhotoCamera as PhotoCameraIcon,
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
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

interface GenerateImageStepProps {
  onComplete: (imageUrl?: string) => void;
  uploadedFile: File | null;
  sceneImage: string | null;
  mapData: {
    position: { lat: number; lng: number } | null;
    marker: unknown | null;
  };
}

interface ReplicatePrediction {
  id: string;
  version: string;
  input: Record<string, unknown>;
  logs: string;
  output: string | null; // single image URL (.webp or .png)
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

type GenerationStep = "idle" | "step1" | "step2" | "completed";

const generateImage = async ({
  promptText,
  inputImage,
  step,
}: {
  promptText: string;
  inputImage: string;
  step: "step1" | "step2";
}) => {
  try {
    let basePrompt: string;
    let strength: number;
    let guidanceScale: number;

    if (step === "step1") {
      // Step 1: Car enhancement
      basePrompt =
        "Hyper-realistic render of a parked car, 35mm DSLR photo, cinematic lighting, photorealistic style";
      strength = 0.7; // Stronger influence to enhance the car
      guidanceScale = 12; // Strong steering for car enhancement
    } else {
      // Step 2: Scene blending
      basePrompt =
        "Blend car into city street scene, moody lighting, photorealism, seamless integration";
      strength = 0.6; // Moderate influence to blend with scene
      guidanceScale = 11; // Balanced steering for scene blending
    }

    const userPrompt = promptText.trim();
    const finalPrompt = userPrompt
      ? `${basePrompt}, ${userPrompt}`
      : basePrompt;

    const response = await fetch("/api/replicate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "recraft-ai/recraft-v3",
        input: {
          prompt: finalPrompt,
          image: inputImage,
          strength: strength,
          num_inference_steps: 50, // high fidelity
          guidance_scale: guidanceScale,
          seed: Math.floor(Math.random() * 1000000), // random seed for variety
        },
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
    console.error("Error in generateImage:", error);

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
}: GenerateImageStepProps) {
  const [promptText, setPromptText] = useState("");
  const [carImageUrl, setCarImageUrl] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<GenerationStep>("idle");
  const [enhancedCarUrl, setEnhancedCarUrl] = useState<string | null>(null);
  const [finalSceneUrl, setFinalSceneUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [step1Prompt, setStep1Prompt] = useState("");
  const [step2Prompt, setStep2Prompt] = useState("");

  // Convert uploaded file to URL for display
  useEffect(() => {
    if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile);
      setCarImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [uploadedFile]);

  // Poll for prediction status
  useEffect(() => {
    if (!predictionId || currentStep === "idle" || currentStep === "completed")
      return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/replicate?id=${predictionId}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const prediction: ReplicatePrediction = await response.json();

        if (prediction.status === "succeeded") {
          if (prediction.output && typeof prediction.output === "string") {
            if (currentStep === "step1") {
              setEnhancedCarUrl(prediction.output);
              setCurrentStep("step2");
              // Automatically start step 2
              handleStep2Generation(prediction.output);
            } else if (currentStep === "step2") {
              setFinalSceneUrl(prediction.output);
              setCurrentStep("completed");
            }
          }
          clearInterval(pollInterval);
        } else if (prediction.status === "failed") {
          setCurrentStep("idle");
          setError("Our AI is down at the moment, come back soon...");
          clearInterval(pollInterval);
        }
        // Continue polling for "starting" and "processing" statuses
      } catch (error) {
        console.error("Error polling prediction:", error);
        setCurrentStep("idle");
        setError("Our AI is down at the moment, come back soon...");
        clearInterval(pollInterval);
      }
    }, 1000); // Poll every second

    return () => clearInterval(pollInterval);
  }, [predictionId, currentStep]);

  const handleStep1Generation = async () => {
    if (!carImageUrl) {
      setError("No car image available");
      return;
    }

    setCurrentStep("step1");
    setError(null);
    setEnhancedCarUrl(null);
    setFinalSceneUrl(null);

    try {
      const prediction = await generateImage({
        promptText: step1Prompt,
        inputImage: carImageUrl,
        step: "step1",
      });

      // Validate prediction has required fields
      if (!prediction || !prediction.id) {
        throw new Error("Invalid prediction response from API");
      }

      setPredictionId(prediction.id);
      // The polling useEffect will handle the rest
    } catch (error) {
      console.error("Error starting step 1 generation:", error);
      setCurrentStep("idle");

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Our AI is down at the moment, come back soon...");
      }
    }
  };

  const handleStep2Generation = async (enhancedCarImageUrl: string) => {
    if (!sceneImage) {
      setError("No scene image available");
      return;
    }

    try {
      const prediction = await generateImage({
        promptText: step2Prompt,
        inputImage: enhancedCarImageUrl,
        step: "step2",
      });

      // Validate prediction has required fields
      if (!prediction || !prediction.id) {
        throw new Error("Invalid prediction response from API");
      }

      setPredictionId(prediction.id);
      // The polling useEffect will handle the rest
    } catch (error) {
      console.error("Error starting step 2 generation:", error);
      setCurrentStep("idle");

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Our AI is down at the moment, come back soon...");
      }
    }
  };

  const handleComplete = () => {
    if (finalSceneUrl) {
      // Save the generated image URL to localStorage
      localStorage.setItem("generatedImageUrl", finalSceneUrl);
      onComplete(finalSceneUrl);
    }
  };

  const handleRestart = () => {
    setCurrentStep("idle");
    setEnhancedCarUrl(null);
    setFinalSceneUrl(null);
    setError(null);
    setPredictionId(null);
    setStep1Prompt("");
    setStep2Prompt("");
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
        sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
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
          >
            {title}
          </Typography>
          {stepNumber && (
            <Chip
              label={`Step ${stepNumber}`}
              color="primary"
              size="small"
              sx={{ ml: 1 }}
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
              p: 4,
              backgroundColor: "grey.50",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 60,
                height: 60,
                borderRadius: "50%",
                backgroundColor: "grey.200",
                color: "text.secondary",
                mb: 2,
              }}
            >
              {icon}
            </Box>
            <Typography variant="body2" color="text.secondary" align="center">
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
            }}
          >
            <img
              src={imageUrl || ""}
              alt={title}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                objectFit: "cover",
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const isCarImageMissing = !carImageUrl;
  const isSceneImageMissing = !sceneImage;
  const isGenerating = currentStep === "step1" || currentStep === "step2";

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4" component="h2" fontWeight={600} gutterBottom>
            Two-Step AI Generation
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Step 1: Enhance your car • Step 2: Blend into your chosen location
          </Typography>
        </Box>

        {/* Step 1: Car Enhancement */}
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
            Step 1: Car Enhancement
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <Box sx={{ flex: 1 }}>
              <ImagePreviewCard
                title="Original Car"
                imageUrl={carImageUrl}
                icon={<PhotoCameraIcon />}
                isMissing={isCarImageMissing}
                stepNumber={1}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <ImagePreviewCard
                title="Enhanced Car"
                imageUrl={enhancedCarUrl}
                icon={<AutoAwesomeIcon />}
                isMissing={!enhancedCarUrl}
                stepNumber={1}
              />
            </Box>
          </Stack>

          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Car enhancement details (optional)"
              placeholder="e.g., 'Make it look like a luxury car commercial with dramatic lighting'"
              value={step1Prompt}
              onChange={(e) => setStep1Prompt(e.target.value)}
              variant="outlined"
              disabled={isGenerating}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
              helperText="Add specific details to enhance your car image."
            />
          </Box>
        </Box>

        {/* Step 2: Scene Blending */}
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
            Step 2: Scene Blending
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <Box sx={{ flex: 1 }}>
              <ImagePreviewCard
                title="Chosen Location"
                imageUrl={sceneImage}
                icon={<MapIcon />}
                isMissing={isSceneImageMissing}
                stepNumber={2}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <ImagePreviewCard
                title="Final Scene"
                imageUrl={finalSceneUrl}
                icon={<AutoAwesomeIcon />}
                isMissing={!finalSceneUrl}
                stepNumber={2}
              />
            </Box>
          </Stack>

          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Scene blending details (optional)"
              placeholder="e.g., 'Blend car into sunset city street with moody atmosphere'"
              value={step2Prompt}
              onChange={(e) => setStep2Prompt(e.target.value)}
              variant="outlined"
              disabled={isGenerating}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
              helperText="Add specific details to guide the scene blending."
            />
          </Box>
        </Box>

        {/* Status and Action */}
        <Box>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body2">{error}</Typography>
            </Alert>
          )}

          {isCarImageMissing || isSceneImageMissing ? (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Please complete the previous steps to upload a car photo and
                select a location before generating your scene.
              </Typography>
            </Alert>
          ) : currentStep === "completed" ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2">
                ✅ Generation complete! Your AI scene is ready.
              </Typography>
            </Alert>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                {currentStep === "step1"
                  ? "🔄 Step 1: Enhancing your car image..."
                  : currentStep === "step2"
                  ? "🔄 Step 2: Blending car into scene..."
                  : "Ready to start two-step generation process."}
              </Typography>
            </Alert>
          )}

          {currentStep === "idle" && (
            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={isCarImageMissing || isSceneImageMissing}
              onClick={handleStep1Generation}
              sx={{
                py: 2,
                borderRadius: "12px",
                fontSize: "1.1rem",
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
              🎨 Start Two-Step Generation
            </Button>
          )}

          {isGenerating && (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h6" color="primary">
                {currentStep === "step1"
                  ? "Enhancing your car..."
                  : "Blending into scene..."}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This may take 30-60 seconds per step
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
                  py: 2,
                  px: 4,
                  borderRadius: "12px",
                  fontSize: "1.1rem",
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
                ✅ Complete Dream Drive
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleRestart}
                sx={{
                  py: 2,
                  px: 4,
                  borderRadius: "12px",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                🔄 Generate Again
              </Button>
            </Box>
          )}
        </Box>

        {/* Final Scene Display */}
        {finalSceneUrl && (
          <Box>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
              Your Generated Scene
            </Typography>

            <Card
              sx={{
                borderRadius: "12px",
                overflow: "hidden",
                border: "2px solid",
                borderColor: "primary.main",
                boxShadow: "0 8px 32px rgba(139, 92, 246, 0.3)",
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "background.paper",
                  }}
                >
                  <img
                    src={finalSceneUrl}
                    alt="Generated AI Scene"
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                      objectFit: "cover",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      backgroundColor: "rgba(0,0,0,0.7)",
                      color: "white",
                      px: 2,
                      py: 1,
                      borderRadius: "20px",
                    }}
                  >
                    <AutoAwesomeIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2" fontWeight={600}>
                      AI Generated
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
