"use client";

import { Avatar, Button, Stack, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function LoginButton() {
  const { user, profile, login, logout, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <Button variant="contained" color="primary" onClick={login}>
        Sign in with Google
      </Button>
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
