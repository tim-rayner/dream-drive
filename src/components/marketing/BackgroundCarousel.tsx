"use client";

import { ChevronRight } from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);

  const handleTransition = useCallback(() => {
    if (isTransitioning) return;

    const newNextIndex = (currentIndex + 1) % slides.length;
    setIsTransitioning(true);
    setNextIndex(newNextIndex);

    // Animate the transition
    const duration = 1500; // 1.5 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setTransitionProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Transition complete - update all states atomically
        setCurrentIndex(newNextIndex);
        setTransitionProgress(0);
        setIsTransitioning(false);
        onSlideChange?.(slides[newNextIndex]);
      }
    };

    requestAnimationFrame(animate);
  }, [currentIndex, isTransitioning, onSlideChange]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleTransition();
    }, 10000);

    return () => clearInterval(interval);
  }, [handleTransition]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        handleTransition();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  const handleDotClick = useCallback(
    (newIndex: number) => {
      if (newIndex === currentIndex || isTransitioning) return;

      setIsTransitioning(true);
      setNextIndex(newIndex);

      // Animate the transition
      const duration = 1500; // 1.5 seconds
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        setTransitionProgress(progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Transition complete - update all states atomically
          setCurrentIndex(newIndex);
          setTransitionProgress(0);
          setIsTransitioning(false);
          onSlideChange?.(slides[newIndex]);
        }
      };

      requestAnimationFrame(animate);
    },
    [currentIndex, isTransitioning, onSlideChange]
  );

  const handleNext = useCallback(() => {
    handleTransition();
  }, [handleTransition]);

  return (
    <Box
      sx={{ position: "relative", width: "100%", height: "100%" }}
      tabIndex={0}
      role="region"
      aria-label="Background image carousel"
    >
      {/* Current Background Image */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${slides[currentIndex].imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: isTransitioning ? 1 - transitionProgress : 1,
          zIndex: 1,
        }}
      />

      {/* Next Background Image (always rendered but only visible during transitions) */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${slides[nextIndex].imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: isTransitioning ? transitionProgress : 0,
          zIndex: 2,
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
            aria-selected={dotIndex === currentIndex}
            aria-label={`Go to slide ${dotIndex + 1}`}
            sx={{
              width: { xs: 8, md: 12 },
              height: { xs: 8, md: 12 },
              borderRadius: "50%",
              backgroundColor:
                dotIndex === currentIndex
                  ? "#8B5CF6"
                  : "rgba(255, 255, 255, 0.5)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor:
                  dotIndex === currentIndex
                    ? "#7C3AED"
                    : "rgba(255, 255, 255, 0.7)",
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
          disabled={isTransitioning}
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            color: "#fff",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
            "&:disabled": {
              opacity: 0.5,
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
