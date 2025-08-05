"use client";

import LoginButton from "@/components/LoginButton";
import { Box, Typography } from "@mui/material";
import { useState } from "react";
import BackgroundCarousel, { SlideData } from "./BackgroundCarousel";

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState<SlideData>({
    id: 1,
    imageUrl:
      "https://images.pexels.com/photos/11026017/pexels-photo-11026017.jpeg",
    header: "Create Your Dream Drive",
    bodyText:
      "Upload your car photo, choose any location in the world, and watch AI place your car in that cinematic scene.",
    ctaText: "Sign in with Google",
  });

  const handleSlideChange = (slideData: SlideData) => {
    setCurrentSlide(slideData);
  };

  return (
    <Box
      sx={{
        position: "relative",
        height: { xs: "90vh", sm: "90vh", md: "75vh" },
        overflow: "hidden",
      }}
    >
      {/* Full-width Background Carousel */}
      <BackgroundCarousel onSlideChange={handleSlideChange} />

      {/* Left Text Panel with Blur Overlay - Only covers left side */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: { xs: "100%", sm: "100%", md: "45%" },
          height: "100%",
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(0, 0, 0, 0.55)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: { xs: 4, md: 8 },
          py: 4,
          zIndex: 2,
        }}
      >
        <Typography
          variant="h1"
          fontWeight={700}
          sx={{
            fontSize: { xs: "2.5rem", sm: "3rem", md: "3.5rem" },
            mb: 3,
            lineHeight: 1.2,
          }}
        >
          {currentSlide.header}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            mb: 4,
            opacity: 0.9,
            fontWeight: 400,
            lineHeight: 1.4,
          }}
        >
          {currentSlide.bodyText}
        </Typography>

        <Box
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <LoginButton />
        </Box>
      </Box>
    </Box>
  );
}
