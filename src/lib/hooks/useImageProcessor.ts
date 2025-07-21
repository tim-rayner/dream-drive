/**
 * Image Processing Hook for DriveDream
 *
 * This hook provides comprehensive image processing capabilities including:
 * - HEIC to JPEG conversion using browser APIs
 * - Automatic image compression and resizing
 * - Support for multiple output formats (JPEG, PNG, WebP)
 * - Optimized settings for Replicate API compatibility
 *
 * @example
 * ```tsx
 * import { useImageProcessor } from '@/lib/hooks/useImageProcessor';
 *
 * function MyComponent() {
 *   const { processImage, isProcessing, error } = useImageProcessor();
 *
 *   const handleFileUpload = async (file: File) => {
 *     try {
 *       const result = await processImage(file, {
 *         maxWidth: 2000,
 *         maxHeight: 2000,
 *         quality: 0.8,
 *         format: 'jpeg'
 *       });
 *
 *       console.log('Processed image:', {
 *         originalSize: result.originalSize,
 *         processedSize: result.processedSize,
 *         compressionRatio: result.compressionRatio,
 *         warnings: result.warnings
 *       });
 *
 *       // Use result.blob for upload
 *       // Use result.dataUrl for preview
 *     } catch (err) {
 *       console.error('Processing failed:', err);
 *     }
 *   };
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Automatic processing with recommended settings
 * const { processImage, getRecommendedOptions } = useImageProcessor();
 *
 * const handleFile = async (file: File) => {
 *   const options = getRecommendedOptions(file);
 *   const result = await processImage(file, options);
 *   // result.blob is ready for upload
 * };
 * ```
 */

import { useCallback, useState } from "react";

// Type declarations for ImageDecoder API
declare global {
  interface Window {
    ImageDecoder: {
      new (init: { data: ArrayBuffer; type: string }): Promise<{
        decode(): Promise<{ image: ImageBitmap }>;
      }>;
    };
  }
}

/**
 * Image processing options for compression and resizing
 */
interface ImageProcessingOptions {
  /** Maximum width in pixels (default: 2000) */
  maxWidth?: number;
  /** Maximum height in pixels (default: 2000) */
  maxHeight?: number;
  /** JPEG quality (0-1, default: 0.8) */
  quality?: number;
  /** Output format (default: 'jpeg') */
  format?: "jpeg" | "png" | "webp";
  /** Maximum file size in bytes (default: 2MB) */
  maxSizeBytes?: number;
  /** Whether to maintain aspect ratio (default: true) */
  maintainAspectRatio?: boolean;
}

/**
 * Result of image processing
 */
interface ProcessedImageResult {
  /** The processed image blob */
  blob: Blob;
  /** Data URL for the processed image */
  dataUrl: string;
  /** Original file size in bytes */
  originalSize: number;
  /** Processed file size in bytes */
  processedSize: number;
  /** Compression ratio (0-1) */
  compressionRatio: number;
  /** Processing time in milliseconds */
  processingTime: number;
  /** Any warnings during processing */
  warnings: string[];
}

/**
 * Hook for processing and compressing images
 * Handles HEIC conversion, resizing, and compression for optimal upload
 */
