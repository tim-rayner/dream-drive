"use client";

import StepsOverview from "@/components/Steps/StepsOverview";
import ThemeWrapper from "@/components/ThemeWrapper";
import { AutoAwesome as AutoAwesomeIcon } from "@mui/icons-material";
import { Box, Container, Divider, Stack, Typography } from "@mui/material";

export default function Home() {
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
          <StepsOverview />
        </Container>
      </Box>
    </ThemeWrapper>
  );
}
