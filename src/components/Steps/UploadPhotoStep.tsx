import { Box, Stack, Typography } from "@mui/material";
import FileUpload from "../FileUpload";

export default function UploadPhotoStep({
  onComplete,
  uploadedFile,
  onFileUpload,
}: {
  onComplete: () => void;
  uploadedFile: File | null;
  onFileUpload: (file: File) => void;
}) {
  const handleFileSelect = (file: File) => {
    console.log("Selected file:", file);

    onFileUpload(file);

    onComplete();
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", width: "100%" }}>
      <Stack spacing={{ xs: 3, sm: 4 }} alignItems="center">
        <Box sx={{ textAlign: "center", px: { xs: 2, sm: 0 } }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" } }}
          >
            Upload Your Car Photo
          </Typography>
        </Box>

        <FileUpload
          onFileSelect={handleFileSelect}
          maxFileSize={10}
          acceptedTypes={["image/jpeg", "image/jpg", "image/png", "image/webp"]}
          uploadedFile={uploadedFile}
        />

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{
            px: { xs: 2, sm: 0 },
            fontSize: { xs: "0.875rem", sm: "1rem" },
            lineHeight: 1.6,
          }}
        >
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
