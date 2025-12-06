'use client';

import { FolderOpen, Search } from 'lucide-react';

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty';
import { Button } from '@/components/ui/button';

interface EmptyFilesProps {
  variant?: 'no-files' | 'no-results';
  searchQuery?: string;
  onClearFilters?: () => void;
}

export function EmptyFiles({
  variant = 'no-files',
  searchQuery,
  onClearFilters,
}: EmptyFilesProps) {
  if (variant === 'no-results') {
    return (
      <Empty className="min-h-[400px] border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Search className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>No files found</EmptyTitle>
          <EmptyDescription>
            {searchQuery
              ? `No files match "${searchQuery}". Try adjusting your search or filters.`
              : 'No files match your current filters. Try adjusting them.'}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {onClearFilters && (
            <Button variant="outline" onClick={onClearFilters}>
              Clear filters
            </Button>
          )}
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Empty className="min-h-[400px] border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpen className="h-6 w-6" />
        </EmptyMedia>
        <EmptyTitle>No files yet</EmptyTitle>
        <EmptyDescription>
          Get started by uploading your first file using the CLI.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="bg-muted rounded-lg border p-4">
          <code className="text-muted-foreground text-sm">
            <span className="text-foreground">$</span> pushdash push ./file.pdf
          </code>
        </div>
      </EmptyContent>
    </Empty>
  );
}
