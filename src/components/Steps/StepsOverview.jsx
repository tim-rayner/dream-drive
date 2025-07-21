"use client";

import {
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckCircleIcon,
  Map as MapIcon,
  PhotoCamera as PhotoCameraIcon,
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
  const locationStepRef = useRef(null);
  const mapContainerRef = useRef(null);

  // Save file to localStorage when it changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const fileData = {
          name: uploadedFile.name,
          type: uploadedFile.type,
          size: uploadedFile.size,
          data: reader.result,
        };
        localStorage.setItem("uploadedFile", JSON.stringify(fileData));
      };
      reader.readAsDataURL(uploadedFile);
    } else {
      localStorage.removeItem("uploadedFile");
    }
  }, [uploadedFile]);

  // Save scene image to localStorage when it changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (sceneImage) {
      localStorage.setItem("sceneImage", sceneImage);
    } else {
      localStorage.removeItem("sceneImage");
    }
  }, [sceneImage]);

  // Save map data to localStorage when it changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (mapData.position) {
      // Only save the position data, not the marker object (which has circular references)
      const mapDataToSave = {
        position: mapData.position,
        marker: null, // Don't save the marker object
      };
      localStorage.setItem("mapData", JSON.stringify(mapDataToSave));
      console.log("Location data saved:", mapDataToSave);
    } else {
      localStorage.removeItem("mapData");
    }
  }, [mapData]);

  // Save generated image URL to localStorage when it changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (generatedImageUrl) {
      localStorage.setItem("generatedImageUrl", generatedImageUrl);
    } else {
      localStorage.removeItem("generatedImageUrl");
    }
  }, [generatedImageUrl]);

  // Restore file from localStorage on component mount
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const savedFileData = localStorage.getItem("uploadedFile");
    if (savedFileData) {
      try {
        const fileData = JSON.parse(savedFileData);
        // Convert base64 back to File object
        const byteString = atob(fileData.data.split(",")[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: fileData.type });
        const restoredFile = new File([blob], fileData.name, {
          type: fileData.type,
        });

        setUploadedFile(restoredFile);
        setStepCompletion((prev) => ({ ...prev, 0: true }));
      } catch (error) {
        console.error("Error restoring file from localStorage:", error);
        localStorage.removeItem("uploadedFile");
      }
    }

    // Restore scene image from localStorage
    const savedSceneImage = localStorage.getItem("sceneImage");
    if (savedSceneImage) {
      setSceneImage(savedSceneImage);
      setStepCompletion((prev) => ({ ...prev, 1: true }));
    }

    // Restore map data from localStorage
    const savedMapData = localStorage.getItem("mapData");
    if (savedMapData) {
      try {
        const restoredMapData = JSON.parse(savedMapData);
        setMapData(restoredMapData);
      } catch (error) {
        console.error("Error restoring map data from localStorage:", error);
        localStorage.removeItem("mapData");
      }
    }

    // Restore generated image URL from localStorage
    const savedGeneratedImageUrl = localStorage.getItem("generatedImageUrl");
    if (savedGeneratedImageUrl) {
      setGeneratedImageUrl(savedGeneratedImageUrl);
      setStepCompletion((prev) => ({ ...prev, 2: true }));
    }
  }, []);

  useEffect(() => {
    if (activeStep === 1 && mapContainerRef.current) {
      mapContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [activeStep]);

  const handleFileUpload = useCallback((file) => {
    setUploadedFile(file);
    setStepCompletion((prev) => ({ ...prev, 0: true }));
  }, []);

  const handleSceneCapture = useCallback((capturedImage) => {
    console.log(
      "🎬 handleSceneCapture called with image length:",
      capturedImage.length
    );
    setSceneImage(capturedImage);
    setStepCompletion((prev) => ({ ...prev, 1: true }));
    console.log("✅ Scene image set, moving to step 2");
    // Automatically move to step 3 (Generate Image)
    setActiveStep(2);
    console.log("✅ Active step set to 2");
  }, []);

  const handleMapDataUpdate = useCallback((newMapData) => {
    console.log("Location data received:", newMapData);
    setMapData(newMapData);
  }, []);

  const handleGenerationComplete = useCallback((imageUrl) => {
    setGeneratedImageUrl(imageUrl);
    setStepCompletion((prev) => ({ ...prev, 2: true }));
    // Move to completion state
    setActiveStep(3);
  }, []);

  const handleReset = useCallback(() => {
    setActiveStep(0);
    setStepCompletion({ 0: false, 1: false, 2: false });
    setUploadedFile(null);
    setSceneImage(null);
    setGeneratedImageUrl(null);
    setMapData({ position: null, marker: null });
    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("uploadedFile");
      localStorage.removeItem("sceneImage");
      localStorage.removeItem("mapData");
      localStorage.removeItem("generatedImageUrl");
    }
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
              onComplete={() =>
                setStepCompletion((prev) => ({ ...prev, 0: true }))
              }
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
          alignItems: "stretch", // Ensure all cards stretch to same height
          maxWidth: 1200,
          width: "100%",
        }}
      >
        {/* Card 1 */}
        <Box
          sx={{
            minHeight: { xs: 180, sm: 220, md: 260 },
            flex: {
              xs: "1 1 100%",
              lg: "1 1 350px",
            },
            minWidth: { xs: "100%", sm: 280, md: 320, lg: 350 },
            maxWidth: { xs: "100%", sm: 400, md: 420, lg: 400 },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            style={{ height: "100%" }}
          >
            <Card
              onClick={() => handleStepClick(0)}
              elevation={0}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease-in-out",
                border:
                  activeStep === 0
                    ? "2px solid #8B5CF6"
                    : uploadedFile
                    ? "2px solid #10B981"
                    : "2px solid transparent",
                "&:hover": {
                  boxShadow: uploadedFile
                    ? "0 8px 30px rgba(16, 185, 129, 0.1)"
                    : "0 8px 30px rgba(139, 92, 246, 0.1)",
                  borderColor: uploadedFile ? "#10B981" : "#8B5CF6",
                },
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 2, sm: 4 },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Stack
                  spacing={3}
                  alignItems="center"
                  sx={{
                    height: "100%",
                    flex: 1,
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 60, sm: 80 },
                      height: { xs: 60, sm: 80 },
                      borderRadius: "50%",
                      background: uploadedFile
                        ? "linear-gradient(135deg, #10B981 0%, #34D399 100%)"
                        : "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {uploadedFile ? (
                      <>
                        <img
                          src={URL.createObjectURL(uploadedFile)}
                          alt="Car preview"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            top: -5,
                            right: -5,
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: "#10B981",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid white",
                          }}
                        >
                          <CheckCircleIcon
                            sx={{ fontSize: 16, color: "white" }}
                          />
                        </Box>
                      </>
                    ) : (
                      <PhotoCameraIcon
                        sx={{
                          fontSize: { xs: 30, sm: 40 },
                          color: "white",
                        }}
                      />
                    )}
                  </Box>
                  <Typography
                    variant="h5"
                    fontWeight={600}
                    sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
                  >
                    Upload Car Photo
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    align="center"
                    sx={{
                      flex: 1,
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      lineHeight: 1.5,
                    }}
                  >
                    {uploadedFile
                      ? "Photo uploaded successfully! You can now proceed to choose a location."
                      : "Upload a high-quality photo of your car to get started with the AI transformation process"}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PhotoCameraIcon />}
                    fullWidth
                    size="large"
                    sx={{
                      mt: "auto",
                      minHeight: 48,
                      fontWeight: 600,
                      fontSize: "1rem",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerFilePicker();
                    }}
                    disabled={!!uploadedFile}
                  >
                    {uploadedFile ? "Photo Uploaded ✓" : "Choose Photo"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
        {/* Card 2 */}
        <Box
          sx={{
            minHeight: { xs: 180, sm: 220, md: 260 },
            flex: {
              xs: "1 1 100%",
              lg: "1 1 350px",
            },
            minWidth: { xs: "100%", sm: 280, md: 320, lg: 350 },
            maxWidth: { xs: "100%", sm: 400, md: 420, lg: 400 },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <motion.div
            whileHover={{ scale: isStepEnabled(1) ? 1.02 : 1 }}
            whileTap={{ scale: isStepEnabled(1) ? 0.98 : 1 }}
            transition={{ duration: 0.2 }}
            style={{ height: "100%" }}
          >
            <Card
              onClick={() => handleStepClick(1)}
              elevation={0}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease-in-out",
                border:
                  activeStep === 1
                    ? "2px solid #8B5CF6"
                    : sceneImage
                    ? "2px solid #10B981"
                    : "2px solid transparent",
                opacity: isStepEnabled(1) ? 1 : 0.5,
                "&:hover": {
                  boxShadow: isStepEnabled(1)
                    ? sceneImage
                      ? "0 8px 30px rgba(16, 185, 129, 0.1)"
                      : "0 8px 30px rgba(139, 92, 246, 0.1)"
                    : "none",
                  borderColor: isStepEnabled(1)
                    ? sceneImage
                      ? "#10B981"
                      : "#8B5CF6"
                    : "transparent",
                },
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 2, sm: 4 },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Stack
                  spacing={3}
                  alignItems="center"
                  sx={{
                    height: "100%",
                    flex: 1,
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 60, sm: 80 },
                      height: { xs: 60, sm: 80 },
                      borderRadius: "50%",
                      background: sceneImage
                        ? "linear-gradient(135deg, #10B981 0%, #34D399 100%)"
                        : "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {sceneImage ? (
                      <>
                        <img
                          src={sceneImage}
                          alt="Scene preview"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            top: -5,
                            right: -5,
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: "#10B981",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid white",
                          }}
                        >
                          <CheckCircleIcon
                            sx={{ fontSize: 16, color: "white" }}
                          />
                        </Box>
                      </>
                    ) : (
                      <MapIcon
                        sx={{
                          fontSize: { xs: 30, sm: 40 },
                          color: "white",
                        }}
                      />
                    )}
                  </Box>
                  <Typography
                    variant="h5"
                    fontWeight={600}
                    sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
                  >
                    Choose Location
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    align="center"
                    sx={{
                      flex: 1,
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      lineHeight: 1.5,
                    }}
                  >
                    {sceneImage
                      ? "Scene selected successfully! You can now proceed to generate your AI image."
                      : "Select any location from Google Street View to place your car in a new environment"}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={sceneImage ? <CheckCircleIcon /> : <MapIcon />}
                    fullWidth
                    size="large"
                    sx={{
                      mt: "auto",
                      minHeight: 48,
                      fontWeight: 600,
                      fontSize: "1rem",
                    }}
                    disabled={!isStepEnabled(1) || !!sceneImage}
                  >
                    {sceneImage ? "Scene Selected ✓" : "Browse Locations"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
        {/* Card 3 */}
        <Box
          sx={{
            minHeight: { xs: 180, sm: 220, md: 260 },
            flex: {
              xs: "1 1 100%",
              lg: "1 1 350px",
            },
            minWidth: { xs: "100%", sm: 280, md: 320, lg: 350 },
            maxWidth: { xs: "100%", sm: 400, md: 420, lg: 400 },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <motion.div
            whileHover={{ scale: isStepEnabled(2) ? 1.02 : 1 }}
            whileTap={{ scale: isStepEnabled(2) ? 0.98 : 1 }}
            transition={{ duration: 0.2 }}
            style={{ height: "100%" }}
          >
            <Card
              onClick={() => handleStepClick(2)}
              elevation={0}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease-in-out",
                border:
                  activeStep === 2
                    ? "2px solid #8B5CF6"
                    : "2px solid transparent",
                opacity: isStepEnabled(2) ? 1 : 0.5,
                cursor: isStepEnabled(2) ? "pointer" : "not-allowed",
                "&:hover": {
                  boxShadow: isStepEnabled(2)
                    ? "0 8px 30px rgba(139, 92, 246, 0.1)"
                    : "none",
                  borderColor: isStepEnabled(2) ? "#8B5CF6" : "transparent",
                },
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 2, sm: 4 },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Stack
                  spacing={3}
                  alignItems="center"
                  sx={{
                    height: "100%",
                    flex: 1,
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 60, sm: 80 },
                      height: { xs: 60, sm: 80 },
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <AutoAwesomeIcon
                      sx={{
                        fontSize: { xs: 30, sm: 40 },
                        color: "white",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h5"
                    fontWeight={600}
                    sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
                  >
                    Generate Image
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    align="center"
                    sx={{
                      flex: 1,
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      lineHeight: 1.5,
                    }}
                  >
                    AI creates stunning cinematic images of your car in the
                    chosen location
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AutoAwesomeIcon />}
                    fullWidth
                    size="large"
                    sx={{
                      mt: "auto",
                      minHeight: 48,
                      fontWeight: 600,
                      fontSize: "1rem",
                    }}
                    disabled={!isStepEnabled(2)}
                  >
                    Generate Scene
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
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
