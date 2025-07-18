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
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Google Maps API Key Required</Typography>
          <Typography variant="body2">
            Please set the NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
        Choose Location
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Click anywhere on the map to drop a pin and switch to Street View. Then
        click &quot;Choose Scene&quot; to capture the location.
      </Typography>

      <GoogleMap
        apiKey={GOOGLE_MAPS_API_KEY}
        initialCenter={mapData.position || { lat: 35.3606, lng: 138.7274 }}
        initialZoom={12}
        mapId="DEMO_MAP_ID"
        onSceneCapture={onSceneCapture}
        onMapDataUpdate={onMapDataUpdate}
        style={{
          height: "500px",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      />

      {/* Scene Preview */}
      {sceneImage && (
        <Card
          sx={{
            mt: 3,
            borderRadius: "12px",
            border: "1px solid",
            borderColor: "success.main",
            backgroundColor: "success.50",
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" fontWeight={600} color="success.main">
                📸 Captured Scene Preview
              </Typography>
              <Chip
                label="Ready for AI Generation"
                color="success"
                size="small"
                sx={{
                  ml: 2,
                  backgroundColor: "success.main",
                  color: "white",
                  fontWeight: 600,
                  "& .MuiChip-label": {
                    color: "white",
                    fontWeight: 600,
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
              sx={{ mt: 2, color: "success.main", fontWeight: 500 }}
            >
              ✅ Scene captured successfully! You can now proceed to step 3.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
