import React, { useCallback, useEffect, useRef, useState } from "react";

interface GoogleMapProps {
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

interface MapState {
  map: google.maps.Map | null;
  streetView: google.maps.StreetViewPanorama | null;
  marker: google.maps.marker.AdvancedMarkerElement | null;
  isStreetViewActive: boolean;
  isLoadingStreetView: boolean;
  currentPov: { heading: number; pitch: number } | null;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
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
  const mapRef = useRef<HTMLDivElement>(null);
  const streetViewRef = useRef<HTMLDivElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const chooseSceneButtonRef = useRef<HTMLButtonElement>(null);
  const [mapState, setMapState] = useState<MapState>({
    map: null,
    streetView: null,
    marker: null,
    isStreetViewActive: false,
    isLoadingStreetView: false,
    currentPov: null,
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lastSearchTime, setLastSearchTime] = useState(0);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

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
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,marker,places&v=beta`;
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

        // Check if Places API is available
        if (!google.maps.places) {
          console.warn(
            "Places API not loaded. Search functionality may not work."
          );
        }

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
            clickToGo: false,
            disableDefaultUI: true,
          }
        );

        // Add listener to track POV changes
        streetView.addListener("pov_changed", () => {
          const currentPov = streetView.getPov();
          console.log("🔄 Street View POV changed:", currentPov);
          // Store the current POV in state (only heading and pitch)
          setMapState((prev) => ({
            ...prev,
            currentPov: {
              heading: currentPov.heading,
              pitch: currentPov.pitch,
            },
          }));
        });

        // Add listener to track position changes
        streetView.addListener("position_changed", () => {
          const currentPosition = streetView.getPosition();
          const currentPov = streetView.getPov();
          console.log("📍 Street View position changed:", {
            position: currentPosition
              ? { lat: currentPosition.lat(), lng: currentPosition.lng() }
              : null,
            pov: currentPov,
          });
        });

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

          // Switch to Street View without resetting POV
          streetView.setPosition(position);
          streetView.setVisible(true);

          // Set loading state
          setMapState((prev) => ({ ...prev, isLoadingStreetView: true }));

          // Ensure Street View is properly initialized for the new location
          // but preserve any user-set POV
          setTimeout(() => {
            const currentPov = streetView.getPov();
            console.log(
              "🔄 Setting Street View position, current POV:",
              currentPov
            );
            streetView.setPosition(position);
            streetView.setVisible(true);
            // Don't reset POV - let user control it
          }, 50);

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

                  // Show choose scene button
                  if (chooseSceneButtonRef.current) {
                    chooseSceneButtonRef.current.style.display = "block";
                  }

                  // Force Street View to reload with new position but preserve POV
                  setTimeout(() => {
                    const currentPov = streetView.getPov();
                    console.log(
                      "🔄 Reloading Street View, preserving POV:",
                      currentPov
                    );
                    streetView.setPosition(position);
                    streetView.setVisible(true);
                    // Don't reset POV - preserve user's view
                  }, 100);

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
                          console.log(
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
                          if (chooseSceneButtonRef.current) {
                            chooseSceneButtonRef.current.style.display = "none";
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
                // Street View not available, log message
                console.log(
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

          // Call the parent callback with the new map data
          if (onMapDataUpdate) {
            const mapData = {
              position: { lat: position.lat(), lng: position.lng() },
              marker,
            };
            console.log("Sending location data to parent:", mapData);
            onMapDataUpdate(mapData);
          }
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

        // Don't reset Street View position here - let it maintain its current state
        // The position will be set properly when a new location is selected

        // Trigger a resize event to ensure the map renders properly
        setTimeout(() => {
          if (mapState.map) {
            google.maps.event.trigger(mapState.map, "resize");
          }
        }, 50);
      }

      // Hide back button and choose scene button
      if (backButtonRef.current) {
        backButtonRef.current.style.display = "none";
      }
      if (chooseSceneButtonRef.current) {
        chooseSceneButtonRef.current.style.display = "none";
      }

      // Remove the marker from the map
      if (mapState.marker) {
        mapState.marker.map = null;
        // Ensure the marker is completely removed from the map
        mapState.marker = null;
      }

      // Reset all state except map center and zoom
      setMapState((prev) => ({
        map: prev.map,
        streetView: prev.streetView,
        marker: null, // Remove marker
        isStreetViewActive: false,
        isLoadingStreetView: false,
        currentPov: prev.currentPov, // Preserve current POV
      }));
    }
  };

  const handleSceneCapture = async (): Promise<string> => {
    if (!mapState.streetView) {
      throw new Error("Street View not available");
    }

    try {
      // Get the Street View panorama data
      const panorama = mapState.streetView;
      const position = panorama.getPosition();
      const pov = panorama.getPov();

      if (!position) {
        throw new Error("Position not available");
      }

      // Use the stored POV from state instead of getting it from panorama
      console.log("📸 Getting current POV for capture...");
      const currentPov = mapState.currentPov || panorama.getPov();
      console.log("🎯 Final POV at capture moment:", currentPov);
      console.log(
        "💾 Using stored POV from state:",
        mapState.currentPov ? "Yes" : "No"
      );

      console.log("Capturing Street View scene:", {
        position: { lat: position.lat(), lng: position.lng() },
        pov: { heading: currentPov.heading, pitch: currentPov.pitch },
      });

      // Create a Street View Static API URL with current view orientation
      const staticImageUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${position.lat()},${position.lng()}&heading=${
        currentPov.heading
      }&pitch=${currentPov.pitch}&key=${apiKey}`;

      console.log("🌐 Street View Static API URL:", staticImageUrl);
      console.log("📊 POV parameters being sent:", {
        heading: currentPov.heading,
        pitch: currentPov.pitch,
        headingType: typeof currentPov.heading,
        pitchType: typeof currentPov.pitch,
      });

      // Convert the static image to base64
      const response = await fetch(staticImageUrl);
      const blob = await response.blob();

      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          console.log(
            "✅ Scene captured successfully with current orientation"
          );
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("❌ Error capturing scene:", error);
      throw error;
    }
  };

