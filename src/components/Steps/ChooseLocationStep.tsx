import { Box, Button, Typography } from "@mui/material";
import GoogleMapExample from "../Maps/GoogleMapExample";

export default function ChooseLocationStep({
  onComplete,
}: {
  onComplete: () => void;
}) {
  return (
    <Box>
      <Typography variant="h6">Choose Location</Typography>
      <GoogleMapExample />
      <Button onClick={onComplete}>Complete</Button>
    </Box>
  );
}
