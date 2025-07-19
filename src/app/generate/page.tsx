"use client";

import { Box, CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function GeneratePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && typeof window !== "undefined") {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If user is not authenticated, show loading while redirecting
  if (!user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // TODO: Replace with actual image generation UI
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" gutterBottom>
        Generate Cinematic Car Scene
      </Typography>
      <Typography variant="body1" color="text.secondary">
        (Image generation UI goes here)
      </Typography>
    </Box>
  );
}
