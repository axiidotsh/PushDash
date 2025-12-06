'use client';

import { createFileRoute } from '@tanstack/react-router';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Your Files
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isLoading
            ? 'Loading...'
            : total > 0
              ? `${total} file${total !== 1 ? 's' : ''} uploaded`
              : 'No files uploaded yet'}
        </p>
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
