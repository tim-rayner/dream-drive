"use client";

import { MonetizationOn } from "@mui/icons-material";
import { Button, CircularProgress } from "@mui/material";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCredits } from "../context/CreditsContext";

interface CreditsDisplayProps {
  variant?: "button" | "text";
  showIcon?: boolean;
  size?: "small" | "medium" | "large";
}

export default function CreditsDisplay({
  variant = "button",
  showIcon = true,
  size = "medium",
}: CreditsDisplayProps) {
  const { credits, loading } = useCredits();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const count = useMotionValue(credits ?? 0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !isHydrated) return;

    const animation = animate(count, credits ?? 0, {
      duration: 0.8,
      ease: "easeOut",
    });
    return animation.stop;
  }, [credits, count, isHydrated]);

  const handleCreditsClick = () => {
    router.push("/buy");
  };

  // Don't render framer-motion components until hydrated
  if (!isHydrated) {
    if (variant === "button") {
      return (
        <Button
          onClick={handleCreditsClick}
          disabled={loading}
          startIcon={showIcon ? <MonetizationOn /> : undefined}
          sx={{
            color: "rgba(255, 255, 255, 0.9)",
            "&:hover": {
              color: "white",
              background: "rgba(255, 255, 255, 0.1)",
            },
            textTransform: "none",
            fontWeight: 600,
            px: { xs: 1.5, sm: 2 },
            py: { xs: 0.75, sm: 1 },
            borderRadius: 2,
            fontSize:
              size === "small"
                ? "0.875rem"
                : size === "large"
                ? "1.125rem"
                : "1rem",
            transition: "all 0.3s ease",
            minHeight: "44px",
            minWidth: "44px",
          }}
        >
          {loading ? "..." : credits ?? 0}
        </Button>
      );
    }

    return (
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontSize:
            size === "small"
              ? "0.875rem"
              : size === "large"
              ? "1.125rem"
              : "1rem",
        }}
      >
        {showIcon && <MonetizationOn fontSize="small" />}
        {loading ? <CircularProgress size={16} /> : credits ?? 0}
      </span>
    );
  }

  if (variant === "button") {
    return (
      <Button
        onClick={handleCreditsClick}
        disabled={loading}
        startIcon={showIcon ? <MonetizationOn /> : undefined}
        sx={{
          color: "rgba(255, 255, 255, 0.9)",
          "&:hover": {
            color: "white",
            background: "rgba(255, 255, 255, 0.1)",
          },
          textTransform: "none",
          fontWeight: 600,
          px: { xs: 1.5, sm: 2 },
          py: { xs: 0.75, sm: 1 },
          borderRadius: 2,
          fontSize:
            size === "small"
              ? "0.875rem"
              : size === "large"
              ? "1.125rem"
              : "1rem",
          transition: "all 0.3s ease",
          minHeight: "44px",
          minWidth: "44px",
        }}
      >
        {loading ? (
          "..."
        ) : (
          <>
            <span style={{ display: "none" }}>Credits: </span>
            <motion.span
              style={{
                display: "inline-block",
              }}
            >
              {rounded}
            </motion.span>
          </>
        )}
      </Button>
    );
  }

  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        fontSize:
          size === "small"
            ? "0.875rem"
            : size === "large"
            ? "1.125rem"
            : "1rem",
      }}
    >
      {showIcon && <MonetizationOn fontSize="small" />}
      {loading ? (
        <CircularProgress size={16} />
      ) : (
        <motion.span>{rounded}</motion.span>
      )}
    </span>
  );
}
