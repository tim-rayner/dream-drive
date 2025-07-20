"use client";

import ThemeWrapper from "@/components/ThemeWrapper";
import { useAuth } from "@/context/AuthContext";
import { creditPacks } from "@/lib/constants/stripeCreditPacks";
import { Add as AddIcon } from "@mui/icons-material";
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
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

// Stripe credit packs (dynamically generated from environment variables)
const CREDIT_PACKS = Object.entries(creditPacks).map(([priceId, pack]) => ({
  name: pack.name,
  credits: pack.credits,
  priceId,
  description: getDescription(pack.name),
  price: getPrice(pack.credits),
}));

function getDescription(name: string): string {
  switch (name) {
    case "Starter":
      return "Try it out";
    case "Explorer":
      return "Most popular";
    case "Cruiser":
      return "Great value";
    case "Scenic Pack":
      return "Bulk discount";
    case "Grand Tourer Pack":
      return "Best value";
    case "Dealership Pack":
      return "For teams";
    case "Pro Studio":
      return "Power user";
    case "Enterprise":
      return "Enterprise";
    default:
      return "";
  }
}

function getPrice(credits: number): string {
  switch (credits) {
    case 1:
      return "£0.99";
    case 10:
      return "£4.75";
    case 50:
      return "£9.00";
    case 100:
      return "£21.25";
    case 150:
      return "£40.00";
    case 500:
      return "£75.00";
    case 1000:
      return "£175.00";
    case 2500:
      return "£600.00";
    default:
      return "";
  }
}

// Component that uses useSearchParams
function BuyCreditsContent() {
  const searchParams = useSearchParams();
  const { user, session } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Show success message if redirected from Stripe
  const success = searchParams.get("success");

  const handleBuyCredits = async (priceId: string) => {
    if (!user || !session) {
      setSnackbar({
        open: true,
        message: "Please log in to purchase credits",
        severity: "error",
      });
      return;
    }

    setLoading(priceId);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setSnackbar({
          open: true,
          message: data.error || "Failed to start checkout",
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

          {/* Credit Packs Grid */}
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
            {CREDIT_PACKS.map((pack) => (
              <Card
                key={pack.priceId}
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
                onClick={() => handleBuyCredits(pack.priceId)}
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
                      {pack.credits}
                    </Typography>

                    <Typography
                      variant="h6"
                      color="text.primary"
                      fontWeight={600}
                    >
                      {pack.name}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {pack.description}
                    </Typography>

                    <Typography
                      variant="h5"
                      color="primary.main"
                      fontWeight={600}
                      sx={{ mt: 1 }}
                    >
                      {pack.price}
                    </Typography>

                    <Button
                      variant="contained"
                      color="primary"
                      disabled={loading === pack.priceId}
                      startIcon={
                        loading === pack.priceId ? (
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuyCredits(pack.priceId);
                      }}
                    >
                      {loading === pack.priceId ? "Redirecting..." : "Buy"}
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
                <Typography variant="h6" color="text.primary" fontWeight={600}>
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
                    • You can see your current credit balance in the navigation
                    bar
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Credits are spent automatically when you generate images
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Success Snackbar */}
          <Snackbar
            open={!!success || snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
              severity={success ? "success" : snackbar.severity}
              sx={{ width: "100%" }}
            >
              {success
                ? "Payment successful! Credits will appear in your account shortly."
                : snackbar.message}
            </Alert>
          </Snackbar>
        </Stack>
      </Container>
    </Box>
  );
}

// Loading fallback component
function BuyCreditsLoading() {
  return (
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
      <CircularProgress />
    </Box>
  );
}

export default function BuyCreditsPage() {
  return (
    <ThemeWrapper>
      <Suspense fallback={<BuyCreditsLoading />}>
        <BuyCreditsContent />
      </Suspense>
    </ThemeWrapper>
  );
}
