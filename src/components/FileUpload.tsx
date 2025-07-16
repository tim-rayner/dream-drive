"use client";

import {
  CheckCircle as CheckCircleIcon,
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
  ],
  className,
  uploadedFile: externalUploadedFile,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(
    externalUploadedFile || null
  );
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update selectedFile when externalUploadedFile changes
  useEffect(() => {
    setSelectedFile(externalUploadedFile || null);
  }, [externalUploadedFile]);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        return "Please select a valid image file (JPEG, PNG, WebP, or GIF)";
      }

      // Check file size
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > maxFileSize) {
        return `File size must be less than ${maxFileSize}MB`;
      }

      return null;
    },
    [acceptedTypes, maxFileSize]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        return;
      }

      setError(null);
      setSelectedFile(file);
      setIsUploading(true);

      // Simulate upload process
      setTimeout(() => {
        setIsUploading(false);
        onFileSelect(file);
      }, 1000);
    },
    [validateFile, onFileSelect]
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
          elevation={0}
        >
          <CloudUploadIcon
            sx={{
              fontSize: 48,
              color: "primary.main",
              mb: 2,
            }}
          />
          <Typography variant="h6" component="div" gutterBottom>
            Drop your photo here
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            or click to browse
          </Typography>
          <Box
            sx={{
              mt: 2,
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Chip
              label="JPEG"
              size="small"
              variant="outlined"
              sx={{ borderColor: "primary.main", color: "primary.main" }}
            />
            <Chip
              label="PNG"
              size="small"
              variant="outlined"
              sx={{ borderColor: "primary.main", color: "primary.main" }}
            />
            <Chip
              label="WebP"
              size="small"
              variant="outlined"
              sx={{ borderColor: "primary.main", color: "primary.main" }}
            />
            <Chip
              label="GIF"
              size="small"
              variant="outlined"
              sx={{ borderColor: "primary.main", color: "primary.main" }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Max file size: {maxFileSize}MB
          </Typography>
        </UploadArea>
      ) : (
        <Fade in={true}>
          <FilePreview>
            <PreviewImage
              src={URL.createObjectURL(selectedFile)}
              alt="Preview"
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" noWrap>
                {selectedFile.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </Typography>
              {isUploading && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="indeterminate"
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: "rgba(139, 92, 246, 0.2)",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: "primary.main",
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
            <IconButton
              onClick={handleRemoveFile}
              size="small"
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "error.main",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </FilePreview>
        </Fade>
      )}

      {error && (
        <Alert
          severity="error"
          icon={<ErrorIcon />}
          sx={{ mt: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {selectedFile && !isUploading && !error && (
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mt: 2 }}>
          File uploaded successfully!
        </Alert>
      )}
    </Box>
  );
};

export default FileUpload;
