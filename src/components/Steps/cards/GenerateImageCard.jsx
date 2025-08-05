"use client";

import { AutoAwesome as AutoAwesomeIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";

const GenerateImageCard = ({
  activeStep,
  isStepEnabled,
  handleStepClick,
  generatedImageUrl,
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
        backdropFilter: "blur(10px)",
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
              activeStep === 2 ? "2px solid #8B5CF6" : "2px solid transparent",
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
            {generatedImageUrl ? (
              // Show generated image preview
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
                    background: generatedImageUrl
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
                  <img
                    src={generatedImageUrl}
                    alt="Generated Scene"
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
                      top: 8,
                      right: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      backgroundColor: "rgba(0,0,0,0.7)",
                      color: "white",
                      px: 1,
                      py: 0.5,
                      borderRadius: "12px",
                    }}
                  ></Box>
                </Box>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}
                >
                  Generated Scene
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    lineHeight: 1.4,
                  }}
                >
                  Your AI-generated scene is ready! Click to view or regenerate.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AutoAwesomeIcon />}
                  fullWidth
                  size="medium"
                  sx={{
                    mt: "auto",
                    minHeight: 40,
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    background:
                      "linear-gradient(45deg, #10B981 30%, #34D399 90%)",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #059669 30%, #10B981 90%)",
                    },
                  }}
                  disabled={!isStepEnabled(2)}
                >
                  View Scene
                </Button>
              </Stack>
            ) : (
              // Show default content
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
                  AI creates stunning cinematic images of your car in the chosen
                  location
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
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default GenerateImageCard;
