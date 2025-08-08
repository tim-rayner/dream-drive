import {
  Download as DownloadIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  VolumeOff as VolumeOffIcon,
  VolumeUp as VolumeUpIcon,
} from "@mui/icons-material";
import { Box, IconButton, Slider, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  onDownload?: () => void;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  width?: number | string;
  height?: number | string;
}

export default function VideoPlayer({
  videoUrl,
  title = "Generated Video",
  onDownload,
  autoPlay = false,
  loop = true,
  muted = false,
  controls = true,
  width = "100%",
  height = "auto",
}: VideoPlayerProps) {
  // Check if this is a Replicate URL that might have CORS issues
  const isReplicateUrl =
    videoUrl.includes("replicate.delivery") ||
    videoUrl.includes("replicate.com");

  // Create proxy URL for Replicate videos
  const proxyVideoUrl = isReplicateUrl
    ? `/api/video/proxy?url=${encodeURIComponent(videoUrl)}`
    : videoUrl;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setError("Failed to load video");
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [videoUrl]);

  // Debug: Log video URL when it changes
  useEffect(() => {
    console.log("🎬 VideoPlayer - Video URL:", videoUrl);

    // Set a timeout to detect if video is taking too long to load
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log("🎬 Video taking too long to load, showing fallback");
        setError(
          "Video is taking too long to load. Click 'Open Video' to view."
        );
        setIsLoading(false);
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timeout);
  }, [videoUrl, isLoading]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (event: Event, newValue: number | number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const seekTime = (newValue as number) * duration;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = newValue as number;
    setVolume(newVolume);
    video.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Box
      sx={{
        position: "relative",
        width,
        height,
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "black",
        "&:hover .video-controls": {
          opacity: 1,
        },
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            textAlign: "center",
          }}
        >
          <Typography variant="body2">
            {isReplicateUrl
              ? "Loading video through proxy..."
              : "Loading video..."}
          </Typography>
        </Box>
      )}

      {error && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            textAlign: "center",
            backgroundColor: "rgba(0,0,0,0.8)",
            padding: 2,
            borderRadius: "8px",
            maxWidth: "90%",
          }}
        >
          <Typography variant="body2" sx={{ mb: 1 }}>
            {error}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Videos are deleted from our servers after 24 hours.
          </Typography>
        </Box>
      )}

      <video
        ref={videoRef}
        src={proxyVideoUrl}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        controls={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
        onError={(e) => {
          setError(
            "Video failed to load. Please try again or contact support."
          );
          setIsLoading(false);
        }}
        crossOrigin="anonymous"
      />

      {/* Custom Controls */}
      {controls && !error && (
        <Box
          className="video-controls"
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
            padding: 2,
            opacity: showControls ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        >
          <Stack spacing={1}>
            {/* Progress Bar */}
            <Slider
              value={duration > 0 ? currentTime / duration : 0}
              onChange={handleSeek}
              sx={{
                color: "primary.main",
                "& .MuiSlider-thumb": {
                  width: 12,
                  height: 12,
                },
                "& .MuiSlider-track": {
                  height: 4,
                },
                "& .MuiSlider-rail": {
                  height: 4,
                },
              }}
            />

            {/* Controls Row */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  onClick={togglePlay}
                  sx={{ color: "white" }}
                  size="small"
                >
                  {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>

                <Typography
                  variant="caption"
                  sx={{ color: "white", minWidth: 80 }}
                >
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  onClick={toggleMute}
                  sx={{ color: "white" }}
                  size="small"
                >
                  {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </IconButton>

                <Slider
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  min={0}
                  max={1}
                  step={0.1}
                  sx={{
                    width: 80,
                    color: "white",
                    "& .MuiSlider-thumb": {
                      width: 8,
                      height: 8,
                    },
                    "& .MuiSlider-track": {
                      height: 2,
                    },
                    "& .MuiSlider-rail": {
                      height: 2,
                    },
                  }}
                />

                {onDownload && (
                  <IconButton
                    onClick={onDownload}
                    sx={{ color: "white" }}
                    size="small"
                  >
                    <DownloadIcon />
                  </IconButton>
                )}
              </Box>
            </Box>
          </Stack>
        </Box>
      )}

      {/* Title Overlay */}
      {title && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            px: 2,
            py: 1,
            borderRadius: "20px",
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            {title}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
