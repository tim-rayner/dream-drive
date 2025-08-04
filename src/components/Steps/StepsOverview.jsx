"use client";

import {
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const mapContainerRef = useRef(null);

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

  const handleGenerationComplete = useCallback((imageUrl) => {
    setGeneratedImageUrl(imageUrl);
    setStepCompletion((prev) => ({ ...prev, 2: true }));
    setActiveStep(3);
  }, []);

  const handleReset = useCallback(() => {
    setActiveStep(0);
    setStepCompletion({ 0: false, 1: false, 2: false });
    setUploadedFile(null);
    setSceneImage(null);
    setGeneratedImageUrl(null);
    setMapData({ position: null, marker: null });
  }, []);

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
              <Stack spacing={4}>
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
                    <Box
                      sx={{
                        width: { xs: 60, sm: 80 },
                        height: { xs: 60, sm: 80 },
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CheckCircleIcon
                        sx={{
                          fontSize: { xs: 30, sm: 40 },
                          color: "white",
                        }}
                      />
                    </Box>
                    <Typography
                      variant="h4"
                      component="h2"
                      fontWeight={600}
                      sx={{
                        fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                      }}
                    >
                      DriveDream Complete! 🎉
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ px: { xs: 2, sm: 0 } }}
                  >
                    Your AI-generated car scene is ready! Download and share
                    your creation.
                  </Typography>
                </Box>

                {/* Final Image Display */}
                {generatedImageUrl && (
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight={600}
                      sx={{ mb: 3, px: { xs: 2, sm: 0 } }}
                    >
                      Your Generated Scene
                    </Typography>

                    <Card
                      sx={{
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "2px solid",
                        borderColor: "success.main",
                        boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
                        mx: { xs: 2, sm: 0 },
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
                            src={generatedImageUrl}
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
                              top: { xs: 8, sm: 16 },
                              right: { xs: 8, sm: 16 },
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              backgroundColor: "rgba(0,0,0,0.7)",
                              color: "white",
                              px: { xs: 1, sm: 2 },
                              py: { xs: 0.5, sm: 1 },
                              borderRadius: "20px",
                            }}
                          >
                            <AutoAwesomeIcon
                              sx={{ fontSize: { xs: 16, sm: 20 } }}
                            />
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              }}
                            >
                              AI Generated
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <Box
                      sx={{
                        mt: 4,
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 2,
                        justifyContent: "center",
                        px: { xs: 2, sm: 0 },
                      }}
                    >
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = generatedImageUrl;
                          link.download = "dream-drive-scene.jpg";
                          link.click();
                        }}
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
                        📥 Download Image
                      </Button>

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
                        🔄 Create New Scene
                      </Button>
                    </Box>
                  </Box>
                )}
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

  const handleStepClick = (stepIndex) => {
    if (isStepEnabled(stepIndex)) {
      setActiveStep(stepIndex);
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
          maxWidth: 800,
          mt: { xs: 3, sm: 4 },
          mb: { xs: 3, sm: 4 },
        }}
      />

      <Box
        sx={{
          mt: { xs: 3, sm: 4 },
          width: "100%",
          maxWidth: 800,
          px: { xs: 1, sm: 0 },
        }}
      >
        <AnimatePresence mode="wait">{renderActiveStep()}</AnimatePresence>
      </Box>
    </Box>
  );
};

export default StepsOverview;
