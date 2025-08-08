import { Box, Button } from "@mui/material";

type ModeToggleProps = {
  driftMode: boolean;
  setDriftMode: (mode: boolean) => void;
};

const ModeToggle = ({ driftMode, setDriftMode }: ModeToggleProps) => {
  return (
    <Box
      sx={{
        mb: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 3,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          borderRadius: 2,
          border: "1px solid rgba(255, 255, 255, 0.2)",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          overflow: "visible",
        }}
      >
        <Button
          variant={driftMode ? "text" : "contained"}
          onClick={() => setDriftMode(false)}
          sx={{
            py: 1.5,
            px: 4,
            borderRadius: 0,
            fontSize: "0.9rem",
            fontWeight: 600,
            textTransform: "none",
            background: driftMode
              ? "transparent"
              : "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
            borderColor: "transparent",
            color: driftMode ? "text.primary" : "white",
            boxShadow: driftMode ? "none" : "0 2px 4px rgba(25, 118, 210, .3)",
            minWidth: "160px",
            margin: "2px",
            "&:hover": {
              background: driftMode
                ? "rgba(25, 118, 210, 0.08)"
                : "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
            },

            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 20,
          }}
        >
          Cinematic Photoshoot
        </Button>

        <Button
          variant={driftMode ? "contained" : "text"}
          onClick={() => setDriftMode(true)}
          sx={{
            py: 1.5,
            px: 4,
            borderRadius: 0,
            fontSize: "0.9rem",
            fontWeight: 600,
            textTransform: "none",
            background: driftMode
              ? "linear-gradient(45deg, #8B5CF6 30%, #A78BFA 90%)"
              : "transparent",
            borderColor: "transparent",
            color: driftMode ? "white" : "text.primary",
            boxShadow: driftMode ? "0 2px 4px rgba(139, 92, 246, .3)" : "none",
            minWidth: "160px",
            margin: "2px",
            "&:hover": {
              background: driftMode
                ? "linear-gradient(45deg, #7C3AED 30%, #8B5CF6 90%)"
                : "rgba(139, 92, 246, 0.08)",
            },

            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
          }}
        >
          Drift Mode
        </Button>
      </Box>
    </Box>
  );
};

export default ModeToggle;
