"use client";

import { Avatar, Button, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginButton() {
  const { user, profile, login, logout, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  if (loading) return null;

  if (!user) {
    return (
      <Stack spacing={2} alignItems="center">
        <Button
          variant="contained"
          color="primary"
          onClick={login}
          size="large"
          data-testid="login-button"
          sx={{
            fontSize: "1.1rem",
            px: 4,
            py: 1.5,
            background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 25px rgba(139, 92, 246, 0.3)",
            },
            transition: "all 0.3s ease",
          }}
        >
          Sign in with Google
        </Button>
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      {profile?.avatar_url && (
        <Avatar
          src={profile.avatar_url}
          alt={profile.full_name || user.email}
        />
      )}
      <Typography variant="body1">
        {profile?.full_name || user.email}
      </Typography>
      <Button variant="outlined" color="secondary" onClick={logout}>
        Sign out
      </Button>
    </Stack>
  );
}
