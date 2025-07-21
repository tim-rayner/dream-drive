"use client";

import {
  getRecommendedOptions,
  isHEICFile,
  isImageFile,
  useImageProcessor,
} from "@/lib/hooks/useImageProcessor";
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Chip,
  Fade,
  IconButton,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useCallback, useEffect, useRef, useState } from "react";

// Styled components
const UploadArea = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "isDragOver",
})<{ isDragOver: boolean }>(({ theme, isDragOver }) => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(4),
  minHeight: 200,
  border: `2px dashed ${
    isDragOver ? theme.palette.primary.main : theme.palette.divider
  }`,
  backgroundColor: isDragOver
    ? "rgba(139, 92, 246, 0.1)"
    : theme.palette.background.paper,
  transition: "all 0.3s ease",
  cursor: "pointer",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: "rgba(139, 92, 246, 0.05)",
  },
}));

const FilePreview = styled(Box)(({ theme }) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  marginTop: theme.spacing(2),
}));

const PreviewImage = styled("img")({
  width: 60,
  height: 60,
  objectFit: "cover",
  borderRadius: 8,
});

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
  uploadedFile?: File | null;
  enableProcessing?: boolean; // Enable automatic image processing
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  maxFileSize = 10, // 10MB default
  acceptedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic", // Add HEIC support
  ],
  className,
  uploadedFile: externalUploadedFile,
  enableProcessing = true, // Enable by default
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(
    externalUploadedFile || null
  );
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [processingInfo, setProcessingInfo] = useState<{
    originalSize: number;
    processedSize: number;
    compressionRatio: number;
    warnings: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image processor hook
  const {
    processImage,
    isProcessing,
    error: processingError,
  } = useImageProcessor();

  // Update selectedFile when externalUploadedFile changes
  useEffect(() => {
    setSelectedFile(externalUploadedFile || null);
  }, [externalUploadedFile]);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check if it's an image file
      if (!isImageFile(file)) {
        return "Please select a valid image file";
      }

      // Check file size (allow larger files if processing is enabled)
      const fileSizeInMB = file.size / (1024 * 1024);
      const effectiveMaxSize = enableProcessing ? maxFileSize * 2 : maxFileSize; // Allow 2x size if processing enabled
      if (fileSizeInMB > effectiveMaxSize) {
        return `File size must be less than ${effectiveMaxSize}MB`;
      }

      return null;
    },
    [maxFileSize, enableProcessing]
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        return;
      }

      setError(null);
      setSelectedFile(file);
      setIsUploading(true);
      setProcessingInfo(null);

      try {
        let processedFile = file;

        // Process image if enabled and needed
        if (
          enableProcessing &&
          (file.size > 2 * 1024 * 1024 || isHEICFile(file))
        ) {
          console.log("🔄 Processing image:", file.name);

          const options = getRecommendedOptions(file);
          const result = await processImage(file, options);

          processedFile = result.blob as File;
          setProcessingInfo({
            originalSize: result.originalSize,
            processedSize: result.processedSize,
            compressionRatio: result.compressionRatio,
            warnings: result.warnings,
          });

          console.log("✅ Image processed:", {
            originalSize:
              Math.round((result.originalSize / 1024 / 1024) * 100) / 100 +
              "MB",
            processedSize:
              Math.round((result.processedSize / 1024 / 1024) * 100) / 100 +
              "MB",
            compressionRatio: Math.round(result.compressionRatio * 100) + "%",
            warnings: result.warnings,
          });
        }

        // Simulate upload process
        setTimeout(() => {
          setIsUploading(false);
          onFileSelect(processedFile);
        }, 500);
      } catch (err) {
        console.error("❌ File processing failed:", err);
        setError(
          err instanceof Error ? err.message : "Failed to process image"
        );
        setIsUploading(false);
        setSelectedFile(null);
      }
    },
    [validateFile, onFileSelect, enableProcessing, processImage]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    setProcessingInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <Box className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleFileInputChange}
        style={{ display: "none" }}
      />

      {!selectedFile ? (
        <UploadArea
          isDragOver={isDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <CloudUploadIcon
            sx={{
              fontSize: { xs: "2rem", sm: "3rem" },
              color: "text.secondary",
              mb: 2,
            }}
          />
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontSize: { xs: "1.125rem", sm: "1.25rem" },
              fontWeight: 600,
              mb: 1,
              textAlign: "center",
            }}
          >
            Upload Your Car Photo
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
              textAlign: "center",
              mb: 2,
            }}
          >
            Drag and drop your image here, or click to browse
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              justifyContent: "center",
            }}
          >
            <Chip
              label="JPEG"
              size="small"
              variant="outlined"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            />
            <Chip
              label="PNG"
              size="small"
              variant="outlined"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            />
            <Chip
              label="HEIC"
              size="small"
              variant="outlined"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            />
            <Chip
              label="WebP"
              size="small"
              variant="outlined"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            />
          </Box>
          {enableProcessing && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                textAlign: "center",
                mt: 1,
                opacity: 0.8,
              }}
            >
              Large images will be automatically compressed
            </Typography>
          )}
        </UploadArea>
      ) : (
        <Fade in={true}>
          <FilePreview>
            <PreviewImage
              src={URL.createObjectURL(selectedFile)}
              alt="Selected file preview"
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  mb: 0.5,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {selectedFile.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                {Math.round((selectedFile.size / 1024 / 1024) * 100) / 100} MB
                {processingInfo && (
                  <>
                    {" → "}
                    {Math.round(
                      (processingInfo.processedSize / 1024 / 1024) * 100
                    ) / 100}{" "}
                    MB
                    {" ("}
                    {Math.round(processingInfo.compressionRatio * 100)}% smaller
                    {")"}
                  </>
                )}
              </Typography>
              {processingInfo && processingInfo.warnings.length > 0 && (
                <Typography
                  variant="caption"
                  color="warning.main"
                  sx={{
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    display: "block",
                    mt: 0.5,
                  }}
                >
                  {processingInfo.warnings[0]}
                </Typography>
              )}
            </Box>
            <IconButton
              onClick={handleRemoveFile}
              size="small"
              sx={{
                color: "text.secondary",
                "&:hover": { color: "error.main" },
                minWidth: "44px",
                minHeight: "44px",
              }}
            >
              <CloseIcon />
            </IconButton>
          </FilePreview>
        </Fade>
      )}

      {/* Processing Progress */}
      {(isUploading || isProcessing) && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            sx={{
              height: 4,
              borderRadius: 2,
              backgroundColor: "rgba(139, 92, 246, 0.2)",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "primary.main",
              },
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              mt: 1,
              display: "block",
              textAlign: "center",
            }}
          >
            {isProcessing ? "Processing image..." : "Uploading..."}
          </Typography>
        </Box>
      )}

      {/* Error Display */}
      {(error || processingError) && (
        <Alert
          severity="error"
          icon={<ErrorIcon />}
          sx={{
            mt: 2,
            fontSize: { xs: "0.875rem", sm: "1rem" },
          }}
        >
          {error || processingError}
        </Alert>
      )}
    </Box>
  );
};

export default FileUpload;
