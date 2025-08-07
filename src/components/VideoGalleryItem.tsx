"use client";

import { PlayArrow as PlayArrowIcon } from "@mui/icons-material";
import { Box } from "@mui/material";
import { type VideoGeneration } from "../lib/supabase";

interface VideoGalleryItemProps {
  videoGeneration: VideoGeneration;
}

export default function VideoGalleryItem({
  videoGeneration,
}: VideoGalleryItemProps) {
  return (
    <Box
      sx={{
        aspectRatio: "1 / 1",
        width: "100%",
        borderRadius: 2,
        overflow: "hidden",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        boxShadow: "0 2px 8px rgba(139,92,246,0.08)",
        cursor: "pointer",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(139,92,246,0.15)",
          transform: "translateY(-2px)",
          transition: "all 0.2s ease-in-out",
        },
      }}
    >
      {/* Video thumbnail - using the image_url as thumbnail */}
      <img
        src={videoGeneration.image_url}
        alt="Video preview"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />

      {/* Play button overlay */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(0,0,0,0.7)",
          borderRadius: "50%",
          width: 60,
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.8)",
            transform: "translate(-50%, -50%) scale(1.1)",
          },
        }}
      >
        <PlayArrowIcon sx={{ color: "white", fontSize: 32 }} />
      </Box>

      {/* Video indicator */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          backgroundColor: "rgba(0,0,0,0.7)",
          color: "white",
          px: 1,
          py: 0.5,
          borderRadius: "12px",
          fontSize: 10,
          fontWeight: 600,
        }}
      >
        VIDEO
      </Box>

      {/* Overlay info (date, etc.) */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          bgcolor: "rgba(0,0,0,0.45)",
          color: "white",
          px: 1,
          py: 0.5,
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>
          {videoGeneration.created_at
            ? new Date(videoGeneration.created_at).toLocaleDateString()
            : ""}
        </span>
        {/* Add more info if needed */}
      </Box>
    </Box>
  );
}
