/**
 * Multi-Cloudinary Account Rotation System
 * 
 * Distributes uploads across 5 Cloudinary accounts using round-robin rotation
 * to prevent quota exhaustion on any single account.
 */

export interface CloudinaryAccount {
    cloudName: string;
    uploadPreset: string;
    index: number;
}

export interface CloudinaryUploadResult {
    url: string;
    publicId: string;
    resourceType: string;
    size: number;
}

const STORAGE_KEY = 'cloudinary_rotation_index';
const ACCOUNT_COUNT = 5;

/**
 * Get the current rotation index from localStorage (browser) or memory (server)
 */
let serverRotationIndex = 0;

function getRotationIndex(): number {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? parseInt(stored, 10) : 0;
    }
    return serverRotationIndex;
}

/**
 * Increment and persist the rotation index
 */
function incrementRotationIndex(): void {
    const current = getRotationIndex();
    const next = (current + 1) % ACCOUNT_COUNT;

    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, next.toString());
    } else {
        serverRotationIndex = next;
    }
}

/**
 * Get the next Cloudinary account in rotation
 */
export function getNextCloudinaryAccount(): CloudinaryAccount {
    const index = getRotationIndex();

    const cloudName = process.env[`NEXT_PUBLIC_CLOUDINARY_ACCOUNT_${index}_NAME`] ||
        process.env[`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME${index === 0 ? '' : index}`];
    const uploadPreset = process.env[`NEXT_PUBLIC_CLOUDINARY_ACCOUNT_${index}_PRESET`] ||
        process.env[`NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET${index === 0 ? '' : index}`];

    if (!cloudName || !uploadPreset) {
        throw new Error(`Cloudinary account ${index} configuration missing`);
    }

    incrementRotationIndex();

    return {
        cloudName,
        uploadPreset,
        index
    };
}

/**
 * Upload to Cloudinary with automatic account rotation and retry
 */
export async function uploadToCloudinaryWithRotation(
    file: File,
    resourceType: "image" | "video" | "raw" | "auto" = "auto",
    maxRetries: number = 3
): Promise<CloudinaryUploadResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const account = getNextCloudinaryAccount();

            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", account.uploadPreset);

            if (process.env.NODE_ENV === 'development') {
                console.log(`[Cloudinary] Uploading to account ${account.index} (${account.cloudName})`);
            }

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${account.cloudName}/${resourceType}/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();

            if (process.env.NODE_ENV === 'development') {
                console.log(`[Cloudinary] Upload successful to account ${account.index}`);
            }

            return {
                url: data.secure_url,
                publicId: data.public_id,
                resourceType: data.resource_type,
                size: data.bytes,
            };
        } catch (error) {
            lastError = error as Error;
            console.error(`[Cloudinary] Upload attempt ${attempt + 1} failed:`, error);

            // If this is the last attempt, throw the error
            if (attempt === maxRetries - 1) {
                break;
            }

            // Wait briefly before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }

    throw new Error(
        `Failed to upload after ${maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`
    );
}
