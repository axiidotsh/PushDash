'use client';

import { createFileRoute } from '@tanstack/react-router';
import { FolderOpen } from 'lucide-react';

import { useFiles } from '@/hooks/use-files';
import { FileList } from '@/components/dashboard/file-list';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
});

function DashboardPage() {
  const { data, isLoading } = useFiles();

  const files = data?.files ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Your Files</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isLoading
              ? 'Loading...'
              : total > 0
                ? `${total} file${total !== 1 ? 's' : ''} uploaded`
                : 'No files yet'}
          </p>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <div className="text-muted-foreground flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
            <FolderOpen className="h-4 w-4" />
            <span>{isLoading ? '-' : total} files</span>
          </div>
        </div>
      </div>

      <FileList
        files={files}
        isLoading={isLoading}
        isEmpty={!isLoading && total === 0}
        onPreview={(file) => console.log('Preview:', file.filename)}
        onDownload={(file) => console.log('Download:', file.filename)}
        onShare={(file) => console.log('Share:', file.filename)}
        onDelete={(file) => console.log('Delete:', file.filename)}
      />
    </div>
  );
}
