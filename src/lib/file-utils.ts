import { lookup } from 'mime-types';

/**
 * Maximum file size in bytes (25MB)
 */
export const MAX_FILE_SIZE = 25 * 1024 * 1024;

/**
 * Supported file categories for the MVP
 */
export const FILE_CATEGORIES = {
  TEXT: 'text',
  IMAGE: 'image',
  PDF: 'pdf',
  CODE: 'code',
  OTHER: 'other',
} as const;

export type FileCategory =
  (typeof FILE_CATEGORIES)[keyof typeof FILE_CATEGORIES];

/**
 * MIME types for text-based files
 */
const TEXT_MIME_TYPES = [
  'text/plain',
  'text/markdown',
  'text/csv',
  'text/html',
  'text/css',
  'text/xml',
  'application/json',
  'application/xml',
  'application/javascript',
  'application/typescript',
];

/**
 * MIME types for image files
 */
const IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
];

/**
 * MIME types for PDF files
 */
const PDF_MIME_TYPES = ['application/pdf'];

/**
 * File extensions for code files
 */
const CODE_EXTENSIONS = [
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.py',
  '.rb',
  '.go',
  '.rs',
  '.java',
  '.c',
  '.cpp',
  '.h',
  '.hpp',
  '.cs',
  '.php',
  '.swift',
  '.kt',
  '.scala',
  '.sh',
  '.bash',
  '.zsh',
  '.ps1',
  '.sql',
  '.yaml',
  '.yml',
  '.toml',
  '.ini',
  '.cfg',
  '.conf',
  '.env',
  '.vue',
  '.svelte',
  '.astro',
  '.prisma',
  '.graphql',
  '.proto',
];

/**
 * Detect MIME type from filename
 */
export function getMimeType(filename: string): string {
  const mimeType = lookup(filename);
  return mimeType || 'application/octet-stream';
}

/**
 * Categorize a file based on its MIME type and extension
 */
export function categorizeFile(
  mimeType: string,
  filename: string
): FileCategory {
  // Check for PDF first
  if (PDF_MIME_TYPES.includes(mimeType)) {
    return FILE_CATEGORIES.PDF;
  }

  // Check for images
  if (IMAGE_MIME_TYPES.includes(mimeType) || mimeType.startsWith('image/')) {
    return FILE_CATEGORIES.IMAGE;
  }

  // Check for text files
  if (TEXT_MIME_TYPES.includes(mimeType) || mimeType.startsWith('text/')) {
    return FILE_CATEGORIES.TEXT;
  }

  // Check for code files by extension
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  if (CODE_EXTENSIONS.includes(ext)) {
    return FILE_CATEGORIES.CODE;
  }

  return FILE_CATEGORIES.OTHER;
}

/**
 * Check if a file type is supported for preview
 */
export function isPreviewSupported(
  mimeType: string,
  filename: string
): boolean {
  const category = categorizeFile(mimeType, filename);
  return category !== FILE_CATEGORIES.OTHER;
}

/**
 * Validate file size
 */
export function validateFileSize(size: number): {
  valid: boolean;
  error?: string;
} {
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }
  return { valid: true };
}

/**
 * Sanitize filename for storage
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 255);
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(lastDot).toLowerCase() : '';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
