'use client';

import { useQuery } from '@tanstack/react-query';
import type {
  File,
  FileListParams,
  FileListResponse,
  Visibility,
} from '@/types/file';

export const filesQueryKey = ['files'] as const;

export function createFilesQueryKey(params?: FileListParams) {
  return params ? [...filesQueryKey, params] : filesQueryKey;
}

/**
 * Map frontend FileType to MIME type prefix for API filtering
 */
function fileTypeToMimePrefix(fileType: string): string {
  switch (fileType) {
    case 'image':
      return 'image/';
    case 'pdf':
      return 'application/pdf';
    case 'text':
      return 'text/';
    case 'code':
      return 'text/'; // Code files are typically text/*
    default:
      return '';
  }
}

/**
 * Map frontend sort field to backend sort field
 */
function mapSortField(sortBy: string): string {
  if (sortBy === 'uploadedAt') {
    return 'createdAt';
  }
  return sortBy;
}

/**
 * API response type from the backend
 */
interface ApiFileResponse {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  type: string;
  size: number;
  tag: string | null;
  message: string | null;
  isPublic: boolean;
  url: string;
  downloadUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiFilesResponse {
  files: ApiFileResponse[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Transform API file response to frontend File type
 */
function transformFile(apiFile: ApiFileResponse): File {
  return {
    id: apiFile.id,
    filename: apiFile.filename,
    originalName: apiFile.originalName,
    size: apiFile.size,
    mimeType: apiFile.mimeType,
    visibility: (apiFile.isPublic ? 'PUBLIC' : 'PRIVATE') as Visibility,
    tags: apiFile.tag ? [apiFile.tag] : [],
    message: apiFile.message,
    s3Key: `files/${apiFile.id}`, // Placeholder - we have url/downloadUrl instead
    uploadedAt: new Date(apiFile.createdAt),
    updatedAt: new Date(apiFile.updatedAt),
    userId: '', // Not returned by API, not needed for display
  };
}

/**
 * Fetch files from the API
 */
async function fetchFiles(params?: FileListParams): Promise<FileListResponse> {
  const searchParams = new URLSearchParams();

  // Map pagination
  if (params?.page) {
    searchParams.set('page', params.page.toString());
  }
  if (params?.pageSize) {
    searchParams.set('limit', params.pageSize.toString());
  }

  // Map sorting
  if (params?.sortBy) {
    searchParams.set('sortBy', mapSortField(params.sortBy));
  }
  if (params?.sortOrder) {
    searchParams.set('sortOrder', params.sortOrder);
  }

  // Map search
  if (params?.search) {
    searchParams.set('search', params.search);
  }

  // Map file type to MIME prefix
  if (params?.fileType) {
    const mimePrefix = fileTypeToMimePrefix(params.fileType);
    if (mimePrefix) {
      searchParams.set('mimeType', mimePrefix);
    }
  }

  // Map tags (backend only supports single tag)
  if (params?.tags && params.tags.length > 0) {
    searchParams.set('tag', params.tags[0]);
  }

  // Map visibility
  if (params?.visibility) {
    searchParams.set('isPublic', (params.visibility === 'PUBLIC').toString());
  }

  const url = `/api/files${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url, {
    credentials: 'include', // Include cookies for auth
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated');
    }
    throw new Error('Failed to fetch files');
  }

  const data: ApiFilesResponse = await response.json();

  return {
    files: data.files.map(transformFile),
    total: data.total,
    page: data.pagination.page,
    pageSize: data.pagination.limit,
    totalPages: data.pagination.totalPages,
  };
}

/**
 * Hook to fetch user's files with filtering and pagination
 * Polls every 10 seconds for new uploads
 */
export function useFiles(params?: FileListParams) {
  return useQuery({
    queryKey: createFilesQueryKey(params),
    queryFn: () => fetchFiles(params),
    staleTime: 1000 * 10, // 10 seconds
    refetchInterval: 1000 * 10, // Poll every 10 seconds
  });
}

/**
 * API response type for single file
 */
interface ApiSingleFileResponse {
  file: ApiFileResponse & {
    shareUrl?: string;
    isOwner: boolean;
  };
}

/**
 * Fetch a single file from the API
 */
async function fetchFile(fileId: string): Promise<File | null> {
  const response = await fetch(`/api/files/${fileId}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    if (response.status === 401) {
      throw new Error('Not authenticated');
    }
    throw new Error('Failed to fetch file');
  }

  const data: ApiSingleFileResponse = await response.json();
  return transformFile(data.file);
}

/**
 * Hook to fetch a single file by ID
 */
export function useFile(fileId: string | undefined) {
  return useQuery({
    queryKey: ['file', fileId],
    queryFn: () => fetchFile(fileId!),
    enabled: !!fileId,
    staleTime: 1000 * 60,
  });
}

/**
 * Extract unique tags from a list of files
 */
export function extractTagsFromFiles(files: File[]): string[] {
  const tagSet = new Set<string>();
  files.forEach((file) => {
    file.tags.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}
