"use client";

import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { type VideoGeneration } from "../lib/supabase";
import VideoPlayer from "./VideoPlayer";

interface VideoModalProps {
  open: boolean;
  onClose: () => void;
  videoGeneration: VideoGeneration | null;
}

export default function VideoModal({
  open,
  onClose,
  videoGeneration,
}: VideoModalProps) {
  if (!videoGeneration) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontWeight: 700,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Video Generation
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <VideoPlayer
            videoUrl={videoGeneration.video_url}
            title="Dream Drive Video"
            onDownload={() => {
              const isReplicateUrl =
                videoGeneration.video_url.includes("replicate.delivery") ||
                videoGeneration.video_url.includes("replicate.com");
              const downloadUrl = isReplicateUrl
                ? `/api/video/proxy?url=${encodeURIComponent(
                    videoGeneration.video_url
                  )}`
                : videoGeneration.video_url;

              const link = document.createElement("a");
              link.href = downloadUrl;
              link.download = "dream-drive-video.mp4";
              link.click();
            }}
            width="100%"
            height={400}
          />

          {/* Video details */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Created:{" "}
              {new Date(videoGeneration.created_at).toLocaleDateString()}
            </Typography>
            {videoGeneration.prompt && (
              <Typography variant="body2" color="text.secondary">
                Prompt: {videoGeneration.prompt}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
