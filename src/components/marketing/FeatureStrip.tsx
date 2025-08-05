"use client";

import {
  AutoAwesome as AutoAwesomeIcon,
  Map as MapIcon,
  PhotoCamera as PhotoCameraIcon,
} from "@mui/icons-material";
import { Box, Grid, Typography } from "@mui/material";

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
        backgroundColor: "#111",
        color: "#fff",
      }}
    >
      <Grid container spacing={4} justifyContent="center">
        {features.map((feature, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Box
              sx={{
                textAlign: "center",
                p: 3,
              }}
            >
              <feature.icon
                sx={{
                  fontSize: { xs: 48, md: 64 },
                  color: "primary.main",
                  mb: 2,
                }}
              />
              <Typography
                variant="h3"
                fontWeight={700}
                sx={{
                  fontSize: { xs: "2rem", md: "2.5rem" },
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
                }}
              >
                {feature.label}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.8,
                  maxWidth: 200,
                  mx: "auto",
                }}
              >
                {feature.description}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
