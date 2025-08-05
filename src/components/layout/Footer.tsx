"use client";

import {
  Box,
  Container,
  Divider,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  return (
    <Box
      component="footer"
      role="contentinfo"
      aria-label="Site footer"
      sx={{
        background: "rgba(15, 15, 35, 0.95)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        py: { xs: 3, sm: 4 },
        position: "relative",
        zIndex: 2,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          gap={3}
          alignItems={{ xs: "center", sm: "flex-start" }}
          textAlign={{ xs: "center", sm: "left" }}
        >
          {/* Brand */}
          <Box>
            <Typography
              variant="h6"
              component="h2"
              sx={{
                background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 700,
                fontSize: { xs: "1.125rem", sm: "1.25rem" },
              }}
            >
              DriveDream
            </Typography>
          </Box>
          {/* Links */}
          <nav aria-label="Footer navigation">
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 2, sm: 4 }}
              alignItems={{ xs: "center", sm: "flex-start" }}
              component="ul"
              sx={{ listStyle: "none", p: 0, m: 0 }}
            >
              <Box component="li">
                <Link
                  component="button"
                  onClick={() => router.push("/privacy")}
                  aria-label="View privacy policy"
                  sx={{
                    color: "rgba(255, 255, 255, 0.9)",
                    textDecoration: "none",
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    fontWeight: 500,
                    "&:hover": {
                      color: "#8B5CF6",
                      textDecoration: "underline",
                    },
                    cursor: "pointer",
                    minHeight: "44px",
                    minWidth: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: { xs: "center", sm: "flex-start" },
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    "&:focus": {
                      outline: "2px solid #8B5CF6",
                      outlineOffset: "2px",
                    },
                  }}
                >
                  Privacy Policy
                </Link>
              </Box>
              <Box component="li">
                <Link
                  href="mailto:timr.codes@gmail.com"
                  aria-label="Contact support via email"
                  sx={{
                    color: "rgba(255, 255, 255, 0.9)",
                    textDecoration: "none",
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    fontWeight: 500,
                    "&:hover": {
                      color: "#8B5CF6",
                      textDecoration: "underline",
                    },
                    minHeight: "44px",
                    minWidth: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: { xs: "center", sm: "flex-start" },
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    "&:focus": {
                      outline: "2px solid #8B5CF6",
                      outlineOffset: "2px",
                    },
                  }}
                >
                  Support
                </Link>
              </Box>
              <Box component="li">
                <Link
                  href="mailto:privacy@drivedream.ai"
                  aria-label="Contact privacy team via email"
                  sx={{
                    color: "rgba(255, 255, 255, 0.9)",
                    textDecoration: "none",
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    fontWeight: 500,
                    "&:hover": {
                      color: "#8B5CF6",
                      textDecoration: "underline",
                    },
                    minHeight: "44px",
                    minWidth: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: { xs: "center", sm: "flex-start" },
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    "&:focus": {
                      outline: "2px solid #8B5CF6",
                      outlineOffset: "2px",
                    },
                  }}
                >
                  Contact
                </Link>
              </Box>
            </Stack>
          </nav>

          <Divider
            sx={{
              width: "100%",
              borderColor: "rgba(255, 255, 255, 0.2)",
            }}
          />

          {/* Copyright */}
          <Typography
            variant="body2"
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              textAlign: { xs: "center", sm: "left" },
              color: "rgba(255, 255, 255, 0.7)",
            }}
          >
            © 2024 DriveDream. All rights reserved.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
