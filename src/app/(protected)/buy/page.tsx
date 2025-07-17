"use client";

import ThemeWrapper from "@/components/ThemeWrapper";
import { useCredits } from "@/context/CreditsContext";
import { addCredits } from "@/lib/creditsService";
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

const CREDIT_OPTIONS = [
  { amount: 1, price: "Free", description: "Try it out" },
  { amount: 10, price: "Free", description: "Most popular" },
  { amount: 50, price: "Free", description: "Great value" },
  { amount: 100, price: "Free", description: "Bulk discount" },
  { amount: 150, price: "Free", description: "Best value" },
  { amount: 1000, price: "Free", description: "Power user" },
];

export default function BuyCreditsPage() {
  const { refreshCredits } = useCredits();
  const [loading, setLoading] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleBuyCredits = async (amount: number) => {
    setLoading(amount);
    try {
      const result = await addCredits(amount);

      if (result.success) {
        // Refresh credits in the context to update the navbar
        await refreshCredits();

        setSnackbar({
          open: true,
          message: `Successfully added ${amount} credits! Total: ${result.totalCredits}`,
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: result.error || "Failed to add credits",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "An unexpected error occurred",
        severity: "error",
      });
    } finally {
      setLoading(null);
    }
  };

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
          <Stack spacing={4} alignItems="center">
            <Typography
              variant="h2"
              component="h1"
              align="center"
              sx={{
                background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 700,
                mb: 2,
              }}
            >
              Buy Credits
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              align="center"
              sx={{ mb: 4, maxWidth: 600 }}
            >
              Purchase credits to generate AI car scenes. Each image generation
              costs 1 credit.
            </Typography>

            {/* Credit Options Grid */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
                gap: 3,
                width: "100%",
                maxWidth: 900,
              }}
            >
              {CREDIT_OPTIONS.map((option) => (
                <Card
                  key={option.amount}
                  sx={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      borderColor: "primary.main",
                      boxShadow: "0 8px 32px rgba(139, 92, 246, 0.2)",
                    },
                  }}
                  onClick={() => handleBuyCredits(option.amount)}
                >
                  <CardContent sx={{ textAlign: "center", py: 4 }}>
                    <Stack spacing={2} alignItems="center">
                      <Typography
                        variant="h3"
                        component="div"
                        sx={{
                          background:
                            "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          fontWeight: 700,
                        }}
                      >
                        {option.amount}
                      </Typography>

                      <Typography
                        variant="h6"
                        color="text.primary"
                        fontWeight={600}
                      >
                        Credit{option.amount !== 1 ? "s" : ""}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {option.description}
                      </Typography>

                      <Typography
                        variant="h5"
                        color="primary.main"
                        fontWeight={600}
                        sx={{ mt: 1 }}
                      >
                        {option.price}
                      </Typography>

                      <Button
                        variant="contained"
                        color="primary"
                        disabled={loading === option.amount}
                        startIcon={
                          loading === option.amount ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <AddIcon />
                          )
                        }
                        sx={{
                          background:
                            "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
                          },
                          px: 3,
                          py: 1,
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          mt: 2,
                        }}
                      >
                        {loading === option.amount
                          ? "Adding..."
                          : "Add Credits"}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Info Section */}
            <Card
              sx={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                mt: 4,
                maxWidth: 600,
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Typography
                    variant="h6"
                    color="text.primary"
                    fontWeight={600}
                  >
                    How Credits Work
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      • Each AI image generation costs 1 credit
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Credits are tied to your account and never expire
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • You can see your current credit balance in the
                      navigation bar
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Credits are spent automatically when you generate images
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          icon={
            snackbar.severity === "success" ? <CheckCircleIcon /> : undefined
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeWrapper>
  );
}
