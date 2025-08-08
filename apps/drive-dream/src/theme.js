import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#8B5CF6", // Purple
      light: "#A78BFA",
      dark: "#7C3AED",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#6366F1", // Indigo
      light: "#818CF8",
      dark: "#4F46E5",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#0F0F23", // Very dark blue-grey
      paper: "#1A1A2E", // Slightly lighter dark blue-grey
    },
    surface: {
      main: "#1E1E3F", // Dark purple-grey
      light: "#2D2D5F",
      dark: "#0F0F1F",
    },
    text: {
      primary: "#E2E8F0", // Light grey
      secondary: "#94A3B8", // Medium grey
      disabled: "#64748B", // Darker grey
    },
    divider: "#2D2D5F",
    error: {
      main: "#EF4444",
      light: "#F87171",
      dark: "#DC2626",
    },
    warning: {
      main: "#F59E0B",
      light: "#FBBF24",
      dark: "#D97706",
    },
    success: {
      main: "#10B981",
      light: "#34D399",
      dark: "#059669",
    },
    info: {
      main: "#3B82F6",
      light: "#60A5FA",
      dark: "#2563EB",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
      color: "#E2E8F0",
    },
    h2: {
      fontWeight: 600,
      fontSize: "2rem",
      color: "#E2E8F0",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.75rem",
      color: "#E2E8F0",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem",
      color: "#E2E8F0",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
      color: "#E2E8F0",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
      color: "#E2E8F0",
    },
    body1: {
      color: "#E2E8F0",
    },
    body2: {
      color: "#94A3B8",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
          },
        },
        contained: {
          background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
          },
        },
        outlined: {
          borderColor: "#8B5CF6",
          color: "#8B5CF6",
          "&:hover": {
            backgroundColor: "rgba(139, 92, 246, 0.1)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#1A1A2E",
          border: "1px solid #2D2D5F",
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#1A1A2E",
          border: "1px solid #2D2D5F",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(15, 15, 35, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #2D2D5F",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#0F0F23",
          borderRight: "1px solid #2D2D5F",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#1E1E3F",
            "& fieldset": {
              borderColor: "#2D2D5F",
            },
            "&:hover fieldset": {
              borderColor: "#8B5CF6",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#8B5CF6",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#94A3B8",
            "&.Mui-focused": {
              color: "#8B5CF6",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "#1E1E3F",
          border: "1px solid #2D2D5F",
          "&:hover": {
            backgroundColor: "#2D2D5F",
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#2D2D5F",
        },
      },
    },
  },
});

export default theme;
