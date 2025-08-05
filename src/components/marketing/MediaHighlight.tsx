"use client";

import { PlayArrow } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";

export default function MediaHighlight() {
  return (
    <Box
      sx={{
        position: "relative",
        backgroundImage: `url('https://source.unsplash.com/1600x900/?car-interior')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "500px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 1,
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          color: "#fff",
        }}
      >
        <IconButton
          color="primary"
          size="large"
          sx={{
            backgroundColor: "rgba(139, 92, 246, 0.9)",
            color: "#fff",
            width: 80,
            height: 80,
            mb: 3,
            "&:hover": {
              backgroundColor: "rgba(139, 92, 246, 1)",
              transform: "scale(1.1)",
            },
            transition: "all 0.3s ease",
          }}
        >
          <PlayArrow fontSize="large" />
        </IconButton>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 2 }}>
          See It in Action
        </Typography>
        <Typography
          variant="body1"
          sx={{ opacity: 0.9, maxWidth: 400, mx: "auto" }}
        >
          Watch how AI transforms your car photos into cinematic scenes
        </Typography>
      </Box>
    </Box>
  );
}
