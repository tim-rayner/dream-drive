"use client";

import {
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCredits } from "../../context/CreditsContext";
import RevisionCarousel from "../RevisionCarousel";
import ChooseLocationStep from "./ChooseLocationStep";
import GenerateImageStep from "./GenerateImageStep";
import UploadPhotoStep from "./UploadPhotoStep";
import ChooseLocationCard from "./cards/ChooseLocationCard";
import GenerateImageCard from "./cards/GenerateImageCard";
import UploadPhotoCard from "./cards/UploadPhotoCard";

const StepsOverview = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [stepCompletion, setStepCompletion] = useState({
    0: false,
    1: false,
    2: false,
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [sceneImage, setSceneImage] = useState(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [mapData, setMapData] = useState({
    position: null,
    marker: null,
  });
  const [generationId, setGenerationId] = useState(null);
  const [originalGeneration, setOriginalGeneration] = useState(null);
  const [revisedGeneration, setRevisedGeneration] = useState(null);
  const [revisionData, setRevisionData] = useState({
    timeOfDay: "afternoon",
    customInstructions: "",
  });
  const [isRevisionEligible, setIsRevisionEligible] = useState(true);
  const [revisionLoading, setRevisionLoading] = useState(false);
  const [revisionError, setRevisionError] = useState(null);
  const mapContainerRef = useRef(null);
  const { user } = useAuth();
  const { refreshCredits } = useCredits();

  useEffect(() => {
    if (activeStep === 1 && mapContainerRef.current) {
      mapContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [activeStep]);

  // Mark step 2 as completed if there's a generated image
  useEffect(() => {
    if (generatedImageUrl && !stepCompletion[2]) {
      setStepCompletion((prev) => ({ ...prev, 2: true }));
    }
  }, [generatedImageUrl, stepCompletion[2]]);

  const handleFileUpload = useCallback((file) => {
    setUploadedFile(file);
    setStepCompletion((prev) => ({ ...prev, 0: true }));
  }, []);

  const handleSceneCapture = useCallback((capturedImage) => {
    setSceneImage(capturedImage);
    setStepCompletion((prev) => ({ ...prev, 1: true }));
    setActiveStep(2);
  }, []);

  const handleMapDataUpdate = useCallback((newMapData) => {
    setMapData(newMapData);
  }, []);

  const handleGenerationComplete = useCallback(
    (imageUrl, generationId = null) => {
      setGeneratedImageUrl(imageUrl);
      if (generationId) {
        setGenerationId(generationId);
        // Create a basic generation object for the original
        setOriginalGeneration({
          id: generationId,
          final_image_url: imageUrl,
          time_of_day: "afternoon", // Default, could be enhanced
          place_description: "Selected location", // Default, could be enhanced
        });
      }
      setStepCompletion((prev) => ({ ...prev, 2: true }));
      setActiveStep(3);
    },
    []
  );

  const handleRevisionRequest = useCallback(async () => {
    if (!user) {
      setRevisionError("You must be logged in to request a revision");
      return;
    }

    if (!generationId) {
      setRevisionError("No generation ID available for revision");
      return;
    }

    setRevisionLoading(true);
    setRevisionError(null);

    try {
      const response = await fetch("/api/revision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalGenerationId: generationId,
          carImage: uploadedFile ? await fileToBase64(uploadedFile) : null,
          sceneImage: sceneImage,
          lat: mapData.position.lat,
          lng: mapData.position.lng,
          timeOfDay: revisionData.timeOfDay,
          customInstructions: revisionData.customInstructions,
          userId: user.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Revision request failed");
      }

      if (result.success && result.imageUrl) {
        setGeneratedImageUrl(result.imageUrl);
        setIsRevisionEligible(false);

        // Store the revised generation
        setRevisedGeneration({
          id: result.generationId || `revised-${Date.now()}`,
          final_image_url: result.imageUrl,
          time_of_day: revisionData.timeOfDay,
          place_description: result.placeDescription || "Revised location",
          original_generation_id: generationId,
          is_revision: true,
        });

        await refreshCredits();
      } else {
        throw new Error("No image URL returned from revision API");
      }
    } catch (error) {
      console.error("Error requesting revision:", error);
      setRevisionError(error.message || "Revision failed");
    } finally {
      setRevisionLoading(false);
    }
  }, [
    user,
    generationId,
    uploadedFile,
    sceneImage,
    mapData,
    revisionData,
    refreshCredits,
  ]);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleReset = useCallback(() => {
    setActiveStep(0);
    setStepCompletion({ 0: false, 1: false, 2: false });
    setUploadedFile(null);
    setSceneImage(null);
    setGeneratedImageUrl(null);
    setMapData({ position: null, marker: null });
    setGenerationId(null);
    setOriginalGeneration(null);
    setRevisedGeneration(null);
    setRevisionData({ timeOfDay: "afternoon", customInstructions: "" });
    setIsRevisionEligible(true);
    setRevisionError(null);
  }, []);

  const isStepEnabled = (stepIndex) => {
    if (stepIndex === 0) return true;
    if (stepIndex === 1) return stepCompletion[0];
    if (stepIndex === 2) return stepCompletion[0] && stepCompletion[1];
    if (stepIndex === 3)
      return (
        stepCompletion[0] &&
        stepCompletion[1] &&
        (stepCompletion[2] || generatedImageUrl)
      );
    return false;
  };

  // Function to trigger file picker from stepper
  const triggerFilePicker = useCallback(() => {
    if (!uploadedFile) {
      // Create a temporary file input and trigger it
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/jpeg,image/jpg,image/png,image/webp";
      fileInput.style.display = "none";

      fileInput.onchange = (e) => {
        const target = e.target;
        if (target.files && target.files.length > 0) {
          const file = target.files[0];
          handleFileUpload(file);
        }
        // Clean up
        document.body.removeChild(fileInput);
      };

      document.body.appendChild(fileInput);
      fileInput.click();
    }
  }, [uploadedFile, handleFileUpload]);

  const handleStepClick = useCallback(
    (stepIndex) => {
      if (isStepEnabled(stepIndex)) {
        setActiveStep(stepIndex);
      }
    },
    [isStepEnabled]
  );

  const renderActiveStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <motion.div
            key="upload-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <UploadPhotoStep
              onComplete={() => {
                setStepCompletion((prev) => ({ ...prev, 0: true }));
                setActiveStep(1);
              }}
              uploadedFile={uploadedFile}
              onFileUpload={handleFileUpload}
            />
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            key="location-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ChooseLocationStep
              onComplete={() =>
                setStepCompletion((prev) => ({ ...prev, 1: true }))
              }
              sceneImage={sceneImage}
              mapData={mapData}
              onSceneCapture={handleSceneCapture}
              onMapDataUpdate={handleMapDataUpdate}
              mapContainerRef={mapContainerRef}
            />
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="generate-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <GenerateImageStep
              onComplete={handleGenerationComplete}
              uploadedFile={uploadedFile}
              sceneImage={sceneImage}
              mapData={mapData}
              generatedImageUrl={generatedImageUrl}
            />
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="completion-step"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
              <Stack spacing={4} sx={{ px: { xs: 2, sm: 0 } }} mx="auto">
                {/* Header */}
                <Box sx={{ textAlign: "center" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 3,
                      gap: { xs: 2, sm: 3 },
                    }}
                  >
                    <CheckCircleIcon
                      sx={{
                        fontSize: { xs: 30, sm: 40 },
                        color: "white",
                      }}
                    />

                    <Typography
                      variant="h4"
                      component="h2"
                      fontWeight={600}
                      sx={{
                        fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                      }}
                    >
                      Shoot Complete!
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ px: { xs: 2, sm: 0 } }}
                  >
                    Your AI-generated car scene is ready! Download, share, or
                    refine your creation.
                  </Typography>
                </Box>

                {/* Final Image Display */}
                {generatedImageUrl && originalGeneration && (
                  <Box>
                    <RevisionCarousel
                      originalGeneration={originalGeneration}
                      revisedGeneration={revisedGeneration}
                      size={500}
                    />
                  </Box>
                )}

                {/* Revision Section */}
                {isRevisionEligible && generationId && (
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight={600}
                      sx={{ mb: 3, px: { xs: 2, sm: 0 } }}
                    >
                      Refine Your Scene
                    </Typography>

                    {!user ? (
                      <Alert
                        severity="warning"
                        sx={{ mb: 3, mx: { xs: 2, sm: 0 } }}
                      >
                        <Typography variant="body2">
                          <strong>Login Required:</strong> You need to be logged
                          in to use the free revision feature. Please log in to
                          refine your scene.
                        </Typography>
                      </Alert>
                    ) : (
                      <>
                        <Alert
                          severity="info"
                          sx={{ mb: 3, mx: { xs: 2, sm: 0 } }}
                          icon={<RefreshIcon />}
                        >
                          <Typography variant="body2">
                            <strong>Free Revision Available!</strong>
                          </Typography>
                          <Typography variant="body2">
                            You can refine your scene once with different
                            settings. Change the time of day, location, or add
                            custom instructions.
                          </Typography>
                        </Alert>

                        {/* Time of Day Selection */}
                        <Box sx={{ mb: 3, px: { xs: 2, sm: 0 } }}>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{
                              mb: 2,
                              fontSize: { xs: "1.1rem", sm: "1.25rem" },
                            }}
                          >
                            Time of Day
                          </Typography>
                          <ToggleButtonGroup
                            value={revisionData.timeOfDay}
                            exclusive
                            onChange={(_, newValue) => {
                              if (newValue !== null) {
                                setRevisionData((prev) => ({
                                  ...prev,
                                  timeOfDay: newValue,
                                }));
                              }
                            }}
                            aria-label="time of day"
                            sx={{
                              flexWrap: "wrap",
                              width: "100%",
                              justifyContent: {
                                xs: "center",
                                sm: "flex-start",
                              },
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
                              Sunrise
                            </ToggleButton>
                            <ToggleButton
                              value="afternoon"
                              aria-label="afternoon"
                            >
                              Afternoon
                            </ToggleButton>
                            <ToggleButton value="dusk" aria-label="dusk">
                              Dusk
                            </ToggleButton>
                            <ToggleButton value="night" aria-label="night">
                              Night
                            </ToggleButton>
                          </ToggleButtonGroup>
                        </Box>

                        {/* Custom Instructions Input */}
                        <Box sx={{ mb: 3, px: { xs: 2, sm: 0 } }}>
                          <TextField
                            label="Optional: Add extra details for the AI (e.g. mood, background elements, weather...)"
                            multiline
                            minRows={2}
                            maxRows={6}
                            value={revisionData.customInstructions}
                            onChange={(e) =>
                              setRevisionData((prev) => ({
                                ...prev,
                                customInstructions: e.target.value,
                              }))
                            }
                            variant="outlined"
                            fullWidth
                          />
                        </Box>

                        {/* Revision Error */}
                        {revisionError && (
                          <Alert
                            severity="error"
                            sx={{ mb: 3, mx: { xs: 2, sm: 0 } }}
                          >
                            <Typography variant="body2">
                              {revisionError}
                            </Typography>
                          </Alert>
                        )}

                        {/* Revision Button */}
                        <Box sx={{ px: { xs: 2, sm: 0 } }}>
                          <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            disabled={revisionLoading || !generationId}
                            onClick={handleRevisionRequest}
                            sx={{
                              py: { xs: 1.5, sm: 2 },
                              borderRadius: "12px",
                              fontSize: { xs: "1rem", sm: "1.1rem" },
                              fontWeight: 600,
                              textTransform: "none",
                              background:
                                "linear-gradient(45deg, #8B5CF6 30%, #A78BFA 90%)",
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
                            {revisionLoading ? (
                              <>
                                <CircularProgress
                                  size={20}
                                  sx={{ mr: 1, color: "white" }}
                                />
                                Generating Revision...
                              </>
                            ) : (
                              <>
                                <RefreshIcon sx={{ mr: 1 }} />
                                Generate Free Revision
                              </>
                            )}
                          </Button>
                        </Box>
                      </>
                    )}
                  </Box>
                )}

                {/* Revision Used Message */}
                {!isRevisionEligible && generationId && (
                  <Box sx={{ px: { xs: 2, sm: 0 } }}>
                    <Alert
                      severity="success"
                      sx={{ mb: 3 }}
                      gap={1}
                      icon={<CheckCircleIcon />}
                    >
                      <Typography variant="body2">
                        <strong>Revision Complete!</strong>
                      </Typography>
                      <Typography variant="body2">
                        Your scene has been refined. You can download the new
                        version or create a new scene.
                      </Typography>
                    </Alert>
                  </Box>
                )}

                {/* Action Button */}
                <Box
                  sx={{
                    mt: 4,
                    display: "flex",
                    justifyContent: "center",
                    px: { xs: 2, sm: 0 },
                  }}
                >
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleReset}
                    sx={{
                      py: { xs: 1.5, sm: 2 },
                      px: { xs: 3, sm: 4 },
                      borderRadius: "12px",
                      fontSize: { xs: "1rem", sm: "1.1rem" },
                      fontWeight: 600,
                      textTransform: "none",
                      borderColor: "primary.main",
                      color: "primary.main",
                      "&:hover": {
                        borderColor: "primary.dark",
                        backgroundColor: "primary.main",
                        color: "white",
                      },
                    }}
                  >
                    Create New Scene
                  </Button>
                </Box>
              </Stack>
            </Box>
          </motion.div>
        );
      default:
        return (
          <motion.div
            key="default-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <UploadPhotoStep
              onComplete={() => {
                setStepCompletion((prev) => ({ ...prev, 0: true }));
                setActiveStep(1);
              }}
              uploadedFile={uploadedFile}
              onFileUpload={handleFileUpload}
            />
          </motion.div>
        );
    }
  };

  return (
    <Box
      sx={{
        py: { xs: 2, sm: 4 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        px: { xs: 1, sm: 2 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: { xs: 2, sm: 3, lg: 5 },
          justifyContent: "center",
          alignItems: "stretch",
          maxWidth: 1200,
          width: "100%",
          alignItems: "center",
        }}
      >
        <UploadPhotoCard
          uploadedFile={uploadedFile}
          activeStep={activeStep}
          onFileUpload={handleFileUpload}
          triggerFilePicker={triggerFilePicker}
        />
        <ChooseLocationCard
          sceneImage={sceneImage}
          activeStep={activeStep}
          isStepEnabled={isStepEnabled}
          handleStepClick={handleStepClick}
        />
        <GenerateImageCard
          activeStep={activeStep}
          isStepEnabled={isStepEnabled}
          handleStepClick={handleStepClick}
          generatedImageUrl={generatedImageUrl}
        />
      </Box>

      <Divider
        sx={{
          width: "100%",
          mt: { xs: 3, sm: 4 },
          mb: { xs: 3, sm: 4 },
        }}
      />

      <Box
        sx={{
          mt: { xs: 3, sm: 4 },
          width: "100%",
          px: { xs: 2, sm: 0 },
        }}
      >
        <AnimatePresence mode="wait">{renderActiveStep()}</AnimatePresence>
      </Box>
    </Box>
  );
};

export default StepsOverview;
