"use client";

import {
  CheckCircle as CheckCircleIcon,
  PhotoCamera as PhotoCameraIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";

const UploadPhotoCard = ({ uploadedFile, activeStep, triggerFilePicker }) => {
  return (
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
                      <CheckCircleIcon sx={{ fontSize: 16, color: "white" }} />
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
  );
};

export default UploadPhotoCard;
