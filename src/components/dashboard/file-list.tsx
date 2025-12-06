'use client';

import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { File } from '@/types/file';
import { Button } from '@/components/ui/button';
import { FileCard } from './file-card';
import { FileRow } from './file-row';
import { FileListSkeleton } from './file-list-skeleton';
import { EmptyFiles } from './empty-files';

type ViewMode = 'grid' | 'list';

interface FileListProps {
  files: File[];
  isLoading?: boolean;
  isEmpty?: boolean;
  searchQuery?: string;
  onPreview?: (file: File) => void;
  onDownload?: (file: File) => void;
  onShare?: (file: File) => void;
  onDelete?: (file: File) => void;
  onClearFilters?: () => void;
}

export function FileList({
  files,
  isLoading,
  isEmpty,
  searchQuery,
  onPreview,
  onDownload,
  onShare,
  onDelete,
  onClearFilters,
}: FileListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        <FileListSkeleton view={viewMode} count={viewMode === 'grid' ? 8 : 5} />
      </div>
    );
  }

  if (isEmpty && files.length === 0) {
    return <EmptyFiles variant="no-files" />;
  }

  if (files.length === 0) {
    return (
      <EmptyFiles
        variant="no-results"
        searchQuery={searchQuery}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <div className="space-y-4">
      <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {files.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onPreview={onPreview}
              onDownload={onDownload}
              onShare={onShare}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          <div className="text-muted-foreground flex items-center gap-4 px-4 py-2 text-xs font-medium">
            <div className="w-9 shrink-0" />
            <div className="min-w-0 flex-1">Name</div>
            <div className="hidden w-20 shrink-0 lg:block">Tags</div>
            <div className="hidden w-20 shrink-0 text-right md:block">Size</div>
            <div className="hidden w-28 shrink-0 text-right sm:block">
              Uploaded
            </div>
            <div className="hidden w-20 shrink-0 sm:block">Visibility</div>
            <div className="w-8" />
          </div>

          {files.map((file) => (
            <FileRow
              key={file.id}
              file={file}
              onPreview={onPreview}
              onDownload={onDownload}
              onShare={onShare}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center justify-end">
      <div className="flex items-center rounded-lg border p-0.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange('grid')}
          className={cn(
            'h-7 w-7 p-0',
            viewMode === 'grid'
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-transparent'
          )}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange('list')}
          className={cn(
            'h-7 w-7 p-0',
            viewMode === 'list'
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-transparent'
          )}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
