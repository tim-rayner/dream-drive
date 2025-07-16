import {
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
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

interface GenerateImageStepProps {
  onComplete: () => void;
  uploadedFile: File | null;
  sceneImage: string | null;
  mapData: {
    position: { lat: number; lng: number } | null;
    marker: unknown | null;
  };
}

export default function GenerateImageStep({
  onComplete,
  uploadedFile,
  sceneImage,
  mapData,
}: GenerateImageStepProps) {
  const [promptText, setPromptText] = useState("");
  const [carImageUrl, setCarImageUrl] = useState<string | null>(null);

  // Convert uploaded file to URL for display
  useEffect(() => {
    if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile);
      setCarImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [uploadedFile]);

  const handleGenerateImage = () => {
    // Prepare data for AI generation
    const generationData = {
      carImage: uploadedFile,
      sceneImage: sceneImage,
      promptText: promptText.trim(),
      location: mapData.position,
    };

    console.log("Generation data prepared:", generationData);

    // Here you would typically call your AI generation API
    // For now, we'll simulate the process
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const ImagePreviewCard = ({
    title,
    imageUrl,
    icon,
    isMissing,
  }: {
    title: string;
    imageUrl: string | null;
    icon: React.ReactNode;
    isMissing: boolean;
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

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4" component="h2" fontWeight={600} gutterBottom>
            Generate Your Scene
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review your selections and add optional details to guide the AI
            generation
          </Typography>
        </Box>

        {/* Scene Preview Section */}
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
            Scene Preview
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <Box sx={{ flex: 1 }}>
              <ImagePreviewCard
                title="Your Car"
                imageUrl={carImageUrl}
                icon={<PhotoCameraIcon />}
                isMissing={isCarImageMissing}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <ImagePreviewCard
                title="Chosen Location"
                imageUrl={sceneImage}
                icon={<MapIcon />}
                isMissing={isSceneImageMissing}
              />
            </Box>
          </Stack>
        </Box>

        {/* AI Context Input */}
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            AI Generation Settings
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Describe your scene (optional)"
            placeholder="e.g., 'Make it look like a cinematic car commercial with dramatic lighting' or 'Add some rain and moody atmosphere'"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
            }}
            helperText="Add specific details to guide the AI generation. Leave empty for default processing."
          />
        </Box>

        {/* Status and Action */}
        <Box>
          {isCarImageMissing || isSceneImageMissing ? (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Please complete the previous steps to upload a car photo and
                select a location before generating your scene.
              </Typography>
            </Alert>
          ) : (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2">
                ✅ All required images are ready! You can now generate your AI
                scene.
              </Typography>
            </Alert>
          )}

          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={isCarImageMissing || isSceneImageMissing}
            onClick={handleGenerateImage}
            sx={{
              py: 2,
              borderRadius: "12px",
              fontSize: "1.1rem",
              fontWeight: 600,
              textTransform: "none",
              background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
              boxShadow: "0 3px 5px 2px rgba(25, 118, 210, .3)",
              "&:hover": {
                background: "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
              },
            }}
          >
            🎨 Generate AI Scene
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
