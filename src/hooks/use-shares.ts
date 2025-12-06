'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  FileShare,
  FileSharesResponse,
  AddSharesResponse,
  RemoveShareResponse,
} from '@/types/share';

/**
 * Query key factory for file shares
 */
export const fileSharesQueryKey = (fileId: string) => ['file-shares', fileId];

/**
 * Fetch file shares from the API
 */
async function fetchFileShares(fileId: string): Promise<FileSharesResponse> {
  const response = await fetch(`/api/files/${fileId}/shares`, {
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated');
    }
    if (response.status === 403) {
      throw new Error(
        'You do not have permission to view shares for this file'
      );
    }
    if (response.status === 404) {
      throw new Error('File not found');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch file shares');
  }

  return response.json();
}

/**
 * Hook to fetch shares for a specific file
 */
export function useFileShares(fileId: string | undefined) {
  return useQuery({
    queryKey: fileSharesQueryKey(fileId!),
    queryFn: () => fetchFileShares(fileId!),
    enabled: !!fileId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Add email shares to a file
 */
async function addShareEmails(
  fileId: string,
  emails: string[]
): Promise<AddSharesResponse> {
  const response = await fetch(`/api/files/${fileId}/shares`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ emails }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated');
    }
    if (response.status === 403) {
      throw new Error('You do not have permission to share this file');
    }
    if (response.status === 404) {
      throw new Error('File not found');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to add shares');
  }

  return response.json();
}

/**
 * Hook to add email shares to a file
 */
export function useAddShareEmails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, emails }: { fileId: string; emails: string[] }) =>
      addShareEmails(fileId, emails),
    onSuccess: (data, variables) => {
      // Update the cache with the new shares list
      queryClient.setQueryData(
        fileSharesQueryKey(variables.fileId),
        (old: FileSharesResponse | undefined) => ({
          shares: data.shares,
          total: data.shares.length,
        })
      );
    },
  });
}

/**
 * Remove an email share from a file
 */
async function removeShareEmail(
  fileId: string,
  email: string
): Promise<RemoveShareResponse> {
  const response = await fetch(`/api/files/${fileId}/shares`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not authenticated');
    }
    if (response.status === 403) {
      throw new Error(
        'You do not have permission to modify shares for this file'
      );
    }
    if (response.status === 404) {
      throw new Error('Share not found');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to remove share');
  }

  return response.json();
}

/**
 * Hook to remove an email share from a file
 */
export function useRemoveShareEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, email }: { fileId: string; email: string }) =>
      removeShareEmail(fileId, email),
    onSuccess: (data, variables) => {
      // Update the cache with the updated shares list
      queryClient.setQueryData(
        fileSharesQueryKey(variables.fileId),
        (old: FileSharesResponse | undefined) => ({
          shares: data.shares,
          total: data.shares.length,
        })
      );
    },
  });
}
