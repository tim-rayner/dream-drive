"use client";

import StepsOverview from "@/components/Steps/StepsOverview";
import ThemeWrapper from "@/components/ThemeWrapper";
import Footer from "@/components/layout/Footer";
import UnauthenticatedHome from "@/components/pages/UnauthenticatedHome";
import { useAuth } from "@/context/AuthContext";
import { Box, Container, Typography } from "@mui/material";

export default function Home() {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <ThemeWrapper>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Loading...
          </Typography>
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
        {user && (
          <Box sx={{ flex: 1 }}>
            {/* Show full image generation UI for authenticated users */}
            <Container
              maxWidth="md"
              sx={{ px: { xs: 1, sm: 2 }, mx: "auto", pb: 4 }}
            >
              <StepsOverview />
            </Container>
          </Box>
        )}

        {!user ? (
          // Show unauthenticated home page with full-width cinematic layout
          <UnauthenticatedHome />
        ) : (
          // Footer for authenticated users
          <Footer />
        )}
      </Box>
    </ThemeWrapper>
  );
}
