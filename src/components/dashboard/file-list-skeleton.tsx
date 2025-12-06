'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface FileListSkeletonProps {
  view?: 'grid' | 'list';
  count?: number;
}

export function FileListSkeleton({
  view = 'grid',
  count = 6,
}: FileListSkeletonProps) {
  if (view === 'list') {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <FileRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <FileCardSkeleton key={i} />
      ))}
    </div>
  );
}

function FileCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
        <Skeleton className="mb-1 h-4 w-3/4" />
        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function FileRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg px-4 py-3">
      <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <Skeleton className="mb-1 h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="hidden items-center gap-1.5 lg:flex">
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>
      <Skeleton className="hidden h-3 w-16 md:block" />
      <Skeleton className="hidden h-3 w-20 sm:block" />
      <Skeleton className="hidden h-5 w-16 rounded-full sm:block" />
    </div>
  );
}
