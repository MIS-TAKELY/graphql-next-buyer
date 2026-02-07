import { uploadToCloudinaryWithRotation } from './cloudinary-rotation';

/**
 * Upload to Cloudinary with automatic account rotation
 * 
 * This function now uses a pool of 5 Cloudinary accounts to distribute
 * uploads and prevent quota exhaustion on any single account.
 */
export const uploadToCloudinary = async (
  file: File,
  resourceType: "image" | "video" | "raw" | "auto" = "auto"
) => {
  return uploadToCloudinaryWithRotation(file, resourceType);
};
