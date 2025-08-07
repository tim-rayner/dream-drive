"use client";

import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { downloadGenerationImage } from "../lib/utils/downloadImage";

interface ImageCarouselProps {
  originalImageUrl: string;
  revisedImageUrl: string;
  originalTitle?: string;
  revisedTitle?: string;
  originalGeneration?: { time_of_day?: string; place_description?: string };
  revisedGeneration?: { time_of_day?: string; place_description?: string };
  onClose?: () => void;
  onImageChange?: (imageUrl: string) => void;
}

export default function ImageCarousel({
  originalImageUrl,
  revisedImageUrl,
  originalTitle = "Original Generation",
  revisedTitle = "Revised Generation",
  originalGeneration,
  revisedGeneration,
  onClose,
  onImageChange,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(1); // Start with revised image (index 1)
  const [isDownloading, setIsDownloading] = useState(false);
  const images = useMemo(
    () => [
      {
        url: originalImageUrl,
        title: originalTitle,
        label: "Original",
        generation: originalGeneration,
      },
      {
        url: revisedImageUrl,
        title: revisedTitle,
        label: "Revised",
        generation: revisedGeneration,
      },
    ],
    [
      originalImageUrl,
      originalTitle,
      originalGeneration,
      revisedImageUrl,
      revisedTitle,
      revisedGeneration,
    ]
  );

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleDotClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleDownload = useCallback(async () => {
    const currentImage = images[currentIndex];
    setIsDownloading(true);

    try {
      await downloadGenerationImage(currentImage.url, currentImage.generation);
    } catch (error) {
      console.error("Download failed:", error);
      // You could add a toast notification here
    } finally {
      setIsDownloading(false);
    }
  }, [currentIndex, images]);

  const handlePanEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const swipeThreshold = 50;
      const { offset } = info;

      if (offset.x > swipeThreshold) {
        handlePrevious();
      } else if (offset.x < -swipeThreshold) {
        handleNext();
      }
    },
    [handleNext, handlePrevious]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        handlePrevious();
      } else if (event.key === "ArrowRight") {
        handleNext();
      } else if (event.key === "Escape") {
        onClose?.();
      }
    },
    [handleNext, handlePrevious, onClose]
  );

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyDownWrapper = (event: KeyboardEvent) => handleKeyDown(event);
    window.addEventListener("keydown", handleKeyDownWrapper);
    return () => window.removeEventListener("keydown", handleKeyDownWrapper);
  }, [handleKeyDown]);

  // Notify parent component when current image changes
  useEffect(() => {
    if (onImageChange && images[currentIndex]) {
      onImageChange(images[currentIndex].url);
    }
  }, [currentIndex, images, onImageChange]);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Image Container */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "background.paper",
          borderRadius: "12px",
          overflow: "hidden",
          aspectRatio: "1 / 1",
          m: 0,
          p: 0,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handlePanEnd}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "grab",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              margin: 0,
              padding: 0,
            }}
            whileDrag={{ cursor: "grabbing" }}
          >
            <Image
              src={images[currentIndex].url}
              alt={images[currentIndex].title}
              width={500}
              height={500}
              style={{
                objectFit: "cover",
                display: "block",
                borderRadius: "12px",
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                margin: 0,
                padding: 0,
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            transform: "translateY(-50%)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 1, sm: 2 },
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          <IconButton
            onClick={handlePrevious}
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.7)",
              },
              pointerEvents: "auto",
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              display: { xs: "none", sm: "flex" }, // Hide on mobile, show on desktop
            }}
            aria-label="Previous image"
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.7)",
              },
              pointerEvents: "auto",
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              display: { xs: "none", sm: "flex" }, // Hide on mobile, show on desktop
            }}
            aria-label="Next image"
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* Image Label */}
        <Box
          sx={{
            position: "absolute",
            top: { xs: 8, sm: 16 },
            left: { xs: 8, sm: 16 },
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            px: { xs: 1.5, sm: 2 },
            py: { xs: 0.5, sm: 1 },
            borderRadius: "20px",
            zIndex: 2,
          }}
        >
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
            {images[currentIndex].label}
          </Typography>
        </Box>

        {/* Download Button */}
        <Box
          sx={{
            position: "absolute",
            bottom: { xs: 8, sm: 16 },
            right: { xs: 8, sm: 16 },
            zIndex: 2,
          }}
        >
          <IconButton
            onClick={handleDownload}
            disabled={isDownloading}
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
              },
              "&:disabled": {
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "rgba(255, 255, 255, 0.5)",
              },
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
            }}
            aria-label="Download image"
          >
            <DownloadIcon />
          </IconButton>
        </Box>

        {/* Image Counter */}
        <Box
          sx={{
            position: "absolute",
            bottom: { xs: 8, sm: 16 },
            left: { xs: 8, sm: 16 },
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            px: { xs: 1.5, sm: 2 },
            py: { xs: 0.5, sm: 1 },
            borderRadius: "20px",
            zIndex: 2,
          }}
        >
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
            {currentIndex + 1} / {images.length}
          </Typography>
        </Box>

        {/* Mobile Swipe Instruction */}
        <Box
          sx={{
            position: "absolute",
            top: { xs: 8, sm: 16 },
            right: { xs: 8, sm: 16 },
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            px: { xs: 1.5, sm: 2 },
            py: { xs: 0.5, sm: 1 },
            borderRadius: "20px",
            zIndex: 2,
            display: { xs: "block", sm: "none" }, // Only show on mobile
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.75rem",
              opacity: 0.8,
            }}
          >
            Swipe to compare
          </Typography>
        </Box>
      </Box>

      {/* Dots Indicator */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
          mt: { xs: 2, sm: 3 },
          px: 2,
        }}
      >
        {images.map((_, index) => (
          <motion.div
            key={index}
            onClick={() => handleDotClick(index)}
            style={{
              width: index === currentIndex ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor:
                index === currentIndex ? "primary.main" : "rgba(0, 0, 0, 0.3)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </Box>
    </Box>
  );
}
