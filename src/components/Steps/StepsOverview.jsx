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
import { useCallback, useEffect, useState } from "react";
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

  // Save file to localStorage when it changes
  useEffect(() => {
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
    if (sceneImage) {
      localStorage.setItem("sceneImage", sceneImage);
    } else {
      localStorage.removeItem("sceneImage");
    }
  }, [sceneImage]);

  // Save map data to localStorage when it changes
  useEffect(() => {
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
    if (generatedImageUrl) {
      localStorage.setItem("generatedImageUrl", generatedImageUrl);
    } else {
      localStorage.removeItem("generatedImageUrl");
    }
  }, [generatedImageUrl]);

  // Restore file from localStorage on component mount
  useEffect(() => {
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
    localStorage.removeItem("uploadedFile");
    localStorage.removeItem("sceneImage");
    localStorage.removeItem("mapData");
    localStorage.removeItem("generatedImageUrl");
  }, []);

  const renderActiveStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <UploadPhotoStep
            onComplete={() =>
              setStepCompletion((prev) => ({ ...prev, 0: true }))
            }
            uploadedFile={uploadedFile}
            onFileUpload={handleFileUpload}
          />
        );
      case 1:
        return (
          <ChooseLocationStep
            onComplete={() =>
              setStepCompletion((prev) => ({ ...prev, 1: true }))
            }
            sceneImage={sceneImage}
            mapData={mapData}
            onSceneCapture={handleSceneCapture}
            onMapDataUpdate={handleMapDataUpdate}
          />
        );
      case 2:
        return (
          <GenerateImageStep
            onComplete={handleGenerationComplete}
            uploadedFile={uploadedFile}
            sceneImage={sceneImage}
            mapData={mapData}
          />
        );
      case 3:
        return (
          <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
            <Stack spacing={4}>
              {/* Header */}
              <Box sx={{ textAlign: "center" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 40, color: "white" }} />
                  </Box>
                  <Typography variant="h4" component="h2" fontWeight={600}>
                    Dream Drive Complete! 🎉
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  Your AI-generated car scene is ready! Download and share your
                  creation.
                </Typography>
              </Box>

              {/* Final Image Display */}
              {generatedImageUrl && (
                <Box>
                  <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                    Your Generated Scene
                  </Typography>

                  <Card
                    sx={{
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: "2px solid",
                      borderColor: "success.main",
                      boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
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

                  {/* Action Buttons */}
                  <Box
                    sx={{
                      mt: 4,
                      display: "flex",
                      gap: 2,
                      justifyContent: "center",
                      flexWrap: "wrap",
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
                      }}
                    >
                      📥 Download Image
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      onClick={handleReset}
                      sx={{
                        py: 2,
                        px: 4,
                        borderRadius: "12px",
                        fontSize: "1.1rem",
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
        );
      default:
        return (
          <UploadPhotoStep
            onComplete={() =>
              setStepCompletion((prev) => ({ ...prev, 0: true }))
            }
            uploadedFile={uploadedFile}
            onFileUpload={handleFileUpload}
          />
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
        py: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 3,
          justifyContent: "center",
          maxWidth: 1200,
          width: "100%",
        }}
      >
        <Box
          sx={{
            minHeight: 200,
            flex: {
              xs: "1 1 100%",
              sm: "1 1 calc(50% - 12px)",
              lg: "1 1 calc(33.3333% - 16px)",
            },
            maxWidth: {
              xs: "100%",
              sm: "calc(50% - 12px)",
              lg: "calc(33.3333% - 16px)",
            },
          }}
        >
          <Card
            onClick={() => handleStepClick(0)}
            elevation={0}
            sx={{
              height: "100%",
              transition: "all 0.3s ease-in-out",
              border:
                activeStep === 0
                  ? "2px solid #8B5CF6"
                  : "2px solid transparent",
              "&:hover": {
                boxShadow: "0 8px 30px rgba(139, 92, 246, 0.1)",
                borderColor: "#8B5CF6",
              },
            }}
          >
            <CardContent sx={{ p: 4, height: "100%" }}>
              <Stack spacing={3} alignItems="center" sx={{ height: "100%" }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <PhotoCameraIcon sx={{ fontSize: 40, color: "white" }} />
                </Box>
                <Typography variant="h5" fontWeight={600}>
                  Upload Car Photo
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  align="center"
                  sx={{ flex: 1 }}
                >
                  Upload a high-quality photo of your car to get started with
                  the AI transformation process
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PhotoCameraIcon />}
                  fullWidth
                  size="large"
                  sx={{ mt: "auto" }}
                >
                  Choose Photo
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box
          sx={{
            minHeight: 200,
            flex: {
              xs: "1 1 100%",
              sm: "1 1 calc(50% - 12px)",
              lg: "1 1 calc(33.3333% - 16px)",
            },
            maxWidth: {
              xs: "100%",
              sm: "calc(50% - 12px)",
              lg: "calc(33.3333% - 16px)",
            },
          }}
        >
          <Card
            onClick={() => handleStepClick(1)}
            elevation={0}
            sx={{
              height: "100%",
              transition: "all 0.3s ease-in-out",
              border:
                activeStep === 1
                  ? "2px solid #8B5CF6"
                  : "2px solid transparent",
              opacity: isStepEnabled(1) ? 1 : 0.5,
              "&:hover": {
                boxShadow: isStepEnabled(1)
                  ? "0 8px 30px rgba(139, 92, 246, 0.1)"
                  : "none",
                borderColor: isStepEnabled(1) ? "#8B5CF6" : "transparent",
              },
            }}
          >
            <CardContent sx={{ p: 4, height: "100%" }}>
              <Stack spacing={3} alignItems="center" sx={{ height: "100%" }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <MapIcon sx={{ fontSize: 40, color: "white" }} />
                </Box>
                <Typography variant="h5" fontWeight={600}>
                  Choose Location
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  align="center"
                  sx={{ flex: 1 }}
                >
                  Select any location from Google Street View to place your car
                  in a new environment
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<MapIcon />}
                  fullWidth
                  size="large"
                  sx={{ mt: "auto" }}
                  disabled={!isStepEnabled(1)}
                >
                  Browse Locations
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box
          sx={{
            minHeight: 200,
            flex: {
              xs: "1 1 100%",
              sm: "1 1 calc(50% - 12px)",
              lg: "1 1 calc(33.3333% - 16px)",
            },
            maxWidth: {
              xs: "100%",
              sm: "calc(50% - 12px)",
              lg: "calc(33.3333% - 16px)",
            },
          }}
        >
          <Card
            onClick={() => handleStepClick(2)}
            elevation={0}
            sx={{
              height: "100%",
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
            <CardContent sx={{ p: 4, height: "100%" }}>
              <Stack spacing={3} alignItems="center" sx={{ height: "100%" }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <AutoAwesomeIcon sx={{ fontSize: 40, color: "white" }} />
                </Box>
                <Typography variant="h5" fontWeight={600}>
                  Generate Image
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  align="center"
                  sx={{ flex: 1 }}
                >
                  AI creates stunning cinematic images of your car in the chosen
                  location
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AutoAwesomeIcon />}
                  fullWidth
                  size="large"
                  sx={{ mt: "auto" }}
                  disabled={!isStepEnabled(2)}
                >
                  Generate Scene
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Divider sx={{ width: "100%", maxWidth: 800, mt: 4, mb: 4 }} />

      <Box sx={{ mt: 4, width: "100%", maxWidth: 800 }}>
        {renderActiveStep()}
      </Box>
    </Box>
  );
};

export default StepsOverview;
