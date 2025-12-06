'use client';

import { useMemo, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  useFiles,
  useDeleteFile,
  extractTagsFromFiles,
  createFilesQueryKey,
} from '@/hooks/use-files';
import { useFileFilters } from '@/hooks/use-file-filters';
import { FileList, FilterBar, DeleteFileDialog } from '@/components/dashboard';
import type { File } from '@/types/file';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
});

function DashboardPage() {
  const {
    filters,
    queryParams,
    setSearch,
    setFileType,
    toggleTag,
    setDateRange,
    setSort,
    clearFilters,
    hasActiveFilters,
  } = useFileFilters();

  const { data, isLoading } = useFiles(queryParams);
  const queryClient = useQueryClient();
  const deleteFileMutation = useDeleteFile();

  const navigate = useNavigate();
  const [fileToDelete, setFileToDelete] = useState<File | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const files = data?.files ?? [];
  const total = data?.total ?? 0;

  // Derive available tags from the fetched files
  const availableTags = useMemo(() => extractTagsFromFiles(files), [files]);

  const handleDeleteClick = (file: File) => {
    setFileToDelete(file);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;

    try {
      await deleteFileMutation.mutateAsync(fileToDelete.id);

      // Invalidate files query to refresh the list
      queryClient.invalidateQueries({
        queryKey: createFilesQueryKey(queryParams),
      });

      // Also invalidate the individual file query if it exists
      queryClient.invalidateQueries({
        queryKey: ['file', fileToDelete.id],
      });

      toast.success('File deleted successfully', {
        description: `${fileToDelete.filename} has been deleted.`,
      });

      setIsDeleteDialogOpen(false);
      setFileToDelete(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete file';
      toast.error('Failed to delete file', {
        description: errorMessage,
      });
    }
  };

  const handleDownload = async (file: File) => {
    try {
      // Construct download URL
      const downloadUrl = `/api/files/${file.id}/download`;

      // Create temporary anchor element to trigger download
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = file.filename;
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      toast.success('Download started', {
        description: `Downloading ${file.filename}`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to download file';
      toast.error('Failed to download file', {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-foreground text-lg font-semibold tracking-tight">
            Your Files
          </h1>
          {!isLoading && (
            <span className="bg-muted text-muted-foreground flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium">
              {total}
            </span>
          )}
        </div>

        <FilterBar
          search={filters.search}
          fileType={filters.fileType}
          selectedTags={filters.tags}
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          availableTags={availableTags}
          onSearchChange={setSearch}
          onFileTypeChange={setFileType}
          onToggleTag={toggleTag}
          onDateRangeChange={setDateRange}
          onSortChange={setSort}
        />
      </div>

      <FileList
        files={files}
        isLoading={isLoading}
        isEmpty={!isLoading && !hasActiveFilters && total === 0}
        searchQuery={filters.search}
        onPreview={(file) =>
          navigate({ to: '/dashboard/files/$id', params: { id: file.id } })
        }
        onDownload={handleDownload}
        onDelete={handleDeleteClick}
        onClearFilters={clearFilters}
      />

      <DeleteFileDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        file={fileToDelete}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteFileMutation.isPending}
      />
    </div>
  );
}
