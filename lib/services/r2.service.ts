import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// Use environment-specific values from .env.development or .env.production
const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
// Remove trailing slash from PUBLIC_URL if present
const PUBLIC_URL = process.env.R2_PUBLIC_URL?.replace(/\/$/, "") || "";

// Validate required environment variables
if (!BUCKET_NAME || !PUBLIC_URL || !process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
  console.error("Missing R2 configuration. Please check your environment variables:");
  console.error("- R2_BUCKET_NAME:", BUCKET_NAME ? "✓" : "✗");
  console.error("- R2_PUBLIC_URL:", PUBLIC_URL ? "✓" : "✗");
  console.error("- R2_ENDPOINT:", process.env.R2_ENDPOINT ? "✓" : "✗");
  console.error("- R2_ACCESS_KEY_ID:", process.env.R2_ACCESS_KEY_ID ? "✓" : "✗");
  console.error("- R2_SECRET_ACCESS_KEY:", process.env.R2_SECRET_ACCESS_KEY ? "✓" : "✗");
}

/**
 * Upload an image to R2
 * @param file - The file buffer or blob
 * @param fileName - The file name (will be prefixed with user ID)
 * @param contentType - MIME type (e.g., 'image/jpeg')
 * @returns The public URL of the uploaded image
 */
export async function uploadImageToR2(
  file: Buffer | Uint8Array,
  fileName: string,
  contentType: string
): Promise<string> {
  // Validate PUBLIC_URL is set before attempting upload
  if (!PUBLIC_URL || PUBLIC_URL.trim() === "") {
    throw new Error("R2_PUBLIC_URL environment variable is not set. Please configure your R2 public URL.");
  }

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
      // Note: Public access is configured at the bucket level in Cloudflare R2
      // No ACL parameter needed - bucket must be set to public access in R2 settings
    });

    await s3Client.send(command);

    // Return the public URL (ensure it's a full URL with protocol)
    // Remove any leading slash from fileName to avoid double slashes
    const cleanFileName = fileName.startsWith("/") ? fileName.slice(1) : fileName;
    let imageUrl = `${PUBLIC_URL}/${cleanFileName}`;
    
    // Ensure the URL starts with http:// or https://
    if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
      imageUrl = `https://${imageUrl}`;
    }
    
    console.log(`Image uploaded successfully to R2: ${imageUrl}`);
    return imageUrl;
  } catch (error) {
    console.error("R2 upload error:", error);
    throw new Error(`Failed to upload image to R2: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Delete an image from R2
 * @param fileName - The file name/key to delete
 */
export async function deleteImageFromR2(fileName: string): Promise<void> {
  try {
    if (!fileName || fileName.trim() === "") {
      throw new Error("File name/key is required for deletion");
    }

    console.log(`Attempting to delete image from R2: ${fileName}`);
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    await s3Client.send(command);
    console.log(`Successfully deleted image from R2: ${fileName}`);
  } catch (error) {
    console.error(`R2 delete error for key "${fileName}":`, error);
    throw new Error(`Failed to delete image from R2: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Check if a URL is from R2
 * @param url - The URL to check
 * @returns True if the URL is from R2
 */
export function isR2Url(url: string): boolean {
  if (!url || !PUBLIC_URL) return false;
  
  try {
    // Normalize URLs by removing protocol
    const normalizedUrl = url.replace(/^https?:\/\//, "");
    const normalizedPublicUrl = PUBLIC_URL.replace(/^https?:\/\//, "");
    
    return normalizedUrl.startsWith(normalizedPublicUrl) || normalizedUrl.includes(normalizedPublicUrl);
  } catch {
    return false;
  }
}

/**
 * Extract the file key from an R2 URL
 * @param url - The full R2 URL
 * @returns The file key/name
 */
export function extractKeyFromR2Url(url: string): string {
  if (!url || url.trim() === "") {
    throw new Error("URL is required");
  }

  try {
    const urlObj = new URL(url);
    const key = urlObj.pathname.slice(1); // Remove leading slash
    
    if (!key || key.trim() === "") {
      throw new Error("Invalid R2 URL: no path found");
    }
    
    return key;
  } catch (error) {
    // If it's not a full URL, assume it's already a key
    if (error instanceof TypeError) {
      // Not a valid URL, treat as key
      return url;
    }
    throw error;
  }
}
