"use client";

import {
  AutoAwesome as AutoAwesomeIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useEffect, useRef, useState } from "react";
import GenerationResult from "../../../components/GenerationResult";
import ThemeWrapper from "../../../components/ThemeWrapper";
import Footer from "../../../components/layout/Footer";
import { useAuth } from "../../../context/AuthContext";
import { type Generation } from "../../../lib/supabase";

function GenerationGalleryItem({ generation }: { generation: Generation }) {
  const imageUrl = generation.final_image_url || generation.scene_image_url;
  const hasImage = Boolean(imageUrl);
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
        boxShadow: hasImage ? "0 2px 8px rgba(139,92,246,0.08)" : "none",
      }}
    >
      {hasImage ? (
        <img
          src={imageUrl}
          alt="Generation preview"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <Box sx={{ textAlign: "center", color: "text.secondary" }}>
          <ImageNotSupportedIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="caption" color="text.secondary">
            No image available
          </Typography>
        </Box>
      )}
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
          {generation.created_at
            ? new Date(generation.created_at).toLocaleDateString()
            : ""}
        </span>
        {/* Add more info if needed */}
      </Box>
    </Box>
  );
}

function GenerationModal({
  open,
  onClose,
  generation,
  onRevisionComplete,
}: {
  open: boolean;
  onClose: () => void;
  generation: Generation | null;
  onRevisionComplete: (newGeneration: Generation) => void;
}) {
  if (!generation) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: "center", fontWeight: 700 }}>
        Generation Details
      </DialogTitle>
      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <GenerationResult
          generation={generation}
          onRevisionComplete={onRevisionComplete}
          onScrollToTop={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}

export default function GenerationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [selectedGeneration, setSelectedGeneration] =
    useState<Generation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchGenerations = async (pageToFetch = 1, append = false) => {
    if (!user) return;
    try {
      if (pageToFetch === 1) setLoading(true);
      else setLoadingMore(true);
      setError(null);
      const response = await fetch(
        `/api/generations?page=${pageToFetch}&limit=10`
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to fetch generations");
      if (append) {
        setGenerations((prev) => [...prev, ...(result.generations || [])]);
      } else {
        setGenerations(result.generations || []);
      }
      setHasMore(result.generations && result.generations.length === 10);
      setPage(pageToFetch);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch generations"
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchGenerations(1, false);
    }
    // eslint-disable-next-line
  }, [authLoading, user]);

  const handleRevisionComplete = (newGeneration: Generation) => {
    // Add the new revision to the beginning of the list
    setGenerations((prev) => [newGeneration, ...prev]);
  };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <ThemeWrapper>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ flex: 1, py: 4 }}>
            <Container maxWidth="lg">
              <Stack
                spacing={4}
                alignItems="center"
                justifyContent="center"
                sx={{ minHeight: "50vh" }}
              >
                <CircularProgress />
                <Typography color="text.secondary">Loading...</Typography>
              </Stack>
            </Container>
          </Box>
        </Box>
      </ThemeWrapper>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <ThemeWrapper>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ flex: 1, py: 4 }}>
            <Container maxWidth="lg">
              <Stack
                spacing={4}
                alignItems="center"
                justifyContent="center"
                sx={{ minHeight: "50vh" }}
              >
                <Typography
                  variant="h4"
                  color="text.primary"
                  textAlign="center"
                >
                  Please log in to view your generations
                </Typography>
              </Stack>
            </Container>
          </Box>
        </Box>
      </ThemeWrapper>
    );
  }

  return (
    <ThemeWrapper>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ flex: 1, py: 4 }}>
          <Container maxWidth="lg">
            <Stack spacing={4}>
              {/* Top reference for scrolling */}
              <div ref={topRef} />

              {/* Header */}
              <Box sx={{ textAlign: "center" }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  spacing={2}
                  sx={{ mb: 2 }}
                >
                  <HistoryIcon sx={{ fontSize: 40, color: "primary.main" }} />
                  <Typography
                    variant="h3"
                    fontWeight={700}
                    color="text.primary"
                  >
                    Your Generations
                  </Typography>
                </Stack>
                <Typography variant="body1" color="text.secondary">
                  View and manage your AI-generated car scenes
                </Typography>
              </Box>

              {/* Content */}
              {loading ? (
                <Stack spacing={3} alignItems="center" sx={{ py: 8 }}>
                  <CircularProgress size={60} />
                  <Typography color="text.secondary">
                    Loading your generations...
                  </Typography>
                </Stack>
              ) : error ? (
                <Alert severity="error" sx={{ maxWidth: 600, mx: "auto" }}>
                  {error}
                </Alert>
              ) : generations.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <AutoAwesomeIcon
                    sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    No generations yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Start by creating your first AI car scene
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "repeat(2, 1fr)",
                        sm: "repeat(3, 1fr)",
                        md: "repeat(4, 1fr)",
                        lg: "repeat(5, 1fr)",
                      },
                      gap: { xs: 2, sm: 3 },
                      mt: 2,
                    }}
                  >
                    {generations.map((generation) => (
                      <Box
                        key={generation.id}
                        onClick={() => {
                          setSelectedGeneration(generation);
                          setModalOpen(true);
                        }}
                        sx={{ cursor: "pointer" }}
                      >
                        <GenerationGalleryItem generation={generation} />
                      </Box>
                    ))}
                  </Box>
                  {hasMore && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 4 }}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => fetchGenerations(page + 1, true)}
                        disabled={loadingMore}
                        sx={{ minWidth: 160, minHeight: 44, fontWeight: 600 }}
                      >
                        {loadingMore ? "Loading..." : "Load More"}
                      </Button>
                    </Box>
                  )}
                  <GenerationModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    generation={selectedGeneration}
                    onRevisionComplete={handleRevisionComplete}
                  />
                </>
              )}
            </Stack>
          </Container>
        </Box>
        <Footer />
      </Box>
    </ThemeWrapper>
  );
}
