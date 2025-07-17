"use client";

import { Avatar, Tooltip } from "@mui/material";

interface UserAvatarProps {
  fullName?: string;
  avatarUrl?: string;
  size?: "small" | "medium" | "large";
}

export default function UserAvatar({
  fullName,
  avatarUrl,
  size = "medium",
}: UserAvatarProps) {
  const getInitials = (name: string | undefined) => {
    if (!name) return "👤";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2); // Limit to 2 characters
  };

  const sizeMap = {
    small: 32,
    medium: 40,
    large: 56,
  };

  return (
    <Tooltip title={fullName || "Logged in user"}>
      <Avatar
        src={avatarUrl || undefined}
        alt={fullName}
        sx={{
          width: sizeMap[size],
          height: sizeMap[size],
          bgcolor: avatarUrl ? "transparent" : "primary.main",
          fontSize:
            size === "small" ? "0.75rem" : size === "large" ? "1.5rem" : "1rem",
          fontWeight: 600,
        }}
      >
        {!avatarUrl && getInitials(fullName)}
      </Avatar>
    </Tooltip>
  );
}
