"use client";

import LoginButton from "@/components/LoginButton";
import StepsOverview from "@/components/Steps/StepsOverview";
import ThemeWrapper from "@/components/ThemeWrapper";
import { useAuth } from "@/context/AuthContext";
import {
  AutoAwesome as AutoAwesomeIcon,
  AutoAwesome as AutoAwesomeIcon2,
  Map as MapIcon,
  PhotoCamera as PhotoCameraIcon,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

export default function ClientHome() {
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
          background:
            "linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #1E1E3F 100%)",
          py: 4,
        }}
      >
        <Stack spacing={3} alignItems="center" sx={{ mb: 6 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography
              variant="h1"
              component="h1"
              gutterBottom
              align="center"
              sx={{
                background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 700,
              }}
            >
              Dream Drive AI Studio
            </Typography>
            <AutoAwesomeIcon
              sx={{
                fontSize: 48,
                color: "primary.main",
                filter: "drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))",
              }}
            />
          </Stack>

          <Typography
            variant="h5"
            color="text.secondary"
            align="center"
            sx={{ mb: 2 }}
          >
            Upload your car photo and place it anywhere in the world
          </Typography>

          <Divider sx={{ width: "100%", maxWidth: 800 }} />
        </Stack>

        <Container maxWidth="xl">
          {!user ? (
            // Show login call-to-action for unauthenticated users
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Stack spacing={4} alignItems="center" maxWidth={600} mx="auto">
                <Typography
                  variant="h4"
                  component="h2"
                  fontWeight={600}
                  color="text.primary"
                >
                  Ready to Create Your Dream Drive?
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 4 }}
                >
                  Sign in to start generating AI-powered car scenes. Upload your
                  car photo, choose any location in the world, and watch AI
                  place your car in that scene.
                </Typography>

                <LoginButton />

                {/* Feature preview cards */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                    gap: 3,
                    mt: 6,
                  }}
                >
                  <Card
                    sx={{
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      height: "100%",
                    }}
                  >
                    <CardContent sx={{ textAlign: "center", py: 3 }}>
                      <PhotoCameraIcon
                        sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
                      />
                      <Typography variant="h6" component="h3" gutterBottom>
                        Upload Your Car
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Upload a photo of your car and let AI work its magic
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card
                    sx={{
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      height: "100%",
                    }}
                  >
                    <CardContent sx={{ textAlign: "center", py: 3 }}>
                      <MapIcon
                        sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
                      />
                      <Typography variant="h6" component="h3" gutterBottom>
                        Choose Location
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pick any location in the world using our interactive map
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card
                    sx={{
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      height: "100%",
                    }}
                  >
                    <CardContent sx={{ textAlign: "center", py: 3 }}>
                      <AutoAwesomeIcon2
                        sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
                      />
                      <Typography variant="h6" component="h3" gutterBottom>
                        Generate AI Scene
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Watch as AI seamlessly places your car in the chosen
                        location
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Stack>
            </Box>
          ) : (
            // Show full image generation UI for authenticated users
            <StepsOverview />
          )}
        </Container>
      </Box>
    </ThemeWrapper>
  );
}
