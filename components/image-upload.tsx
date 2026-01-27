/**
 * ImageUpload Component
 * 
 * A reusable component for uploading, validating, and cropping images with comprehensive
 * error handling and edge case management.
 * 
 * ## Error Handling:
 * 
 * The component handles the following error cases:
 * 
 * ### 1. File Size Limits (5MB max)
 * - Prevents memory issues and slow processing
 * - Error: "Image is too large. Please use an image smaller than 5MB."
 * 
 * ### 2. File Type Validation
 * - `accept="image/*"` can be bypassed, so we validate MIME type
 * - Only allows: JPG, PNG, WebP
 * - Error: "Please select a valid image file (JPG, PNG, or WebP)."
 * 
 * ### 3. Corrupted/Invalid Images
 * - Files that pass type check but fail to load
 * - Detected during image loading in validation
 * - Error: "This image file appears to be corrupted. Please try a different image."
 * 
 * ### 4. Image Dimensions
 * - Minimum: 200x200px (prevents poor quality after crop)
 * - Maximum: 10,000x10,000px (prevents memory issues)
 * - Errors: "Image is too small..." or "Image dimensions are too large..."
 * 
 * ### 5. Canvas API Limitations
 * - Browsers have canvas size limits (16,384px)
 * - Checked before cropping to prevent runtime errors
 * - Error: "Image dimensions exceed browser limits"
 * 
 * ### 6. Crop Operation Failures
 * - Canvas operations can fail (no 2d context, blob creation fails)
 * - Wrapped in try-catch with user-friendly error message
 * - Error: "Failed to process image. Please try again."
 * 
 * ### 7. Multiple Files Selected
 * - Only processes the first file
 * - Logs console warning (non-blocking)
 * 
 * ### 8. Memory Management
 * - All object URLs are revoked on unmount
 * - Prevents memory leaks from blob URLs
 * - Handled automatically via useEffect cleanup
 * 
 * ## Removed/Simplified:
 * - Removed redundant `imageLoadError` (covered by corrupted image check)
 * - Removed try-catch around `URL.createObjectURL` (synchronous, won't throw)
 * - Simplified error clearing (consolidated into `clearErrors` helper)
 * - Removed overly defensive error wrapping in crop function
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";

// Validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_DIMENSION = 200;
const MAX_DIMENSION = 10000;
const MAX_CANVAS_SIZE = 16384; // Browser canvas limit
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export interface ImageUploadProps {
  /**
   * Current preview URL of the image
   */
  value?: string | null;
  
  /**
   * Callback when image is selected and cropped
   * @param file - The original File object
   * @param previewUrl - The cropped image as a blob URL
   */
  onChange?: (file: File | null, previewUrl: string | null) => void;
  
  /**
   * Callback when an error occurs
   * @param error - Error message
   */
  onError?: (error: string) => void;
  
  /**
   * Translation function for validation messages
   * Should return messages for keys: imageTooLarge, imageInvalidType, 
   * imageTooSmall, imageTooLargeDimensions, imageCorrupted, 
   * imageProcessingError, imageLoadError
   */
  validationMessages?: (key: string) => string;
  
  /**
   * Size of the upload button in pixels (default: 128)
   */
  size?: number;
  
  /**
   * Custom className for the upload button
   */
  className?: string;
  
  /**
   * ID for the file input (for form association)
   */
  id?: string;
  
  /**
   * Whether the component is disabled
   */
  disabled?: boolean;
  
  /**
   * Custom error message to display
   */
  error?: string | null;
  
  /**
   * Label for accessibility
   */
  ariaLabel?: string;
}

