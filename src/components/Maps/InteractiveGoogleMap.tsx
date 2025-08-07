import { Box, Link, Paper, Typography } from "@mui/material";
import React, { useState } from "react";
import GoogleMap from "./GoogleMap";

interface InteractiveGoogleMapProps {
  apiKey: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  mapId?: string;
  className?: string;
  style?: React.CSSProperties;
  onSceneCapture?: (sceneImage: string) => void;
  onMapDataUpdate?: (mapData: {
    position: { lat: number; lng: number };
    marker: unknown;
  }) => void;
  showSearchBar?: boolean;
}

const InteractiveGoogleMap: React.FC<InteractiveGoogleMapProps> = ({
  apiKey,
  initialCenter = { lat: 35.3606, lng: 138.7274 }, // Mount Fuji, Japan default
  initialZoom = 12,
  mapId = "DEMO_MAP_ID",
  className = "",
  style = {},
  onSceneCapture,
  onMapDataUpdate,
  showSearchBar = true,
}) => {
  // State for captured scene
  const [sceneImage, setSceneImage] = useState<string | null>(null);

  if (!apiKey) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 3,
          textAlign: "center",
          bgcolor: "#f5f5f5",
          borderRadius: 2,
          m: 3,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Google Maps API Key Required
        </Typography>
        <Typography variant="body1" gutterBottom>
          Please provide a valid Google Maps API key.
        </Typography>
        <Typography variant="body2">
          You can get a free API key from the{" "}
          <Link
            href="https://console.cloud.google.com/google/maps-apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: "#007bff", textDecoration: "none" }}
          >
            Google Cloud Console
          </Link>
        </Typography>
      </Paper>
    );
  }

  const handleSceneCapture = (capturedImage: string) => {
    setSceneImage(capturedImage);
    console.log("Scene captured:", capturedImage.substring(0, 50) + "...");

    // Call the parent callback if provided
    if (onSceneCapture) {
      onSceneCapture(capturedImage);
    }
  };

  return (
    <Box sx={{ p: 0 }}>
      <Box
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          mb: 3,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
      >
        <GoogleMap
          apiKey={apiKey}
          initialCenter={initialCenter}
          initialZoom={initialZoom}
          mapId={mapId}
          className={className}
          style={style}
          onSceneCapture={handleSceneCapture}
          onMapDataUpdate={onMapDataUpdate}
          showSearchBar={showSearchBar}
        />
      </Box>
    </Box>
  );
};

export default InteractiveGoogleMap;
