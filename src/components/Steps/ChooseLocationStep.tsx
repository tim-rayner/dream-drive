import { Alert, Box, Card, CardContent, Chip, Typography } from "@mui/material";
import GoogleMap from "../Maps/GoogleMap";

interface ChooseLocationStepProps {
  onComplete: () => void;
  sceneImage: string | null;
  mapData: {
    position: { lat: number; lng: number } | null;
    marker: unknown | null;
  };
  onSceneCapture: (sceneImage: string) => void;
  onMapDataUpdate: (mapData: unknown) => void;
}

export default function ChooseLocationStep({
  onComplete,
  sceneImage,
  mapData,
  onSceneCapture,
  onMapDataUpdate,
}: ChooseLocationStepProps) {
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            Google Maps API Key Required
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            Please set the NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Typography
        variant="h4"
        fontWeight={600}
        sx={{
          mb: 1,
          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
          px: { xs: 1, sm: 0 },
        }}
      >
        Choose Location
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          mb: 3,
          px: { xs: 1, sm: 0 },
          fontSize: { xs: "0.95rem", sm: "1rem" },
          lineHeight: 1.6,
        }}
      >
        Click anywhere on the map to drop a pin and switch to Street View. Then
        click &quot;Choose Scene&quot; to capture the location.
      </Typography>

      <Box
        sx={{
          mb: { xs: 2, sm: 3 },
          px: { xs: 0, sm: 0 },
          mx: { xs: -1, sm: 0 },
        }}
      >
        <GoogleMap
          apiKey={GOOGLE_MAPS_API_KEY}
          initialCenter={mapData.position || { lat: 35.3606, lng: 138.7274 }}
          initialZoom={12}
          mapId="DEMO_MAP_ID"
          onSceneCapture={onSceneCapture}
          onMapDataUpdate={onMapDataUpdate}
          style={{
            height: "350px",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        />
      </Box>

      {/* Scene Preview */}
      {sceneImage && (
        <Card
          sx={{
            mt: { xs: 2, sm: 3 },
            borderRadius: "12px",
            border: "1px solid",
            borderColor: "success.main",
            backgroundColor: "success.50",
            overflow: "hidden",
            mx: { xs: 1, sm: 0 },
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                mb: 2,
                gap: { xs: 1, sm: 2 },
              }}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                color="success.main"
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                📸 Captured Scene Preview
              </Typography>
              <Chip
                label="Ready for AI Generation"
                color="success"
                size="small"
                sx={{
                  backgroundColor: "success.main",
                  color: "white",
                  fontWeight: 600,
                  "& .MuiChip-label": {
                    color: "white",
                    fontWeight: 600,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  },
                }}
              />
            </Box>

            <Box
              sx={{
                position: "relative",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
              }}
            >
              <img
                src={sceneImage}
                alt="Captured scene"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
              />
            </Box>

            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: "success.main",
                fontWeight: 500,
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              ✅ Scene captured successfully! You can now proceed to step 3.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
