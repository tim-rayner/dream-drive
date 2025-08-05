"use client";

import { ChevronRight } from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";
import { useEffect, useState } from "react";

export interface SlideData {
  id: number;
  imageUrl: string;
  header: string;
  bodyText: string;
  ctaText: string;
  ctaLink?: string;
}

const slides: SlideData[] = [
  {
    id: 1,
    imageUrl:
      "https://images.pexels.com/photos/11026017/pexels-photo-11026017.jpeg",
    header: "Your Car, Anywhere in the World",
    bodyText:
      "Upload a photo of your car and instantly place it in any location worldwide. Perfect for social media, marketing, or just dreaming big.",
    ctaText: "Start Creating Now",
  },
  {
    id: 2,
    imageUrl:
      "https://images.pexels.com/photos/11026047/pexels-photo-11026047.jpeg",
    header: "Professional Results in Seconds",
    bodyText:
      "No expensive photo shoots needed. Our AI creates stunning automotive photography that looks like it was shot by professionals.",
    ctaText: "Try It Free",
  },
  {
    id: 3,
    imageUrl:
      "https://images.pexels.com/photos/13144880/pexels-photo-13144880.jpeg",
    header: "Perfect for Car Enthusiasts & Businesses",
    bodyText:
      "Whether you're a car lover sharing your ride or a business showcasing vehicles, our AI delivers jaw-dropping results every time.",
    ctaText: "Join Thousands of Users",
  },
  {
    id: 4,
    imageUrl:
      "https://images.pexels.com/photos/29734293/pexels-photo-29734293.jpeg",
    header: "From Dream to Reality",
    bodyText:
      "See your car on the streets of Tokyo, mountain roads of Switzerland, or anywhere your imagination takes you. The possibilities are endless.",
    ctaText: "Create Your Dream Shot",
  },
  {
    id: 5,
    imageUrl:
      "https://images.pexels.com/photos/11921988/pexels-photo-11921988.jpeg",
    header: "Social Media Ready",
    bodyText:
      "Generate viral-worthy content that will make your followers stop scrolling. Stand out with unique automotive photography.",
    ctaText: "Get Started Today",
  },
];

interface BackgroundCarouselProps {
  onSlideChange?: (slideData: SlideData) => void;
}

export default function BackgroundCarousel({
  onSlideChange,
}: BackgroundCarouselProps) {
  const [index, setIndex] = useState(0);
  const [fadeState, setFadeState] = useState("in");

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState("out");
      setTimeout(() => {
        const newIndex = (index + 1) % slides.length;
        setIndex(newIndex);
        setFadeState("in");
        onSlideChange?.(slides[newIndex]);
      }, 750);
    }, 10000);

    return () => clearInterval(interval);
  }, [index, onSlideChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNext = () => {
    setFadeState("out");
    setTimeout(() => {
      const newIndex = (index + 1) % slides.length;
      setIndex(newIndex);
      setFadeState("in");
      onSlideChange?.(slides[newIndex]);
    }, 750);
  };

  const handleDotClick = (newIndex: number) => {
    if (newIndex === index) return;
    setFadeState("out");
    setTimeout(() => {
      setIndex(newIndex);
      setFadeState("in");
      onSlideChange?.(slides[newIndex]);
    }, 750);
  };

  return (
    <Box
      sx={{ position: "relative", width: "100%", height: "100%" }}
      tabIndex={0}
      role="region"
      aria-label="Background image carousel"
    >
      {/* Full-width Background Image */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${slides[index].imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: fadeState === "in" ? 1 : 0,
          transition: "opacity 1.5s ease-in-out",
          zIndex: 1,
        }}
      />

      {/* Navigation Dots - Positioned on left panel */}
      <Box
        sx={{
          position: "absolute",
          bottom: { xs: 20, md: 40 },
          left: { xs: 20, md: 40 },
          display: "flex",
          gap: 1,
          zIndex: 3,
        }}
        role="tablist"
        aria-label="Image navigation"
      >
        {slides.map((_, dotIndex) => (
          <Box
            key={dotIndex}
            onClick={() => handleDotClick(dotIndex)}
            role="tab"
            aria-selected={dotIndex === index}
            aria-label={`Go to slide ${dotIndex + 1}`}
            sx={{
              width: { xs: 8, md: 12 },
              height: { xs: 8, md: 12 },
              borderRadius: "50%",
              backgroundColor:
                dotIndex === index ? "#8B5CF6" : "rgba(255, 255, 255, 0.5)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor:
                  dotIndex === index ? "#7C3AED" : "rgba(255, 255, 255, 0.7)",
                transform: "scale(1.1)",
              },
            }}
          />
        ))}
      </Box>

      {/* Next Arrow - Positioned on right side (clear image area) */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: "auto", md: "50%" },
          bottom: { xs: 20, md: "auto" },
          right: { xs: 20, md: 40 },
          transform: { xs: "none", md: "translateY(-50%)" },
          zIndex: 3,
        }}
      >
        <IconButton
          onClick={handleNext}
          aria-label="Next image"
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            color: "#fff",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
            backdropFilter: "blur(10px)",
          }}
        >
          <ChevronRight />
        </IconButton>
      </Box>
    </Box>
  );
}

export { slides };
