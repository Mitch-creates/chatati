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

/**
 * Get the bucket name based on environment
 * Development uses R2_BUCKET_NAME_DEV or falls back to R2_BUCKET_NAME with -dev suffix
 * Production uses R2_BUCKET_NAME
 */
function getBucketName(): string {
  const isDevelopment = process.env.NODE_ENV === "development";
  
  if (isDevelopment && process.env.R2_BUCKET_NAME_DEV) {
    return process.env.R2_BUCKET_NAME_DEV;
  }
  
  if (isDevelopment && process.env.R2_BUCKET_NAME) {
    // Fallback: use production bucket name with -dev suffix if dev bucket not specified
    return `${process.env.R2_BUCKET_NAME}-dev`;
  }
  
  return process.env.R2_BUCKET_NAME!;
}

/**
 * Get the public URL based on environment
 */
function getPublicUrl(): string {
  const isDevelopment = process.env.NODE_ENV === "development";
  
  if (isDevelopment && process.env.R2_PUBLIC_URL_DEV) {
    return process.env.R2_PUBLIC_URL_DEV;
  }
  
  return process.env.R2_PUBLIC_URL!;
}

const BUCKET_NAME = getBucketName();
const PUBLIC_URL = getPublicUrl();

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
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: file,
    ContentType: contentType,
    // Note: Public access is configured at the bucket level in Cloudflare R2
    // No ACL parameter needed - bucket must be set to public access in R2 settings
  });

  await s3Client.send(command);

  // Return the public URL
  return `${PUBLIC_URL}/${fileName}`;
}

/**
 * Delete an image from R2
 * @param fileName - The file name/key to delete
 */
export async function deleteImageFromR2(fileName: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
  });

  await s3Client.send(command);
}

/**
 * Extract the file key from an R2 URL
 * @param url - The full R2 URL
 * @returns The file key/name
 */
export function extractKeyFromR2Url(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.slice(1); // Remove leading slash
  } catch {
    // If it's not a full URL, assume it's already a key
    return url;
  }
}
