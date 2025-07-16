import { Box, Stack, Typography } from "@mui/material";
import FileUpload from "../FileUpload";

export default function UploadPhotoStep({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const handleFileSelect = (file: File) => {
    console.log("Selected file:", file);
    // Here you would typically upload the file to your server
    // For now, we'll just call onComplete after a short delay
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", width: "100%" }}>
      <Stack spacing={4} alignItems="center">
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Upload Your Car Photo
          </Typography>
        </Box>

        <FileUpload
          onFileSelect={handleFileSelect}
          maxFileSize={10}
          acceptedTypes={["image/jpeg", "image/jpg", "image/png", "image/webp"]}
        />

        <Typography variant="body2" color="text.secondary" align="center">
          <strong>Tips for best results:</strong>
          <br />
          • Use a clear, well-lit photo of your car
          <br />
          • Ensure the car is the main subject of the image
          <br />• Avoid photos with multiple cars or complex backgrounds
        </Typography>
      </Stack>
    </Box>
  );
}
