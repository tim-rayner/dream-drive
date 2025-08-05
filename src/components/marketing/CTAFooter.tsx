"use client";

import LoginButton from "@/components/LoginButton";
import { Box, Typography } from "@mui/material";

export default function CTAFooter() {
  return (
    <Box
      sx={{
        py: 10,
        px: 4,
        textAlign: "center",
        background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
        color: "#fff",
      }}
    >
      <Typography
        variant="h3"
        fontWeight={700}
        sx={{
          mb: 2,
          fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
        }}
      >
        Start Your Cinematic AI Shoot
      </Typography>

      <Typography
        variant="h6"
        sx={{
          mb: 4,
          opacity: 0.9,
          maxWidth: 600,
          mx: "auto",
          fontWeight: 400,
        }}
      >
        Join thousands of car enthusiasts creating stunning AI-generated scenes.
        Upload your car and transform it into cinematic masterpieces.
      </Typography>

      <Box sx={{ mt: 4 }}>
        <LoginButton />
      </Box>

      <Typography
        variant="body2"
        sx={{
          mt: 4,
          opacity: 0.8,
        }}
      >
        Free to start • No credit card required • Instant access
      </Typography>
    </Box>
  );
}
