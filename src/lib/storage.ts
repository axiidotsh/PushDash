import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../env';

/**
 * S3-compatible storage client for file operations
 * Works with AWS S3, Railway Object Storage, MinIO, etc.
 */
const s3Client = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Required for S3-compatible services
});

const BUCKET = env.S3_BUCKET;

/**
 * Generate a unique storage key for a file
 */
export function generateStorageKey(userId: string, filename: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${userId}/${timestamp}-${randomSuffix}-${sanitizedFilename}`;
}

/**
 * Upload a file to S3 storage
 */
export async function uploadFile(
  storageKey: string,
  buffer: Buffer,
  mimeType: string
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: storageKey,
    Body: buffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);
}

/**
 * Get a file from S3 storage as a buffer
 */
export async function getFile(storageKey: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: storageKey,
  });

  const response = await s3Client.send(command);

  if (!response.Body) {
    throw new Error('File not found');
  }

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Generate a signed URL for file download
 * @param storageKey - The S3 object key
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @param filename - Optional filename for Content-Disposition header
 */
export async function getSignedDownloadUrl(
  storageKey: string,
  expiresIn: number = 3600,
  filename?: string
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: storageKey,
    ...(filename && {
      ResponseContentDisposition: `attachment; filename="${filename}"`,
    }),
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generate a signed URL for file viewing (inline display)
 */
export async function getSignedViewUrl(
  storageKey: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: storageKey,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete a file from S3 storage
 */
export async function deleteFile(storageKey: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: storageKey,
  });

  await s3Client.send(command);
}

export { s3Client, BUCKET };
