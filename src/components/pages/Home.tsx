"use client";

import StepsOverview from "@/components/Steps/StepsOverview";
import ThemeWrapper from "@/components/ThemeWrapper";
import UnauthenticatedHome from "@/components/pages/UnauthenticatedHome";
import { useAuth } from "@/context/AuthContext";
import { AutoAwesome as AutoAwesomeIcon } from "@mui/icons-material";
import { Box, Container, Divider, Stack, Typography } from "@mui/material";

export default function Home() {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <ThemeWrapper>
        <Box
          sx={{
            minHeight: "100vh",
            background:
              "linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #1E1E3F 100%)",
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
          background: !user
            ? "transparent"
            : "linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #1E1E3F 100%)",
          py: !user ? 0 : { xs: 2, sm: 3, md: 4 },
          px: !user ? 0 : { xs: 1, sm: 2 },
        }}
      >
        {user && (
          <Stack
            spacing={{ xs: 2, sm: 1 }}
            alignItems="center"
            sx={{ mb: { xs: 3, sm: 4, md: 6 } }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                mx: "auto",
              }}
            >
              <Stack
                direction="row"
                spacing={{ xs: 1, sm: 2 }}
                alignItems="center"
                justifyContent="center"
                sx={{ width: "auto" }}
                padding={2}
              >
                <Typography
                  variant="h1"
                  component="h1"
                  gutterBottom
                  align="center"
                  sx={{
                    background:
                      "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: 700,
                    fontSize: {
                      xs: "1.5rem",
                      sm: "2.5rem",
                      md: "3rem",
                    },
                    lineHeight: 1.2,
                    wordBreak: "break-word",
                  }}
                >
                  DriveDream AI Studio
                </Typography>
                <AutoAwesomeIcon
                  sx={{
                    fontSize: { xs: 24, sm: 40, md: 48 },
                    color: "primary.main",
                    filter: "drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))",
                    flexShrink: 0,
                  }}
                />
              </Stack>
            </Box>

            <Typography
              variant="h5"
              color="text.secondary"
              align="center"
              sx={{
                mb: 2,
                fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
                px: { xs: 2, sm: 0 },
                lineHeight: 1.4,
              }}
            >
              Upload your car photo and place it anywhere in the world
            </Typography>

            <Divider sx={{ width: "100%", maxWidth: 800 }} />
          </Stack>
        )}

        {!user ? (
          // Show unauthenticated home page with full-width cinematic layout
          <UnauthenticatedHome />
        ) : (
          // Show full image generation UI for authenticated users
          <Container maxWidth="md" sx={{ px: { xs: 1, sm: 2 }, mx: "auto" }}>
            <StepsOverview />
          </Container>
        )}
      </Box>
    </ThemeWrapper>
  );
}
