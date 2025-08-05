"use client";

import { Box, Typography } from "@mui/material";

export default function CTAFooter() {
  return (
    <Box
      sx={{
        py: 12,
        px: 4,
        textAlign: "center",
        position: "relative",
        zIndex: 2,
      }}
    >
      {/* CTA Section */}
      <Box
        sx={{
          maxWidth: 800,
          mx: "auto",
        }}
      >
        {/* Top Icon */}

        {/* Main Heading */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "2.5rem", sm: "3rem", md: "3.5rem" },
            fontWeight: 700,
            color: "#ffffff",
            mb: 2,
            lineHeight: 1.2,
          }}
        >
          Ready to Create Your Dream Drive?
        </Typography>

        {/* Subheading */}
        <Typography
          variant="h5"
          sx={{
            fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.4rem" },
            color: "#ffffff",
            opacity: 0.9,
            mb: 4,
            fontWeight: 400,
            lineHeight: 1.4,
            maxWidth: 600,
            mx: "auto",
          }}
        >
          Join thousands of car enthusiasts who are already creating stunning
          AI-generated scenes. Upload your car photo and place it anywhere in
          the world in seconds.
        </Typography>

        {/* CTA Button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box
            component="button"
            onClick={() => {
              // This will trigger the login flow
              const loginButton = document.querySelector(
                '[data-testid="login-button"]'
              ) as HTMLElement;
              if (loginButton) {
                loginButton.click();
              }
            }}
            sx={{
              background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              padding: "16px 32px",
              fontSize: "1.1rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 2,
              transition: "all 0.3s ease",
              boxShadow: "0 8px 32px rgba(139, 92, 246, 0.3)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px rgba(139, 92, 246, 0.4)",
              },
              "&:active": {
                transform: "translateY(0)",
              },
            }}
          >
            Start Creating Now
            <Box
              component="span"
              sx={{
                fontSize: "1.2rem",
                fontWeight: 700,
              }}
            >
              →
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
