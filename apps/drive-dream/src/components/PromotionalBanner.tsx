"use client";

import { AutoAwesome as AutoAwesomeIcon } from "@mui/icons-material";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";

export default function PromotionalBanner() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const offerEndDate = new Date("2025-08-01T00:00:00Z");

    const calculateTimeLeft = () => {
      try {
        const now = new Date();
        const difference = offerEndDate.getTime() - now.getTime();

        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          });
          setIsExpired(false);
        } else {
          // Offer has expired
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          setIsExpired(true);
        }
      } catch (error) {
        console.error("Error calculating time left:", error);
        setIsExpired(true);
      }
    };

    calculateTimeLeft();

    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [mounted]);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  if (isExpired) {
    return null;
  }

  if (
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0
  ) {
    return null;
  }

  return (
    <Box sx={{ position: "relative", zIndex: 2, px: { xs: 2, sm: 3, md: 4 } }}>
      <Card
        sx={{
          background:
            "linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(99, 102, 241, 0.9) 100%)",
          color: "white",
          mb: { xs: 2, sm: 3, md: 4 },
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(139, 92, 246, 0.3)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(139, 92, 246, 0.3)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          },
        }}
      >
        <CardContent
          sx={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            py: { xs: 3, sm: 4 },
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Stack spacing={{ xs: 3, sm: 4 }} alignItems="center">
            <Stack spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <AutoAwesomeIcon
                  sx={{
                    fontSize: { xs: 20, sm: 24 },
                    color: "rgba(255,255,255,0.9)",
                    filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))",
                  }}
                />
                <Typography
                  variant="h6"
                  component="h2"
                  fontWeight={600}
                  sx={{
                    fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
                  }}
                >
                  Limited Time Offer
                </Typography>
              </Stack>

              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: 500,
                  fontSize: { xs: "0.9rem", sm: "1rem", md: "1.125rem" },
                }}
              >
                Get 5 Free Credits for New Users
              </Typography>
            </Stack>

            <Stack spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,0.8)",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
              >
                Offer ends in
              </Typography>

              <Stack direction="row" spacing={{ xs: 1, sm: 2, md: 3 }}>
                <Box sx={{ textAlign: "center", minWidth: { xs: 50, sm: 60 } }}>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{
                      color: "white",
                      fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                    }}
                  >
                    {timeLeft.days.toString().padStart(2, "0")}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      fontWeight: 500,
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    }}
                  >
                    Days
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: "rgba(255,255,255,0.5)",
                    fontWeight: "bold",
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                  }}
                >
                  :
                </Typography>
                <Box sx={{ textAlign: "center", minWidth: { xs: 50, sm: 60 } }}>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{
                      color: "white",
                      fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                    }}
                  >
                    {timeLeft.hours.toString().padStart(2, "0")}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      fontWeight: 500,
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    }}
                  >
                    Hours
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: "rgba(255,255,255,0.5)",
                    fontWeight: "bold",
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                  }}
                >
                  :
                </Typography>
                <Box sx={{ textAlign: "center", minWidth: { xs: 50, sm: 60 } }}>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{
                      color: "white",
                      fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                    }}
                  >
                    {timeLeft.minutes.toString().padStart(2, "0")}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      fontWeight: 500,
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    }}
                  >
                    Min
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: "rgba(255,255,255,0.5)",
                    fontWeight: "bold",
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                  }}
                >
                  :
                </Typography>
                <Box sx={{ textAlign: "center", minWidth: { xs: 50, sm: 60 } }}>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{
                      color: "white",
                      fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                    }}
                  >
                    {timeLeft.seconds.toString().padStart(2, "0")}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      fontWeight: 500,
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    }}
                  >
                    Sec
                  </Typography>
                </Box>
              </Stack>
            </Stack>

            <Stack
              spacing={{ xs: 2, sm: 3 }}
              alignItems="center"
              sx={{
                maxWidth: { xs: "100%", sm: 500 },
                width: "100%",
              }}
            >
              <Stack
                direction="row"
                spacing={{ xs: 1, sm: 2 }}
                flexWrap="wrap"
                justifyContent="center"
                sx={{ gap: { xs: 1, sm: 2 } }}
              >
                <Chip
                  label="5 Free Credits"
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.15)",
                    color: "white",
                    fontWeight: 500,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    border: "1px solid rgba(255,255,255,0.3)",
                    height: { xs: 28, sm: 32 },
                  }}
                />
                <Chip
                  label="No Credit Card Required"
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.15)",
                    color: "white",
                    fontWeight: 500,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    border: "1px solid rgba(255,255,255,0.3)",
                    height: { xs: 28, sm: 32 },
                  }}
                />
                <Chip
                  label="Instant Access"
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.15)",
                    color: "white",
                    fontWeight: 500,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    border: "1px solid rgba(255,255,255,0.3)",
                    height: { xs: 28, sm: 32 },
                  }}
                />
              </Stack>

              <Typography
                variant="body2"
                sx={{
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.9)",
                  textAlign: "center",
                  lineHeight: 1.6,
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  px: { xs: 1, sm: 0 },
                }}
              >
                Sign up before August 1st, 2025 and start creating stunning AI
                car scenes immediately. No purchase required &mdash; just sign
                up and begin creating.
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
