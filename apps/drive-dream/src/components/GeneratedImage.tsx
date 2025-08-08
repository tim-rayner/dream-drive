"use client";

import { AutoAwesome as AutoAwesomeIcon } from "@mui/icons-material";
import { Box, Card, CardContent, Typography } from "@mui/material";
import Image from "next/image";

interface GeneratedImageProps {
  imageUrl: string;
  borderColor?: "success" | "primary" | "secondary";
  boxShadow?: string;
  size?: number; // Size in pixels for both width and height
}

export default function GeneratedImage({
  imageUrl,
  borderColor = "success",
  boxShadow = "0 8px 32px rgba(16, 185, 129, 0.3)",
  size = 400, // Default size for Instagram-style square posts
}: GeneratedImageProps) {
  const getBorderColor = () => {
    switch (borderColor) {
      case "success":
        return "success.main";
      case "primary":
        return "primary.main";
      case "secondary":
        return "secondary.main";
      default:
        return "success.main";
    }
  };

  return (
    <Box>
      <Card
        sx={{
          borderRadius: "12px",
          overflow: "hidden",
          border: "2px solid",
          borderColor: getBorderColor(),
          boxShadow: boxShadow,
          width: { xs: "100%", sm: size },
          height: { xs: "auto", sm: size },
          maxWidth: { xs: "calc(100vw - 32px)", sm: size },
          maxHeight: { xs: "calc(100vw - 32px)", sm: size },
          mx: "auto",
        }}
      >
        <CardContent
          sx={{
            p: 0,
            "&:last-child": { pb: 0 },
            height: "100%",
            m: 0,
            "&.MuiCardContent-root": {
              padding: 0,
              margin: 0,
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "background.paper",
              m: 0,
              p: 0,
              aspectRatio: "1 / 1",
            }}
          >
            <Image
              src={imageUrl}
              alt="Generated AI Scene"
              width={size}
              height={size}
              style={{
                display: "block",
                objectFit: "cover", // Changed to cover to fill the square area
                width: "100%",
                height: "100%",
                margin: 0,
                padding: 0,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: { xs: 8, sm: 16 },
                right: { xs: 8, sm: 16 },
                display: "flex",
                alignItems: "center",
                gap: 1,
                backgroundColor: "rgba(0,0,0,0.7)",
                color: "white",
                px: { xs: 1, sm: 2 },
                py: { xs: 0.5, sm: 1 },
                borderRadius: "20px",
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: { xs: 16, sm: 15 } }} />
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  fontSize: { xs: "0.75rem", sm: "0.55rem" },
                }}
              >
                AI Generated
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
