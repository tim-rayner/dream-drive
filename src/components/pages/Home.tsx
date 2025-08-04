"use client";

import LoginButton from "@/components/LoginButton";
import PromotionalBanner from "@/components/PromotionalBanner";
import StepsOverview from "@/components/steps/StepsOverview";
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
          background:
            "linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #1E1E3F 100%)",
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 1, sm: 2 },
        }}
      >
        <Stack
          spacing={{ xs: 2, sm: 3 }}
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
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1, sm: 2 }}
              alignItems="center"
              justifyContent="center"
              sx={{ width: "auto" }}
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
                    xs: "2rem",
                    sm: "2.5rem",
                    md: "3rem",
                    lg: "3.5rem",
                  },
                  lineHeight: 1.2,
                  wordBreak: "break-word",
                }}
              >
                DriveDream AI Studio
              </Typography>
              <AutoAwesomeIcon
                sx={{
                  fontSize: { xs: 32, sm: 40, md: 48 },
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

        <Container maxWidth="md" sx={{ px: { xs: 1, sm: 2 }, mx: "auto" }}>
          {!user ? (
            // Show login call-to-action for unauthenticated users
            <Box
              sx={{
                textAlign: "center",
                py: { xs: 4, sm: 6, md: 8 },
                pt: 0,
                mx: "auto",
                maxWidth: 600,
              }}
            >
              <Stack
                spacing={{ xs: 3, sm: 4 }}
                alignItems="center"
                maxWidth={600}
                mx="auto"
                sx={{ width: "100%" }}
              >
                {/* Promotional Banner */}
                <PromotionalBanner />

                <Typography
                  variant="h4"
                  component="h2"
                  fontWeight={600}
                  color="text.primary"
                  sx={{
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                    px: { xs: 2, sm: 0 },
                    textAlign: "center",
                  }}
                >
                  Ready to Create Your DriveDream?
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    mb: 4,
                    px: { xs: 2, sm: 0 },
                    fontSize: { xs: "0.95rem", sm: "1rem" },
                    lineHeight: 1.6,
                    textAlign: "center",
                  }}
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
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(3, 1fr)",
                    },
                    gap: { xs: 2, sm: 3 },
                    mt: { xs: 4, sm: 6 },
                    width: "100%",
                    justifyItems: "center",
                  }}
                >
                  <Card
                    sx={{
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      height: "100%",
                      minHeight: { xs: 200, sm: 220 },
                    }}
                  >
                    <CardContent
                      sx={{
                        textAlign: "center",
                        py: { xs: 2, sm: 3 },
                        px: { xs: 2, sm: 3 },
                      }}
                    >
                      <PhotoCameraIcon
                        sx={{
                          fontSize: { xs: 36, sm: 40, md: 48 },
                          color: "primary.main",
                          mb: 2,
                        }}
                      />
                      <Typography
                        variant="h6"
                        component="h3"
                        gutterBottom
                        sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                      >
                        Upload Your Car
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                      >
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
                      minHeight: { xs: 200, sm: 220 },
                    }}
                  >
                    <CardContent
                      sx={{
                        textAlign: "center",
                        py: { xs: 2, sm: 3 },
                        px: { xs: 2, sm: 3 },
                      }}
                    >
                      <MapIcon
                        sx={{
                          fontSize: { xs: 36, sm: 40, md: 48 },
                          color: "primary.main",
                          mb: 2,
                        }}
                      />
                      <Typography
                        variant="h6"
                        component="h3"
                        gutterBottom
                        sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                      >
                        Choose Location
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                      >
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
                      minHeight: { xs: 200, sm: 220 },
                      gridColumn: { xs: "1", sm: "span 2", md: "span 1" },
                    }}
                  >
                    <CardContent
                      sx={{
                        textAlign: "center",
                        py: { xs: 2, sm: 3 },
                        px: { xs: 2, sm: 3 },
                      }}
                    >
                      <AutoAwesomeIcon2
                        sx={{
                          fontSize: { xs: 36, sm: 40, md: 48 },
                          color: "primary.main",
                          mb: 2,
                        }}
                      />
                      <Typography
                        variant="h6"
                        component="h3"
                        gutterBottom
                        sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                      >
                        Generate AI Scene
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                      >
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
