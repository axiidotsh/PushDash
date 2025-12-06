'use client';

import { createFileRoute } from '@tanstack/react-router';

import { useFiles } from '@/hooks/use-files';
import { useFileFilters } from '@/hooks/use-file-filters';
import { FileList, FilterBar } from '@/components/dashboard';
import { getAllTags } from '@/lib/mock-data';

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
  const availableTags = getAllTags();

  const files = data?.files ?? [];
  const total = data?.total ?? 0;

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
        onPreview={(file) => console.log('Preview:', file.filename)}
        onDownload={(file) => console.log('Download:', file.filename)}
        onShare={(file) => console.log('Share:', file.filename)}
        onDelete={(file) => console.log('Delete:', file.filename)}
        onClearFilters={clearFilters}
      />
    </div>
  );
}