  const handleChooseScene = async () => {
    try {
      console.log("🎬 Starting scene capture process...");

      // Add a small delay to ensure Street View is fully loaded and user's view is applied
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("📸 Capturing scene image...");
      const sceneImage = await handleSceneCapture();
      console.log(
        "✅ Scene image captured successfully, length:",
        sceneImage.length
      );

      // Call the parent callback with the captured scene
      if (onSceneCapture) {
        console.log("📞 Calling onSceneCapture callback...");
        onSceneCapture(sceneImage);
        console.log("✅ onSceneCapture callback completed");
      } else {
        console.warn("⚠️ onSceneCapture callback is not provided");
      }
    } catch (error) {
      console.error("❌ Failed to capture scene:", error);
      alert("Failed to capture scene. Please try again.");
    }
  };

  // Rate-limited search function
  const searchPlaces = useCallback(
    async (query: string) => {
      const now = Date.now();
      const timeSinceLastSearch = now - lastSearchTime;

      // Rate limit: minimum 500ms between searches
      if (timeSinceLastSearch < 500) {
        return;
      }

      if (query.length < 3) {
        setSearchResults([]);
        setShowAutocomplete(false);
        return;
      }

      setIsSearching(true);
      setLastSearchTime(now);

      try {
        // Use the new Places API with proper authentication
        const searchUrl = `https://places.googleapis.com/v1/places:searchText`;
        const requestBody = {
          textQuery: query,
          maxResultCount: 5,
        };

        const response = await fetch(`${searchUrl}?key=${apiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-FieldMask":
              "places.displayName,places.id,places.location,places.formattedAddress",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setIsSearching(false);

        if (data.places && data.places.length > 0) {
          // Convert to the format expected by our component
          const predictions = data.places.map(
            (place: {
              id: string;
              displayName?: { text: string };
              formattedAddress?: string;
            }) => ({
              place_id: place.id,
              description:
                place.displayName?.text || place.formattedAddress || "",
              structured_formatting: {
                main_text:
                  place.displayName?.text || place.formattedAddress || "",
                secondary_text: place.formattedAddress || "",
              },
            })
          );

          setSearchResults(predictions);
          setShowAutocomplete(true);
        } else {
          setSearchResults([]);
          setShowAutocomplete(false);
        }
      } catch (error) {
        console.error("Search error:", error);
        setIsSearching(false);
        setSearchResults([]);
        setShowAutocomplete(false);
      }
    },
    [lastSearchTime]
  );

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchPlaces(query);
  };

  // Handle search result selection
  const handleSearchSelect = async (prediction: {
    place_id: string;
    description: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
    };
  }) => {
    setSearchQuery(prediction.description);
    setShowAutocomplete(false);
    setSearchResults([]);

    try {
      // Use the new Places API to get place details
      const detailsUrl = `https://places.googleapis.com/v1/places/${prediction.place_id}`;
      const response = await fetch(`${detailsUrl}?key=${apiKey}`, {
        method: "GET",
        headers: {
          "X-Goog-FieldMask": "location,formattedAddress",
        },
      });

      if (response.ok) {
        const placeData = await response.json();
        if (
          placeData.location &&
          placeData.location.latitude &&
          placeData.location.longitude
        ) {
          const location = new google.maps.LatLng(
            placeData.location.latitude,
            placeData.location.longitude
          );
          if (mapState.map) {
            mapState.map.setCenter(location);
            mapState.map.setZoom(15);
          }
        }
      } else {
        // Fallback to geocoder if Places API fails
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode(
          { placeId: prediction.place_id },
          (results, geocodeStatus) => {
            if (
              geocodeStatus === google.maps.GeocoderStatus.OK &&
              results &&
              results[0]
            ) {
              const location = results[0].geometry.location;
              if (mapState.map) {
                mapState.map.setCenter(location);
                mapState.map.setZoom(15);
              }
            }
          }
        );
      }
    } catch (error) {
      console.error("Error getting place details:", error);
      // Fallback to geocoder
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { placeId: prediction.place_id },
        (results, geocodeStatus) => {
          if (
            geocodeStatus === google.maps.GeocoderStatus.OK &&
            results &&
            results[0]
          ) {
            const location = results[0].geometry.location;
            if (mapState.map) {
              mapState.map.setCenter(location);
              mapState.map.setZoom(15);
            }
          }
        }
      );
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
      <style>
        {`
          @keyframes spin {
            0% { transform: translateY(-50%) rotate(0deg); }
            100% { transform: translateY(-50%) rotate(360deg); }
          }
        `}
      </style>
      {/* Search Bar */}
      {showSearchBar && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            right: "10px",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "400px",
            }}
          >
            <input
              type="text"
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowAutocomplete(true)}
              style={{
                width: "100%",
                padding: "12px 16px",
                paddingRight: isSearching ? "40px" : "16px",
                border: "1px solid rgba(0, 0, 0, 0.12)",
                borderRadius: "8px",
                fontSize: "14px",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(8px)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                outline: "none",
                transition: "all 0.2s ease",
              }}
              onBlur={() => {
                // Delay hiding autocomplete to allow for clicks
                setTimeout(() => setShowAutocomplete(false), 200);
              }}
            />

            {/* Loading indicator */}
            {isSearching && (
              <div
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "16px",
                  height: "16px",
                  border: "2px solid #f3f3f3",
                  borderTop: "2px solid #3498db",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            )}

            {/* Autocomplete dropdown */}
            {showAutocomplete && searchResults.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                  borderRadius: "8px",
                  marginTop: "4px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  zIndex: 1001,
                }}
              >
                {searchResults.map((prediction, index) => (
                  <div
                    key={prediction.place_id}
                    onClick={() => handleSearchSelect(prediction)}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      borderBottom:
                        index < searchResults.length - 1
                          ? "1px solid rgba(0, 0, 0, 0.06)"
                          : "none",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(0, 0, 0, 0.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#333",
                        marginBottom: "2px",
                      }}
                    >
                      {prediction.structured_formatting?.main_text ||
                        prediction.description}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
                      {prediction.structured_formatting?.secondary_text || ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
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
          padding: "10px 16px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          border: "1px solid rgba(0, 0, 0, 0.12)",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "500",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          transition: "all 0.2s ease",
          backdropFilter: "blur(8px)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 1)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
        }}
      >
        ← Back to Map
      </button>

      <button
        ref={chooseSceneButtonRef}
        id="choose-scene-btn"
        onClick={handleChooseScene}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          display: "none",
          padding: "10px 16px",
          backgroundColor: "rgba(76, 175, 80, 0.95)",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "600",
          boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
          transition: "all 0.2s ease",
          backdropFilter: "blur(8px)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(76, 175, 80, 1)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(76, 175, 80, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(76, 175, 80, 0.95)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(76, 175, 80, 0.3)";
        }}
      >
        📸 Choose Scene
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
