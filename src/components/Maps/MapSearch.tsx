import {
  Box,
  CircularProgress,
  Fade,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback, useState } from "react";

interface MapSearchProps {
  apiKey: string;
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface SearchPrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

const MapSearch: React.FC<MapSearchProps> = ({
  apiKey,
  onLocationSelect,
  className = "",
  style = {},
}) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchPrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lastSearchTime, setLastSearchTime] = useState(0);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

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
    [apiKey, lastSearchTime]
  );

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchPlaces(query);
  };

  // Handle search result selection
  const handleSearchSelect = async (prediction: SearchPrediction) => {
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
          const location = {
            lat: placeData.location.latitude,
            lng: placeData.location.longitude,
          };
          onLocationSelect(location);
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
              onLocationSelect({
                lat: location.lat(),
                lng: location.lng(),
              });
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
            onLocationSelect({
              lat: location.lat(),
              lng: location.lng(),
            });
          }
        }
      );
    }
  };

  return (
    <Box
      className={className}
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: "400px",
        ...style,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
        }}
      >
        <TextField
          fullWidth
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setShowAutocomplete(true)}
          onBlur={() => {
            // Delay hiding autocomplete to allow for clicks
            setTimeout(() => setShowAutocomplete(false), 200);
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              "& fieldset": {
                borderColor: "rgba(0, 0, 0, 0.12)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(0, 0, 0, 0.24)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "primary.main",
              },
            },
            "& .MuiInputBase-input": {
              minHeight: "44px",
              padding: "8px 12px",
            },
          }}
          InputProps={{
            endAdornment: isSearching ? <CircularProgress size={20} /> : null,
          }}
        />

        {/* Autocomplete dropdown */}
        <Fade in={showAutocomplete && searchResults.length > 0}>
          <Paper
            sx={{
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
            <List dense>
              {searchResults.map((prediction, index) => (
                <ListItem
                  key={prediction.place_id}
                  onClick={() => handleSearchSelect(prediction)}
                  sx={{
                    cursor: "pointer",
                    minHeight: "44px",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                    borderBottom:
                      index < searchResults.length - 1
                        ? "1px solid rgba(0, 0, 0, 0.06)"
                        : "none",
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={500}>
                        {prediction.structured_formatting?.main_text ||
                          prediction.description}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {prediction.structured_formatting?.secondary_text || ""}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Fade>
      </Box>
    </Box>
  );
};

export default MapSearch;
