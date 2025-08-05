"use client";

import ThemeWrapper from "@/components/ThemeWrapper";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { creditPacks } from "@/lib/constants/stripeCreditPacks";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

// Stripe credit packs (dynamically generated from server constants)
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

    try {
      setLoading(priceId);
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/buy?success=true`,
          cancelUrl: `${window.location.origin}/buy`,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setSnackbar({
        open: true,
        message: "Failed to create checkout session. Please try again.",
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
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ flex: 1, py: 4 }}>
        <Container maxWidth="lg">
          <Stack spacing={4}>
            {/* Header */}
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                  fontWeight: 700,
                  background:
                    "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 2,
                }}
              >
                Buy Credits
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  fontSize: { xs: "1rem", sm: "1.125rem" },
                  maxWidth: 600,
                  mx: "auto",
                }}
              >
                Purchase credits to generate AI car scenes. Each generation
                costs 1 credit.
              </Typography>
            </Box>

            {/* Credit Packs */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
                gap: 3,
                mt: 2,
                pt: 4, // Add top padding to accommodate the chip overflow
                position: "relative",
              }}
            >
              {CREDIT_PACKS.map((pack) => {
                const isMostPopular = pack.description === "Most popular";

                return (
                  <Card
                    key={pack.priceId}
                    sx={{
                      background: isMostPopular
                        ? "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)"
                        : "rgba(255, 255, 255, 0.03)",
                      backdropFilter: "blur(10px)",
                      border: isMostPopular
                        ? "2px solid rgba(139, 92, 246, 0.3)"
                        : "1px solid rgba(255, 255, 255, 0.1)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      transform: isMostPopular ? "scale(1.02)" : "scale(1)",
                      overflow: "visible",
                      "&:hover": {
                        transform: isMostPopular
                          ? "translateY(-6px) scale(1.02)"
                          : "translateY(-4px)",
                        borderColor: isMostPopular
                          ? "rgba(139, 92, 246, 0.5)"
                          : "rgba(139, 92, 246, 0.3)",
                        boxShadow: isMostPopular
                          ? "0 12px 40px rgba(139, 92, 246, 0.3)"
                          : "0 8px 32px rgba(139, 92, 246, 0.2)",
                      },
                    }}
                    onClick={() => handleBuyCredits(pack.priceId)}
                  >
                    {/* Popular Badge */}
                    {isMostPopular && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: -16,
                          left: "50%",
                          transform: "translateX(-50%)",
                          zIndex: 102,
                          pointerEvents: "none",
                          overflow: "visible",
                        }}
                      >
                        <Chip
                          label="MOST POPULAR"
                          size="small"
                          sx={{
                            background:
                              "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                            color: "white",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            px: 1,
                            boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
                            "& .MuiChip-label": {
                              px: 1,
                            },
                          }}
                        />
                      </Box>
                    )}

                    <CardContent>
                      <Stack spacing={2}>
                        <Box>
                          <Typography
                            variant="h5"
                            component="h2"
                            fontWeight={700}
                            color="text.primary"
                            sx={{ mb: 0.5 }}
                          >
                            {pack.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            {pack.description}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography
                            variant="h4"
                            component="div"
                            fontWeight={700}
                            sx={{
                              background:
                                "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                              backgroundClip: "text",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              mb: 0.5,
                            }}
                          >
                            {pack.price}
                          </Typography>
                          <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            {pack.credits} credit{pack.credits !== 1 ? "s" : ""}
                          </Typography>
                        </Box>

                        <Button
                          variant="contained"
                          size="large"
                          fullWidth
                          disabled={loading === pack.priceId}
                          sx={{
                            background: isMostPopular
                              ? "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)"
                              : "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                            color: "white",
                            fontWeight: 600,
                            py: 1.5,
                            position: "relative",
                            overflow: "hidden",
                            "&::before": isMostPopular
                              ? {
                                  content: '""',
                                  position: "absolute",
                                  top: 0,
                                  left: "-100%",
                                  width: "100%",
                                  height: "100%",
                                  background:
                                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                                  animation: "shimmer 2s infinite",
                                }
                              : {},
                            "&:hover": {
                              background: isMostPopular
                                ? "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)"
                                : "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
                              transform: isMostPopular
                                ? "translateY(-3px)"
                                : "translateY(-2px)",
                              boxShadow: isMostPopular
                                ? "0 10px 30px rgba(139, 92, 246, 0.4)"
                                : "0 8px 25px rgba(139, 92, 246, 0.3)",
                            },
                            "&:disabled": {
                              opacity: 0.7,
                            },
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
                );
              })}
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
      <Footer />
    </Box>
  );
}

// Loading fallback component
function BuyCreditsLoading() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
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
