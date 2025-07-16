import React, { useEffect, useRef, useState } from "react";

interface GoogleMapProps {
  apiKey: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  mapId?: string;
  className?: string;
  style?: React.CSSProperties;
}

interface MapState {
  map: google.maps.Map | null;
  streetView: google.maps.StreetViewPanorama | null;
  marker: google.maps.marker.AdvancedMarkerElement | null;
  isStreetViewActive: boolean;
  isLoadingStreetView: boolean;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  apiKey,
  initialCenter = { lat: 40.7128, lng: -74.006 }, // New York City default
  initialZoom = 12,
  mapId = "DEMO_MAP_ID",
  className = "",
  style = {},
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const streetViewRef = useRef<HTMLDivElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const [mapState, setMapState] = useState<MapState>({
    map: null,
    streetView: null,
    marker: null,
    isStreetViewActive: false,
    isLoadingStreetView: false,
  });

  useEffect(() => {
    // Load Google Maps API
    const loadGoogleMapsAPI = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.google && window.google.maps) {
          resolve();
          return;
        }

        // Check if script is already loading
        const existingScript = document.querySelector(
          'script[src*="maps.googleapis.com"]'
        );
        if (existingScript) {
          // Wait for existing script to load
          existingScript.addEventListener("load", () => resolve());
          existingScript.addEventListener("error", () =>
            reject(new Error("Failed to load Google Maps API"))
          );
          return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,marker`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error("Failed to load Google Maps API"));
        document.head.appendChild(script);
      });
    };

    const initializeMap = async () => {
      try {
        await loadGoogleMapsAPI();

        if (!mapRef.current) return;

        // Initialize the map
        const map = new google.maps.Map(mapRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapId: mapId, // Required for Advanced Markers
          streetViewControl: false, // We'll handle Street View ourselves
          fullscreenControl: false,
          mapTypeControl: false,
          zoomControl: true,
          scaleControl: true,
        });

        // Initialize Street View panorama
        const streetView = new google.maps.StreetViewPanorama(
          streetViewRef.current!,
          {
            position: initialCenter,
            pov: {
              heading: 34,
              pitch: 10,
            },
            visible: false,
            enableCloseButton: false,
            addressControl: false,
            fullscreenControl: false,
            motionTracking: false,
            motionTrackingControl: false,
            panControl: false,
            zoomControl: false,
          }
        );

        // Link map and street view
        map.setStreetView(streetView);

        // Add click listener to map
        map.addListener("click", (event: google.maps.MapMouseEvent) => {
          const position = event.latLng;
          if (!position) return;

          // Remove existing marker
          if (mapState.marker) {
            mapState.marker.map = null;
          }

          // Create new marker using AdvancedMarkerElement
          const marker = new google.maps.marker.AdvancedMarkerElement({
            position: position,
            map: map,
            title: "Selected Location",
          });

          // Switch to Street View
          streetView.setPosition(position);
          streetView.setVisible(true);

          // Set loading state
          setMapState((prev) => ({ ...prev, isLoadingStreetView: true }));

          // Check if Street View is available at this location
          const streetViewService = new google.maps.StreetViewService();
          streetViewService.getPanorama(
            {
              location: position,
              radius: 50,
            },
            (data, status) => {
              if (status === google.maps.StreetViewStatus.OK) {
                // Street View is available
                if (mapRef.current && streetViewRef.current) {
                  mapRef.current.style.display = "none";
                  streetViewRef.current.style.display = "block";

                  // Add error handling for Street View loading
                  const checkStreetViewLoaded = () => {
                    if (
                      streetViewRef.current &&
                      streetViewRef.current.children.length === 0
                    ) {
                      // Street View failed to load, show error
                      setTimeout(() => {
                        if (
                          streetViewRef.current &&
                          streetViewRef.current.children.length === 0
                        ) {
                          alert(
                            "Street View failed to load. This may be due to rate limiting or the location not having Street View coverage."
                          );
                          // Return to map view
                          if (mapRef.current && streetViewRef.current) {
                            mapRef.current.style.display = "block";
                            streetViewRef.current.style.display = "none";
                          }
                          if (backButtonRef.current) {
                            backButtonRef.current.style.display = "none";
                          }
                          setMapState((prev) => ({
                            ...prev,
                            isLoadingStreetView: false,
                            isStreetViewActive: false,
                          }));
                        }
                      }, 3000); // Wait 3 seconds for Street View to load
                    } else {
                      // Street View loaded successfully
                      setMapState((prev) => ({
                        ...prev,
                        isLoadingStreetView: false,
                      }));
                    }
                  };

                  setTimeout(checkStreetViewLoaded, 1000);
                }
              } else {
                // Street View not available, show alert
                alert(
                  "Street View is not available at this location. Please try a different location."
                );
                setMapState((prev) => ({
                  ...prev,
                  isLoadingStreetView: false,
                }));
                return;
              }
            }
          );

          // Show back button
          if (backButtonRef.current) {
            backButtonRef.current.style.display = "block";
          }

          setMapState((prev) => ({
            ...prev,
            marker,
            isStreetViewActive: true,
          }));
        });

        setMapState((prev) => ({
          ...prev,
          map,
          streetView,
        }));
      } catch (error) {
        console.error("Error initializing Google Maps:", error);
      }
    };

    initializeMap();
  }, [apiKey, initialCenter, initialZoom]);

  const handleBackToMap = () => {
    if (mapState.map && mapState.streetView) {
      // Hide Street View and show map
      mapState.streetView.setVisible(false);

      // Show the map and hide street view
      if (mapRef.current && streetViewRef.current) {
        mapRef.current.style.display = "block";
        streetViewRef.current.style.display = "none";
        // Trigger a resize event to ensure the map renders properly
        setTimeout(() => {
          if (mapState.map) {
            google.maps.event.trigger(mapState.map, "resize");
          }
        }, 50);
      }

      // Hide back button
      if (backButtonRef.current) {
        backButtonRef.current.style.display = "none";
      }

      setMapState((prev) => ({
        ...prev,
        isStreetViewActive: false,
      }));
    }
  };

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "400px",
        ...style,
      }}
    >
      <div
        ref={mapRef}
        id="map"
        style={{
          width: "100%",
          height: "100%",
        }}
      />

      <div
        ref={streetViewRef}
        id="street-view"
        style={{
          width: "100%",
          height: "100%",
          display: "none",
        }}
      />

      <button
        ref={backButtonRef}
        id="back-btn"
        onClick={handleBackToMap}
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1000,
          display: "none",
          padding: "8px 16px",
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "500",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          transition: "background-color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f5f5f5";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#fff";
        }}
      >
        ← Back to Map
      </button>

      {mapState.isLoadingStreetView && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1001,
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "12px 20px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Loading Street View...
        </div>
      )}
    </div>
  );
};

export default GoogleMap;