export function ImageUpload({
  value,
  onChange,
  onError,
  validationMessages,
  size = 128,
  className,
  id,
  disabled = false,
  error: externalError,
  ariaLabel = "Upload image",
}: ImageUploadProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(value || null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with external value
  useEffect(() => {
    setImagePreview(value || null);
  }, [value]);

  // Sync with external error
  useEffect(() => {
    if (externalError) {
      setImageError(externalError);
    }
  }, [externalError]);

  /**
   * Validates an image file before processing
   * Handles: file size, file type, image dimensions, and corrupted files
   */
  const validateImageFile = async (file: File): Promise<{ valid: boolean; error?: string }> => {
    // 1. File size check
    if (file.size > MAX_FILE_SIZE) {
      return { 
        valid: false, 
        error: validationMessages?.("imageTooLarge") || "Image is too large. Please use an image smaller than 5MB." 
      };
    }

    // 2. File type check
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        error: validationMessages?.("imageInvalidType") || "Please select a valid image file (JPG, PNG, or WebP)." 
      };
    }

    // 3. Load and validate image dimensions
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
          resolve({ 
            valid: false, 
            error: validationMessages?.("imageTooSmall") || `Image is too small. Please use an image at least ${MIN_DIMENSION}x${MIN_DIMENSION} pixels.` 
          });
          return;
        }
        
        if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
          resolve({ 
            valid: false, 
            error: validationMessages?.("imageTooLargeDimensions") || `Image dimensions are too large. Please use an image smaller than ${MAX_DIMENSION}x${MAX_DIMENSION} pixels.` 
          });
          return;
        }
        
        resolve({ valid: true });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ 
          valid: false, 
          error: validationMessages?.("imageCorrupted") || "This image file appears to be corrupted. Please try a different image." 
        });
      };
      
      img.src = url;
    });
  };

  /**
   * Creates an Image object from a URL
   * Reused for both validation and cropping
   */
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", () => reject(new Error("Failed to load image")));
      image.src = url;
    });

  /**
   * Crops an image using canvas API
   * Handles: canvas size limits, blob creation failures
   */
  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<string> => {
    // Check canvas size limits before processing
    if (pixelCrop.width > MAX_CANVAS_SIZE || pixelCrop.height > MAX_CANVAS_SIZE) {
      throw new Error("Image dimensions exceed browser limits");
    }

    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas not supported");
    }

    // Set canvas size to match the crop area
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error("Failed to create image"));
          }
        },
        "image/jpeg",
        0.95
      );
    });
  };

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  /**
   * Handles the crop completion
   * Processes the cropped image and updates the preview
   */
  const handleCropComplete = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    setIsValidating(true);
    clearErrors();

    try {
      const croppedImageUrl = await getCroppedImg(imageToCrop, croppedAreaPixels);
      setImagePreview(croppedImageUrl);
      
      // Clean up the original image URL
      if (imageToCrop !== imagePreview) {
        URL.revokeObjectURL(imageToCrop);
      }
      
      setShowCropModal(false);
      setImageToCrop(null);
      
      // Convert cropped blob URL to File object
      // Fetch the blob from the blob URL
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      
      // Get original filename for extension, or use default
      const originalFile = fileInputRef.current?.files?.[0];
      const originalName = originalFile?.name || "image.jpg";
      const extension = originalName.split(".").pop() || "jpg";
      
      // Create a File object from the cropped blob
      // Use JPEG as the type since we're converting to JPEG in getCroppedImg
      const croppedFile = new File(
        [blob],
        `cropped-${Date.now()}.${extension}`,
        { type: "image/jpeg" }
      );
      
      // Notify parent component with the cropped file
      onChange?.(croppedFile, croppedImageUrl);
    } catch (error) {
      console.error("Error cropping image:", error);
      const errorMessage = validationMessages?.("imageProcessingError") || "Failed to process image. Please try again.";
      setImageError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Handles file selection and validation
   * Validates before opening crop modal
   */
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Handle multiple files - only use the first one
    if (files.length > 1) {
      console.warn("Multiple files selected. Only the first file will be used.");
    }

    const file = files[0];
    if (!file) return;

    // Reset previous errors
    clearErrors();
    setIsValidating(true);

    // Validate file
    const validation = await validateImageFile(file);
    
    if (!validation.valid) {
      const errorMsg = validation.error || "Invalid image file.";
      setImageError(errorMsg);
      onError?.(errorMsg);
      setIsValidating(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Create preview URL and show crop modal
    // URL.createObjectURL is synchronous and won't throw, so no try-catch needed
    const previewUrl = URL.createObjectURL(file);
    setImageToCrop(previewUrl);
    setShowCropModal(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      clearErrors();
      setIsValidating(false);
  };

  const handleImageClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const clearErrors = () => {
    setImageError(null);
    onError?.("");
  };

  const handleChangePicture = () => {
    // Clean up current image
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
      setImageToCrop(null);
    }
    // Reset crop state and errors
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    clearErrors();
    // Reopen file picker
    fileInputRef.current?.click();
  };

  const handleCancel = () => {
    setShowCropModal(false);
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
      setImageToCrop(null);
    }
    clearErrors();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Cleanup preview URLs on unmount
  // Only revoke blob URLs, not external URLs (http/https)
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
      if (imageToCrop && imageToCrop !== imagePreview && imageToCrop.startsWith("blob:")) {
        URL.revokeObjectURL(imageToCrop);
      }
    };
  }, [imagePreview, imageToCrop]);

  return (
    <>
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={handleImageClick}
          disabled={disabled}
          className={cn(
            "relative rounded-full border-4 border-black",
            "flex items-center justify-center",
            "bg-white hover:bg-gray-50 transition-colors",
            "cursor-pointer overflow-hidden",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          style={{ width: size, height: size }}
          aria-label={ariaLabel}
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Image preview"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <ImagePlus className="text-black" style={{ width: size * 0.375, height: size * 0.375 }} strokeWidth={2} />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          id={id}
          disabled={disabled}
        />
      </div>
      
      {/* Error display is handled by parent component (e.g., FieldError in forms) */}
      {/* Only show validation state if not in a form context */}
      {isValidating && !onError && (
        <p className="text-sm text-gray-600 mt-2">Validating image...</p>
      )}

      {/* Crop Modal */}
      {showCropModal && imageToCrop && !imageError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg border-2 border-black shadow-[4px_4px_0_0_black] p-6 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-black">Crop Your Image</h2>
            <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden border-2 border-black">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="round"
              />
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-black">
                  Zoom: {Math.round(zoom * 100)}%
                </label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>
              <div className="flex gap-4 justify-between">
                <button
                  type="button"
                  onClick={handleChangePicture}
                  className="px-6 py-2 border-2 border-black bg-white hover:bg-gray-50 font-bold rounded-lg transition-colors cursor-pointer text-black"
                >
                  Change Picture
                </button>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 border-2 border-black bg-white hover:bg-gray-50 font-bold rounded-lg transition-colors cursor-pointer text-black"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCropComplete}
                    disabled={isValidating}
                    className="cursor-pointer px-6 py-2 border-2 border-black bg-accent-color2 hover:bg-accent-color2/90 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-black"
                  >
                    {isValidating ? "Processing..." : "Upload Image"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
