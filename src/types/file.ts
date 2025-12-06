/**
 * File types for PushDash
 * These types are used for the dashboard file management
 */

/**
 * Visibility enum for file access control
 */
export type Visibility = 'PUBLIC' | 'PRIVATE';

/**
 * File type categories for filtering and icons
 */
export type FileType = 'text' | 'image' | 'pdf' | 'code' | 'other';

/**
 * File record from the database
 */
export interface File {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  visibility: Visibility;
  tags: string[];
  message: string | null;
  s3Key: string;
  uploadedAt: Date;
  updatedAt: Date;
  userId: string;
}

/**
 * File with user info for display
 */
export interface FileWithUser extends File {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Paginated file list response
 */
export interface FileListResponse {
  files: File[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * File list query parameters
 */
export interface FileListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  visibility?: Visibility;
  fileType?: FileType;
  tags?: string[];
  sortBy?: 'uploadedAt' | 'filename' | 'size';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Helper to determine file type from MIME type
 */
export function getFileType(mimeType: string): FileType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (
    mimeType.startsWith('text/') ||
    mimeType === 'application/json' ||
    mimeType === 'application/xml'
  ) {
    // Check for code files
    if (
      mimeType.includes('javascript') ||
      mimeType.includes('typescript') ||
      mimeType.includes('python') ||
      mimeType.includes('html') ||
      mimeType.includes('css') ||
      mimeType.includes('xml') ||
      mimeType === 'application/json'
    ) {
      return 'code';
    }
    return 'text';
  }
  return 'other';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
