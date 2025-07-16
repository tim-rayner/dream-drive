"use client";

import {
  AutoAwesome as AutoAwesomeIcon,
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

const steps = [
  {
    title: "Upload Car Photo",
    description:
      "Upload a high-quality photo of your car to get started with the AI transformation process",
    icon: <PhotoCameraIcon />,
  },
  {
    title: "Choose Location",
    description:
      "Select any location from Google Street View to place your car in a new environment",
    icon: <MapIcon />,
  },
  {
    title: "Generate Image",
    description:
      "AI creates stunning cinematic images of your car in the chosen location",
    icon: <AutoAwesomeIcon />,
  },
];

const StepsOverview = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [stepCompletion, setStepCompletion] = useState({
    0: false,
    1: false,
    2: false,
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [sceneImage, setSceneImage] = useState(null);
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
      localStorage.setItem("mapData", JSON.stringify(mapData));
    } else {
      localStorage.removeItem("mapData");
    }
  }, [mapData]);

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
  }, []);

  const handleFileUpload = useCallback((file) => {
    setUploadedFile(file);
    setStepCompletion((prev) => ({ ...prev, 0: true }));
  }, []);

  const handleSceneCapture = useCallback((capturedImage) => {
    setSceneImage(capturedImage);
    setStepCompletion((prev) => ({ ...prev, 1: true }));
    // Automatically move to step 3 (Generate Image)
    setActiveStep(2);
  }, []);

  const handleMapDataUpdate = useCallback((newMapData) => {
    setMapData(newMapData);
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
            onComplete={() =>
              setStepCompletion((prev) => ({ ...prev, 2: true }))
            }
            uploadedFile={uploadedFile}
            sceneImage={sceneImage}
            mapData={mapData}
          />
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
