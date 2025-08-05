"use client";

import { Box } from "@mui/material";
import { useEffect, useState } from "react";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  animationDelay: number;
}

interface StarryBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export default function StarryBackground({
  children,
  className,
}: StarryBackgroundProps) {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // Generate stars
    const generateStars = () => {
      const newStars: Star[] = [];
      const starCount = 150; // Number of stars

      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100, // Percentage across screen
          y: Math.random() * 100, // Percentage down screen
          size: Math.random() * 2 + 1, // 1-3px
          opacity: Math.random() * 0.8 + 0.2, // 0.2-1.0
          animationDelay: Math.random() * 3, // 0-3s delay
        });
      }
      setStars(newStars);
    };

    generateStars();
  }, []);

  return (
    <Box
      className={className}
      sx={{
        position: "relative",
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #1E1E3F 100%)",
        overflow: "hidden",
      }}
    >
      {/* Stars Layer */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          pointerEvents: "none",
        }}
      >
        {stars.map((star) => (
          <Box
            key={star.id}
            sx={{
              position: "absolute",
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: "#ffffff",
              borderRadius: "50%",
              opacity: star.opacity,
              animation: `twinkle ${
                3 + Math.random() * 2
              }s ease-in-out infinite`,
              animationDelay: `${star.animationDelay}s`,
              boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${
                star.opacity
              })`,
            }}
          />
        ))}
      </Box>

      {/* Content Layer */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          height: "100%",
        }}
      >
        {children}
      </Box>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </Box>
  );
}
