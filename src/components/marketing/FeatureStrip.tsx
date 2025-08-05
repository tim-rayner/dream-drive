"use client";

import {
  AutoAwesome as AutoAwesomeIcon,
  Map as MapIcon,
  PhotoCamera as PhotoCameraIcon,
} from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";

export default function FeatureStrip() {
  const features = [
    {
      icon: PhotoCameraIcon,
      stat: "Upload",
      label: "Your Car Photo",
      description: "Simply upload a photo of your car",
    },
    {
      icon: MapIcon,
      stat: "Choose",
      label: "Any Location",
      description: "Pick any place in the world",
    },
    {
      icon: AutoAwesomeIcon,
      stat: "Generate",
      label: "AI Scene",
      description: "Watch AI create cinematic scenes",
    },
  ];

  return (
    <Box
      sx={{
        py: 8,
        px: 4,
        position: "relative",
        zIndex: 2,
        color: "#fff",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: { xs: 4, lg: 8 },
          maxWidth: 1200,
          mx: "auto",
          alignItems: "center",
        }}
      >
        {/* Features Section - Left side on desktop, top on mobile */}
        <Box
          sx={{
            flex: { xs: "none", lg: "1" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Typography
            variant="h3"
            fontWeight={700}
            sx={{
              fontSize: { xs: "2.5rem", md: "3rem" },
              mb: 5,
              textAlign: { xs: "center", lg: "left" },
              background: "linear-gradient(135deg, #ffffff 0%, #E0E7FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            How It Works
          </Typography>

          <Stack justifyContent="space-between" sx={{ gap: 3 }}>
            {features.map((feature, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", lg: "row" },
                  alignItems: { xs: "center", lg: "flex-start" },
                  mb: 5,
                  textAlign: { xs: "center", lg: "left" },
                }}
              >
                <Box
                  sx={{
                    mr: { xs: 0, lg: 4 },
                    mb: { xs: 2, lg: 0 },
                    display: "flex",
                    justifyContent: { xs: "center", lg: "flex-start" },
                    minWidth: 60,
                    mt: { xs: 0, lg: 0.5 },
                  }}
                >
                  <feature.icon
                    sx={{
                      fontSize: 48,
                      color: "#8B5CF6",
                      filter: "drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))",
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{
                      fontSize: "1.75rem",
                      mb: 1,
                      background:
                        "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {feature.stat}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: "#E0E7FF",
                    }}
                  >
                    {feature.label}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      opacity: 0.8,
                      textAlign: { xs: "center", lg: "left" },
                      fontSize: { xs: "1rem", lg: "1.25rem" },
                      lineHeight: { xs: "1.5", lg: "1.75" },
                      maxWidth: { xs: "100%", lg: 400 },
                      color: "#C7D2FE",
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        <Box
          sx={{
            flex: { xs: "none", lg: "1" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              maxWidth: { xs: 400, md: 600 },
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
              aspectRatio: "16/9",
              border: "1px solid rgba(139, 92, 246, 0.3)",
            }}
          >
            <iframe
              src="https://www.youtube.com/embed/UqdnzPw1zhU?rel=0&modestbranding=1"
              title="Dream Drive Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
