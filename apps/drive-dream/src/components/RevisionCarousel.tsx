"use client";

import { Download as DownloadIcon } from "@mui/icons-material";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import { type Generation } from "../lib/supabase";
import { downloadGenerationImage } from "../lib/utils/downloadImage";
import GeneratedImage from "./GeneratedImage";
import ImageCarousel from "./ImageCarousel";

interface RevisionCarouselProps {
  originalGeneration: Generation;
  revisedGeneration: Generation;
  size?: number;
  onImageChange?: (imageUrl: string) => void;
}

export default function RevisionCarousel({
  originalGeneration,
  revisedGeneration,
  size = 500,
  onImageChange,
}: RevisionCarouselProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const hasRevision = Boolean(revisedGeneration?.final_image_url);
  const originalImageUrl = originalGeneration.final_image_url;
  const revisedImageUrl = revisedGeneration?.final_image_url;

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
      await downloadGenerationImage(originalImageUrl, originalGeneration);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  }, [originalImageUrl, originalGeneration]);

  if (!hasRevision || !originalImageUrl || !revisedImageUrl) {
    // Fallback to single image display with download overlay
    return (
      <Stack
        direction="column"
        spacing={2}
        sx={{ width: "100%", px: { xs: 2, sm: 0 } }}
        justifyContent="center"
        alignItems="center"
        display="flex"
        flexDirection="column"
      >
        <Typography
          variant="h5"
          fontWeight={600}
          sx={{
            mb: 3,
            textAlign: "start",
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
          }}
        >
          Your Generated Scene
        </Typography>
        <Box
          sx={{
            position: "relative",
            width: { xs: "100%", sm: size },
            height: { xs: "auto", sm: size },
            maxWidth: { xs: "calc(100vw - 32px)", sm: size },
            maxHeight: { xs: "calc(100vw - 32px)", sm: size },
            mx: "auto",
            borderRadius: "12px",
            overflow: "hidden",
            border: "2px solid",
            borderColor: "success.main",
            boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
            aspectRatio: "1 / 1",
          }}
        >
          <GeneratedImage
            imageUrl={originalImageUrl}
            borderColor="success"
            size={size}
          />

          {/* Download Overlay */}
          <Box
            sx={{
              position: "absolute",
              bottom: { xs: 8, sm: 16 },
              right: { xs: 8, sm: 16 },
              zIndex: 10,
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
        </Box>
      </Stack>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <Stack
        direction="column"
        spacing={3}
        sx={{
          width: "100%",
          px: { xs: 2, sm: 0 },
          alignItems: "center",
          justifyContent: "center",
          justifyItems: "center",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", sm: size },
            height: { xs: "auto", sm: size },
            maxWidth: { xs: "calc(100vw - 32px)", sm: size },
            maxHeight: { xs: "calc(100vw - 32px)", sm: size },
            mx: "auto",
            borderRadius: "12px",
            overflow: "hidden",
            border: "2px solid",
            borderColor: "success.main",
            boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
            aspectRatio: "1 / 1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            m: 0,
            p: 0,
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              m: 0,
              p: 0,
            }}
          >
            <ImageCarousel
              originalImageUrl={originalImageUrl}
              revisedImageUrl={revisedImageUrl}
              originalTitle={`Original - ${originalGeneration.time_of_day} in ${originalGeneration.place_description}`}
              revisedTitle={`Revised - ${revisedGeneration.time_of_day} in ${revisedGeneration.place_description}`}
              originalGeneration={originalGeneration}
              revisedGeneration={revisedGeneration}
              onImageChange={onImageChange}
            />
          </Box>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: { xs: "0.875rem", sm: "1rem" },
            lineHeight: 1.5,
          }}
        >
          Compare your original and revised generations. The revised version is
          shown first.
        </Typography>
      </Stack>
    </motion.div>
  );
}
