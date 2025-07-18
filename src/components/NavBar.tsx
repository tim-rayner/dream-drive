"use client";

import { Logout } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import CreditsDisplay from "./CreditsDisplay";
import UserAvatar from "./UserAvatar";

export default function NavBar() {
  const { user, profile, login, logout, loading } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  if (loading) return null;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "rgba(26, 26, 46, 0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
        color: "white",
        top: 0,
        zIndex: 1100,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
          {/* Logo/Title */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="h6"
              component="div"
              onClick={() => router.push("/")}
              sx={{
                background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 700,
                fontSize: "1.25rem",
                color: "white",
                cursor: "pointer",
                "&:hover": {
                  opacity: 0.8,
                  transform: "scale(1.02)",
                  transition: "all 0.2s ease",
                },
              }}
            >
              DreamDrive
            </Typography>
          </Stack>

          {/* Right side - Auth & Credits */}
          <Box>
            {!user ? (
              <Button
                variant="contained"
                color="primary"
                onClick={login}
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
                  color: "white",
                  boxShadow: "0 2px 8px rgba(139, 92, 246, 0.3)",
                }}
              >
                Sign in with Google
              </Button>
            ) : (
              <Stack direction="row" spacing={2} alignItems="center">
                {/* Credits Display */}
                <CreditsDisplay variant="button" size="medium" />

                <Typography
                  variant="body2"
                  sx={{
                    display: { xs: "none", sm: "block" },
                    color: "rgba(255, 255, 255, 0.9)",
                    fontWeight: 500,
                  }}
                >
                  {profile?.full_name || user.email}
                </Typography>

                <IconButton
                  onClick={handleMenu}
                  sx={{
                    p: 0,
                    color: "white",
                    "&:hover": {
                      transform: "scale(1.05)",
                      transition: "transform 0.2s ease",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  <UserAvatar
                    fullName={profile?.full_name}
                    avatarUrl={profile?.avatar_url}
                    size="small"
                  />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  PaperProps={{
                    sx: {
                      background: "rgba(26, 26, 46, 0.98)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      mt: 1,
                      color: "white",
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      router.push("/settings");
                      handleClose();
                    }}
                    sx={{
                      color: "white",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    Settings
                  </MenuItem>
                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      color: "white",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    <Logout sx={{ mr: 1, fontSize: 20 }} />
                    Sign out
                  </MenuItem>
                </Menu>
              </Stack>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
