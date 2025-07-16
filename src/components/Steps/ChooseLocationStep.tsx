import { Box, Button, Typography } from "@mui/material";

export default function ChooseLocationStep({
  onComplete,
}: {
  onComplete: () => void;
}) {
  return (
    <Box>
      <Typography variant="h6">Choose Location</Typography>
      <Button onClick={onComplete}>Complete</Button>
    </Box>
  );
}
