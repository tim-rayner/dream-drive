"use client";

import {
  AutoAwesome as AutoAwesomeIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import GenerationResult from "../../../components/GenerationResult";
import ThemeWrapper from "../../../components/ThemeWrapper";
import { useAuth } from "../../../context/AuthContext";
import { type Generation } from "../../../lib/supabase";

export default function GenerationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const fetchGenerations = async () => {
    if (!user) return;

    console.log("🔍 Frontend: Fetching generations for user:", user.id);

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/generations`);
      console.log("📡 Frontend: API response status:", response.status);

      const result = await response.json();
      console.log("📊 Frontend: API result:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch generations");
      }

      console.log(
        "✅ Frontend: Setting generations:",
        result.generations?.length || 0
      );
      setGenerations(result.generations || []);
    } catch (error) {
      console.error("❌ Frontend: Error fetching generations:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch generations"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchGenerations();
    }
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
            background:
              "linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #1E1E3F 100%)",
            py: 4,
          }}
        >
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
            background:
              "linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #1E1E3F 100%)",
            py: 4,
          }}
        >
          <Container maxWidth="lg">
            <Stack
              spacing={4}
              alignItems="center"
              justifyContent="center"
              sx={{ minHeight: "50vh" }}
            >
              <Typography variant="h4" color="text.primary" textAlign="center">
                Please log in to view your generations
              </Typography>
            </Stack>
          </Container>
        </Box>
      </ThemeWrapper>
    );
  }

  return (
    <ThemeWrapper>
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #1E1E3F 100%)",
          py: 4,
        }}
      >
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
                <Typography variant="h3" fontWeight={700} color="text.primary">
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
              <Stack spacing={4}>
                {generations.map((generation) => (
                  <GenerationResult
                    key={generation.id}
                    generation={generation}
                    onRevisionComplete={handleRevisionComplete}
                    onScrollToTop={scrollToTop}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </Container>
      </Box>
    </ThemeWrapper>
  );
}
