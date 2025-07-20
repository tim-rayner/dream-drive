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

  const offerEndDate = new Date("2025-08-01T00:00:00Z");

  useEffect(() => {
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

    // Calculate immediately
    calculateTimeLeft();

    // Set up interval for countdown
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  // Don't show banner if offer has expired
  if (isExpired) {
    return null;
  }

  // Additional safety check - don't show if all time values are 0
  if (
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0
  ) {
    return null;
  }

  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
        color: "white",
        mb: 4,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="stars" patternUnits="userSpaceOnUse" width="100" height="100"><circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="80" r="1.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="90" r="0.8" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23stars)"/></svg>\')',
          opacity: 0.3,
        },
      }}
    >
      <CardContent sx={{ position: "relative", zIndex: 1 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack spacing={2} sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AutoAwesomeIcon sx={{ fontSize: 24 }} />
              <Typography variant="h5" component="h2" fontWeight={600}>
                🎉 Limited Time Offer!
              </Typography>
            </Stack>

            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Sign up before August 1st, 2025 and get{" "}
              <Chip
                label="10 FREE CREDITS"
                sx={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                }}
              />
            </Typography>

            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Start creating amazing AI car scenes immediately - no purchase
              required!
            </Typography>
          </Stack>

          <Stack spacing={2} alignItems="center" sx={{ minWidth: 200 }}>
            <Typography
              variant="body2"
              sx={{ opacity: 0.8, textAlign: "center" }}
            >
              Offer ends in:
            </Typography>

            <Stack direction="row" spacing={1}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" fontWeight="bold">
                  {timeLeft.days.toString().padStart(2, "0")}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Days
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ opacity: 0.5 }}>
                :
              </Typography>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" fontWeight="bold">
                  {timeLeft.hours.toString().padStart(2, "0")}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Hours
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ opacity: 0.5 }}>
                :
              </Typography>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" fontWeight="bold">
                  {timeLeft.minutes.toString().padStart(2, "0")}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Min
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ opacity: 0.5 }}>
                :
              </Typography>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" fontWeight="bold">
                  {timeLeft.seconds.toString().padStart(2, "0")}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Sec
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
