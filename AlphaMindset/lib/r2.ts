import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

if (!process.env.CLOUDFLARE_ACCOUNT_ID) {
  throw new Error('CLOUDFLARE_ACCOUNT_ID is not set');
}

if (!process.env.CLOUDFLARE_ACCESS_KEY_ID) {
  throw new Error('CLOUDFLARE_ACCESS_KEY_ID is not set');
}

if (!process.env.CLOUDFLARE_SECRET_ACCESS_KEY) {
  throw new Error('CLOUDFLARE_SECRET_ACCESS_KEY is not set');
}

// Initialize S3 client for Cloudflare R2
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.CLOUDFLARE_BUCKET_NAME || 'uploads';
const PUBLIC_DOMAIN = process.env.CLOUDFLARE_PUBLIC_DOMAIN;

export interface UploadResult {
  key: string;
  url: string;
  size: number;
}

/**
 * Upload a file to Cloudflare R2
 */
export async function uploadFile(
  file: Buffer,
  key: string,
  contentType: string
): Promise<UploadResult> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await r2Client.send(command);

  const url = PUBLIC_DOMAIN
    ? `https://${PUBLIC_DOMAIN}/${key}`
    : `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET_NAME}/${key}`;

  return {
    key,
    url,
    size: file.length,
  };
}

/**
 * Delete a file from Cloudflare R2
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * Generate a unique key for a file
 */
export function generateFileKey(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  if (prefix) {
    return `${prefix}/${timestamp}-${randomString}-${sanitizedName}`;
  }
  
  return `${timestamp}-${randomString}-${sanitizedName}`;
}

/**
 * Extract key from URL
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    // Remove leading slash
    return pathname.startsWith('/') ? pathname.substring(1) : pathname;
  } catch {
    return null;
  }
}
