"use client";

import {
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { type Generation } from "../lib/supabase";
import { isGenerationEligibleForRevision } from "../lib/validateRevision";

interface GenerationResultProps {
  generation: Generation;
  onRevisionComplete?: (newGeneration: Generation) => void;
  onScrollToTop?: () => void;
}

type TimeOfDay = "sunrise" | "afternoon" | "dusk" | "night";

export default function GenerationResult({
  generation,
  onRevisionComplete,
  onScrollToTop,
}: GenerationResultProps) {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [revisionLoading, setRevisionLoading] = useState(false);
  const [revisionError, setRevisionError] = useState<string | null>(null);
  const [revisionSuccess, setRevisionSuccess] = useState(false);
  const [revisionData, setRevisionData] = useState({
    lat: generation.lat,
    lng: generation.lng,
    timeOfDay: generation.time_of_day as TimeOfDay,
    customInstructions: generation.custom_instructions || "",
  });

  const isEligibleForRevision = isGenerationEligibleForRevision(generation);

  const handleRevisionRequest = async () => {
    if (!user) {
      setRevisionError("You must be logged in to request a revision");
      return;
    }

    setRevisionLoading(true);
    setRevisionError(null);
    setRevisionSuccess(false);

    try {
      const response = await fetch("/api/revision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalGenerationId: generation.id,
          carImage: generation.car_image_url,
          sceneImage: generation.scene_image_url,
          lat: revisionData.lat,
          lng: revisionData.lng,
          timeOfDay: revisionData.timeOfDay,
          customInstructions: revisionData.customInstructions,
          userId: user.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Revision request failed");
      }

      if (result.success) {
        // Create a new generation object for the revision
        const newGeneration: Generation = {
          id: result.generationId,
          user_id: user.id,
          car_image_url: generation.car_image_url,
          scene_image_url: generation.scene_image_url,
          lat: revisionData.lat,
          lng: revisionData.lng,
          time_of_day: revisionData.timeOfDay,
          custom_instructions: revisionData.customInstructions,
          final_image_url: result.imageUrl,
          place_description: result.placeDescription,
          scene_description: result.sceneDescription,
          original_generation_id: generation.id,
          is_revision: true,
          revision_used: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        onRevisionComplete?.(newGeneration);
        setRevisionDialogOpen(false);
        setRevisionSuccess(true);

        // Scroll to top after a short delay to let the UI update
        setTimeout(() => {
          onScrollToTop?.();
        }, 100);
      } else {
        throw new Error("Revision request failed");
      }
    } catch (error) {
      console.error("Error requesting revision:", error);
      setRevisionError(
        error instanceof Error ? error.message : "Revision request failed"
      );
    } finally {
      setRevisionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Card
        sx={{
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AutoAwesomeIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Generated Image
                </Typography>
                {generation.is_revision && (
                  <Chip
                    label="Revision"
                    color="secondary"
                    size="small"
                    icon={<RefreshIcon />}
                    sx={{
                      backgroundColor: "secondary.main",
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {formatDate(generation.created_at)}
              </Typography>
            </Box>

            {/* Generated Image */}
            <Box
              sx={{
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <img
                src={generation.final_image_url}
                alt="Generated car scene"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
              />
            </Box>

            {/* Generation Details */}
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Location
                </Typography>
                <Typography variant="body1">
                  {generation.place_description}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Time of Day
                </Typography>
                <Chip
                  label={generation.time_of_day}
                  color="primary"
                  size="small"
                  sx={{ textTransform: "capitalize" }}
                />
              </Box>

              {generation.custom_instructions && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Custom Instructions
                  </Typography>
                  <Typography variant="body2">
                    {generation.custom_instructions}
                  </Typography>
                </Box>
              )}
            </Stack>

            {/* Revision Button */}
            {isEligibleForRevision && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setRevisionDialogOpen(true)}
                sx={{ alignSelf: "flex-start" }}
              >
                Request Revision
              </Button>
            )}

            {!isEligibleForRevision && (
              <Typography variant="body2" color="text.secondary">
                {generation.is_revision
                  ? "This is a revision and cannot be revised further"
                  : "Revision already used for this generation"}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Revision Dialog */}
      <Dialog
        open={revisionDialogOpen}
        onClose={() => !revisionLoading && setRevisionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            m: isMobile ? 0 : 2,
            width: "100%",
            minHeight: isMobile ? "100vh" : "auto",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: { xs: "1.2rem", sm: "1.5rem" },
            fontWeight: 600,
            p: { xs: 2, sm: 3 },
            pr: isMobile ? 5 : 3,
          }}
        >
          {revisionLoading ? "Generating Revision..." : "Request Revision"}
          {isMobile && (
            <IconButton
              aria-label="close"
              onClick={() => !revisionLoading && setRevisionDialogOpen(false)}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {revisionLoading && (
            <Box sx={{ mb: 3 }}>
              <Stack spacing={2} alignItems="center">
                <CircularProgress size={40} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                >
                  Generating your revision... This may take a few moments.
                </Typography>
                <LinearProgress sx={{ width: "100%" }} />
              </Stack>
            </Box>
          )}

          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
            >
              You can modify the location, time of day, and custom instructions
              for your revision. The car image cannot be changed.
            </Typography>

            {/* Location */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Location Coordinates
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Latitude"
                  type="number"
                  value={revisionData.lat}
                  onChange={(e) =>
                    setRevisionData((prev) => ({
                      ...prev,
                      lat: parseFloat(e.target.value) || 0,
                    }))
                  }
                  inputProps={{ step: 0.000001 }}
                  size="small"
                  fullWidth
                  disabled={revisionLoading}
                  sx={{ mb: { xs: 2, sm: 0 } }}
                />
                <TextField
                  label="Longitude"
                  type="number"
                  value={revisionData.lng}
                  onChange={(e) =>
                    setRevisionData((prev) => ({
                      ...prev,
                      lng: parseFloat(e.target.value) || 0,
                    }))
                  }
                  inputProps={{ step: 0.000001 }}
                  size="small"
                  fullWidth
                  disabled={revisionLoading}
                />
              </Stack>
            </Box>

            {/* Time of Day */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Time of Day
              </Typography>
              <ToggleButtonGroup
                value={revisionData.timeOfDay}
                exclusive
                onChange={(_, value) =>
                  value &&
                  setRevisionData((prev) => ({ ...prev, timeOfDay: value }))
                }
                size={isMobile ? "medium" : "small"}
                disabled={revisionLoading}
                sx={{
                  flexWrap: "wrap",
                  width: "100%",
                  justifyContent: { xs: "center", sm: "flex-start" },
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
                <ToggleButton value="sunrise">Sunrise</ToggleButton>
                <ToggleButton value="afternoon">Afternoon</ToggleButton>
                <ToggleButton value="dusk">Dusk</ToggleButton>
                <ToggleButton value="night">Night</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Custom Instructions */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Custom Instructions (Optional)
              </Typography>
              <TextField
                multiline
                rows={3}
                value={revisionData.customInstructions}
                onChange={(e) =>
                  setRevisionData((prev) => ({
                    ...prev,
                    customInstructions: e.target.value,
                  }))
                }
                placeholder="Add any specific instructions for the AI..."
                fullWidth
                disabled={revisionLoading}
              />
            </Box>

            {revisionError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {revisionError}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
          <Button
            onClick={() => setRevisionDialogOpen(false)}
            disabled={revisionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRevisionRequest}
            variant="contained"
            disabled={revisionLoading}
          >
            {revisionLoading ? "Generating..." : "Generate Revision"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={revisionSuccess}
        autoHideDuration={6000}
        onClose={() => setRevisionSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setRevisionSuccess(false)}
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{ width: "100%" }}
        >
          Revision generated successfully! Your new image has been added to the
          top of your generations.
        </Alert>
      </Snackbar>
    </>
  );
}
