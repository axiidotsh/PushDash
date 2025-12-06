'use client';

import { useQuery } from '@tanstack/react-query';
import type { File, FileListParams, FileListResponse } from '@/types/file';
import { mockFiles } from '@/lib/mock-data';

export const filesQueryKey = ['files'] as const;

export function createFilesQueryKey(params?: FileListParams) {
  return params ? [...filesQueryKey, params] : filesQueryKey;
}

function delay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function filterAndSortFiles(
  files: File[],
  params?: FileListParams
): FileListResponse {
  let filtered = [...files];

  if (params?.search) {
    const search = params.search.toLowerCase();
    filtered = filtered.filter(
      (f) =>
        f.filename.toLowerCase().includes(search) ||
        f.tags.some((t) => t.toLowerCase().includes(search)) ||
        f.message?.toLowerCase().includes(search)
    );
  }

  if (params?.visibility) {
    filtered = filtered.filter((f) => f.visibility === params.visibility);
  }

  if (params?.tags && params.tags.length > 0) {
    filtered = filtered.filter((f) =>
      params.tags!.some((tag) => f.tags.includes(tag))
    );
  }

  const sortBy = params?.sortBy || 'uploadedAt';
  const sortOrder = params?.sortOrder || 'desc';

  filtered.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'filename':
        comparison = a.filename.localeCompare(b.filename);
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'uploadedAt':
      default:
        comparison = a.uploadedAt.getTime() - b.uploadedAt.getTime();
        break;
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const startIndex = (page - 1) * pageSize;
  const paginatedFiles = filtered.slice(startIndex, startIndex + pageSize);

  return {
    files: paginatedFiles,
    total: filtered.length,
    page,
    pageSize,
    totalPages: Math.ceil(filtered.length / pageSize),
  };
}

export function useFiles(params?: FileListParams) {
  return useQuery({
    queryKey: createFilesQueryKey(params),
    queryFn: async (): Promise<FileListResponse> => {
      await delay(300);
      return filterAndSortFiles(mockFiles, params);
    },
    staleTime: 1000 * 60,
  });
}

export function useFile(fileId: string | undefined) {
  return useQuery({
    queryKey: ['file', fileId],
    queryFn: async (): Promise<File | null> => {
      if (!fileId) return null;
      await delay(200);
      return mockFiles.find((f) => f.id === fileId) || null;
    },
    enabled: !!fileId,
    staleTime: 1000 * 60,
  });
}
