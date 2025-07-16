import React, { useState } from "react";
import GoogleMap from "./GoogleMap";

const InteractiveGoogleMap: React.FC = () => {
  // Replace with your actual Google Maps API key
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  // State for captured scene
  const [sceneImage, setSceneImage] = useState<string | null>(null);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          margin: "20px",
        }}
      >
        <h3>Google Maps API Key Required</h3>
        <p>
          Please set the <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
          environment variable with your Google Maps API key.
        </p>
        <p>
          You can get a free API key from the{" "}
          <a
            href="https://console.cloud.google.com/google/maps-apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#007bff", textDecoration: "none" }}
          >
            Google Cloud Console
          </a>
        </p>
      </div>
    );
  }

  const handleSceneCapture = (capturedImage: string) => {
    setSceneImage(capturedImage);
    console.log("Scene captured:", capturedImage.substring(0, 50) + "...");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Google Maps Component Demo</h2>
      <p>Click anywhere on the map to drop a pin and switch to Street View!</p>

      <GoogleMap
        apiKey={GOOGLE_MAPS_API_KEY}
        initialCenter={{ lat: 35.3606, lng: 138.7274 }} // Mount Fuji, Japan
        initialZoom={12}
        mapId="DEMO_MAP_ID" // You can create custom Map IDs in Google Cloud Console
        onSceneCapture={handleSceneCapture}
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      />

      {/* Scene Preview */}
      {sceneImage && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#e8f5e8",
            borderRadius: "8px",
            border: "1px solid #4CAF50",
          }}
        >
          <h4>📸 Captured Scene Preview</h4>
          <img
            src={sceneImage}
            alt="Captured scene"
            style={{
              maxWidth: "100%",
              height: "auto",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
          <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
            This scene has been captured and stored. You can now proceed to step
            3!
          </p>
        </div>
      )}

      <div style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
        <h4>Features:</h4>
        <ul>
          <li>✅ Standard 2D Google Map (roadmap mode)</li>
          <li>✅ Click anywhere to drop a pin</li>
          <li>✅ Automatic switch to Street View at pin location</li>
          <li>✅ &quot;Back to Map&quot; button overlay</li>
          <li>✅ Preserves pin when returning to map view</li>
          <li>
            ✅ <strong>NEW:</strong> &quot;Choose Scene&quot; button in Street
            View
          </li>
          <li>
            ✅ <strong>NEW:</strong> Scene capture and preview
          </li>
        </ul>

        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "4px",
            color: "#856404",
          }}
        >
          <strong>Note:</strong> If you see a blank Street View or 429 errors,
          this is due to rate limiting with the demo Map ID. For production use,
          create your own Map ID in the Google Cloud Console to avoid these
          limits.
        </div>
      </div>
    </div>
  );
};

export default InteractiveGoogleMap;
