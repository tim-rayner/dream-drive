import {
  CheckCircle as CheckCircleIcon,
  Videocam as VideocamIcon,
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

const GenerateVideoCard = ({
  activeStep,
  isStepEnabled,
  handleStepClick,
  generatedVideoUrl,
  showVideoCard = false,
}) => {
  const isCompleted = generatedVideoUrl;
  const isActive = activeStep === 3;
  const isMissing = !isStepEnabled(3);

  if (!showVideoCard) {
    return null;
  }

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
        whileHover={{ scale: isStepEnabled(3) ? 1.02 : 1 }}
        whileTap={{ scale: isStepEnabled(3) ? 0.98 : 1 }}
        transition={{ duration: 0.2 }}
        style={{ height: "100%" }}
      >
        <Card
          onClick={() => handleStepClick(3)}
          elevation={0}
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            transition: "all 0.3s ease-in-out",
            border:
              activeStep === 3
                ? "2px solid #8B5CF6"
                : generatedVideoUrl
                ? "2px solid #10B981"
                : "2px solid transparent",
            opacity: isStepEnabled(3) ? 1 : 0.5,
            cursor: isStepEnabled(3) ? "pointer" : "not-allowed",
            "&:hover": {
              boxShadow: isStepEnabled(3)
                ? generatedVideoUrl
                  ? "0 8px 30px rgba(16, 185, 129, 0.1)"
                  : "0 8px 30px rgba(139, 92, 246, 0.1)"
                : "none",
              borderColor: isStepEnabled(3)
                ? generatedVideoUrl
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
            {generatedVideoUrl ? (
              // Show generated video preview
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
                    background: generatedVideoUrl
                      ? "linear-gradient(135deg, #10B981 0%, #34D399 100%)"
                      : "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                    position: "relative",
                    overflow: "visible",
                  }}
                >
                  <VideocamIcon
                    sx={{
                      fontSize: { xs: 30, sm: 40 },
                      color: "white",
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
                </Box>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}
                >
                  Generated Video
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
                  Your dynamic video is ready! Click to view or regenerate.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<VideocamIcon />}
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
                  disabled={!isStepEnabled(3)}
                >
                  View Video
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
                  <VideocamIcon
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
                  Generate Video
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
                  Transform your image into a dynamic video with custom motion
                  and effects
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<VideocamIcon />}
                  fullWidth
                  size="large"
                  sx={{
                    mt: "auto",
                    minHeight: 48,
                    fontWeight: 600,
                    fontSize: "1rem",
                  }}
                  disabled={!isStepEnabled(3)}
                >
                  Generate Video
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default GenerateVideoCard;
