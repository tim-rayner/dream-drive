import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Alert,
  Box,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
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

      {/* Scene Preview */}
      {sceneImage && (
        <Paper
          elevation={2}
          sx={{
            mt: 3,
            p: 2,
            bgcolor: "#e8f5e8",
            borderRadius: 2,
            border: "1px solid #4CAF50",
          }}
        >
          <Typography
            variant="h6"
            sx={{ display: "flex", alignItems: "center", mb: 1 }}
          >
            <Box component="span" sx={{ mr: 1 }} role="img" aria-label="camera">
              📸
            </Box>
            Captured Scene Preview
          </Typography>
          <Box
            component="img"
            src={sceneImage}
            alt="Captured scene"
            sx={{
              maxWidth: "100%",
              height: "auto",
              borderRadius: 1,
              border: "1px solid #ddd",
            }}
          />
          <Typography sx={{ mt: 2, fontSize: 14, color: "#666" }}>
            This scene has been captured and stored. You can now proceed to step
            3!
          </Typography>
        </Paper>
      )}

      <Box sx={{ mt: 3, color: "#666" }}>
        <Typography variant="h6" gutterBottom>
          Features:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Standard 2D Google Map (roadmap mode)" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Click anywhere to drop a pin" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Automatic switch to Street View at pin location" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Back to Map button overlay" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Preserves pin when returning to map view" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <>
                  <strong>NEW:</strong> &quot;Choose Scene&quot; button in
                  Street View
                </>
              }
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <>
                  <strong>NEW:</strong> Scene capture and preview
                </>
              }
            />
          </ListItem>
        </List>

        <Alert
          severity="warning"
          sx={{
            mt: 2,
            bgcolor: "#fff3cd",
            border: "1px solid #ffeaa7",
            color: "#856404",
          }}
        >
          <strong>Note:</strong> If you see a blank Street View or 429 errors,
          this is due to rate limiting with the demo Map ID. For production use,
          create your own Map ID in the Google Cloud Console to avoid these
          limits.
        </Alert>
      </Box>
    </Box>
  );
};

export default InteractiveGoogleMap;