export function useImageProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if the browser supports HEIC decoding
   */
  const supportsHEIC = useCallback(() => {
    return (
      typeof window !== "undefined" &&
      "ImageDecoder" in window &&
      "HEVC" in window.ImageDecoder
    );
  }, []);

  /**
   * Convert HEIC to JPEG using browser APIs
   */
  const convertHEIC = useCallback(
    async (file: File): Promise<Blob> => {
      if (!supportsHEIC()) {
        throw new Error(
          "HEIC conversion not supported in this browser. Please convert to JPEG/PNG first."
        );
      }

      try {
        // Use ImageDecoder API for HEIC support
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ImageDecoder = (window as any).ImageDecoder;
        const imageDecoder = new ImageDecoder({
          data: await file.arrayBuffer(),
          type: "image/heic",
        });

        const { image } = await imageDecoder.decode();

        // Create canvas to convert to JPEG
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        canvas.width = image.displayWidth;
        canvas.height = image.displayHeight;

        ctx.drawImage(image, 0, 0);

        return new Promise((resolve) => {
          canvas.toBlob(
            (blob) => {
              resolve(blob!);
            },
            "image/jpeg",
            0.8
          );
        });
      } catch (err) {
        console.warn("HEIC conversion failed, trying fallback:", err);
        throw new Error(
          "HEIC conversion failed. Please convert to JPEG/PNG first."
        );
      }
    },
    [supportsHEIC]
  );

  /**
   * Resize image while maintaining aspect ratio
   */
  const resizeImage = useCallback(
    (
      canvas: HTMLCanvasElement,
      ctx: CanvasRenderingContext2D,
      img: HTMLImageElement,
      maxWidth: number,
      maxHeight: number,
      maintainAspectRatio: boolean = true
    ) => {
      let { width, height } = img;

      if (maintainAspectRatio) {
        const aspectRatio = width / height;

        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }

        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }
      } else {
        width = Math.min(width, maxWidth);
        height = Math.min(height, maxHeight);
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);
    },
    []
  );

  /**
   * Process and compress an image file
   */
  const processImage = useCallback(
    async (
      file: File,
      options: ImageProcessingOptions = {}
    ): Promise<ProcessedImageResult> => {
      const startTime = Date.now();
      const warnings: string[] = [];

      // Default options
      const {
        maxWidth = 2000,
        maxHeight = 2000,
        quality = 0.8,
        format = "jpeg",
        maxSizeBytes = 2 * 1024 * 1024, // 2MB
        maintainAspectRatio = true,
      } = options;

      try {
        setIsProcessing(true);
        setError(null);

        let processedBlob: Blob;
        const originalSize = file.size;

        // Handle HEIC files
        if (
          file.type === "image/heic" ||
          file.name.toLowerCase().endsWith(".heic")
        ) {
          try {
            processedBlob = await convertHEIC(file);
            warnings.push("HEIC file converted to JPEG");
          } catch (err) {
            throw new Error(
              `HEIC conversion failed: ${
                err instanceof Error ? err.message : "Unknown error"
              }`
            );
          }
        } else {
          processedBlob = file;
        }

        // Create image element
        const img = new Image();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        return new Promise((resolve, reject) => {
          img.onload = () => {
            try {
              // Resize if needed
              if (img.width > maxWidth || img.height > maxHeight) {
                resizeImage(
                  canvas,
                  ctx,
                  img,
                  maxWidth,
                  maxHeight,
                  maintainAspectRatio
                );
                warnings.push(
                  `Image resized to ${canvas.width}x${canvas.height}`
                );
              } else {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
              }

              // Convert to blob with specified format and quality
              canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    reject(new Error("Failed to create blob from canvas"));
                    return;
                  }

                  const processedSize = blob.size;
                  const compressionRatio = 1 - processedSize / originalSize;
                  const processingTime = Date.now() - startTime;

                  // Check if file is still too large
                  if (processedSize > maxSizeBytes) {
                    warnings.push(
                      `File size (${
                        Math.round((processedSize / 1024 / 1024) * 100) / 100
                      }MB) exceeds recommended limit`
                    );
                  }

                  // Create data URL
                  const dataUrl = canvas.toDataURL(`image/${format}`, quality);

                  resolve({
                    blob,
                    dataUrl,
                    originalSize,
                    processedSize,
                    compressionRatio,
                    processingTime,
                    warnings,
                  });
                },
                `image/${format}`,
                quality
              );
            } catch (err) {
              reject(
                new Error(
                  `Image processing failed: ${
                    err instanceof Error ? err.message : "Unknown error"
                  }`
                )
              );
            }
          };

          img.onerror = () => {
            reject(new Error("Failed to load image"));
          };

          // Load image from blob
          img.src = URL.createObjectURL(processedBlob);
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    },
    [convertHEIC, resizeImage]
  );

  /**
   * Process multiple images
   */
  const processImages = useCallback(
    async (
      files: File[],
      options: ImageProcessingOptions = {}
    ): Promise<ProcessedImageResult[]> => {
      const results: ProcessedImageResult[] = [];

      for (const file of files) {
        try {
          const result = await processImage(file, options);
          results.push(result);
        } catch (err) {
          console.error(`Failed to process ${file.name}:`, err);
          throw err;
        }
      }

      return results;
    },
    [processImage]
  );

  /**
   * Get file info without processing
   */
  const getFileInfo = useCallback((file: File) => {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      sizeInMB: Math.round((file.size / 1024 / 1024) * 100) / 100,
    };
  }, []);

  return {
    processImage,
    processImages,
    getFileInfo,
    isProcessing,
    error,
    supportsHEIC: supportsHEIC(),
  };
}

/**
 * Utility function to check if a file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/**
 * Utility function to check if a file is HEIC
 */
export function isHEICFile(file: File): boolean {
  return (
    file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")
  );
}

/**
 * Utility function to get recommended processing options based on file size
 */
export function getRecommendedOptions(file: File): ImageProcessingOptions {
  const sizeInMB = file.size / 1024 / 1024;

  if (sizeInMB > 10) {
    return {
      maxWidth: 1500,
      maxHeight: 1500,
      quality: 0.7,
      maxSizeBytes: 1.5 * 1024 * 1024, // 1.5MB
    };
  } else if (sizeInMB > 5) {
    return {
      maxWidth: 1800,
      maxHeight: 1800,
      quality: 0.75,
      maxSizeBytes: 1.8 * 1024 * 1024, // 1.8MB
    };
  } else {
    return {
      maxWidth: 2000,
      maxHeight: 2000,
      quality: 0.8,
      maxSizeBytes: 2 * 1024 * 1024, // 2MB
    };
  }
}
