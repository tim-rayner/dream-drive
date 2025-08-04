"use client";

import {
  CheckCircle as CheckCircleIcon,
  Map as MapIcon,
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

const ChooseLocationCard = ({
  sceneImage,
  activeStep,
  isStepEnabled,
  handleStepClick,
}) => {
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
                      <CheckCircleIcon sx={{ fontSize: 16, color: "white" }} />
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
  );
};

export default ChooseLocationCard;
