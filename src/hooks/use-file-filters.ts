'use client';

import { useState, useCallback, useMemo } from 'react';
import type {
  FileType,
  FileSortField,
  FileSortOrder,
  FileListParams,
} from '@/types/file';

export interface FileFilters {
  search: string;
  fileType: FileType | undefined;
  tags: string[];
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  sortBy: FileSortField;
  sortOrder: FileSortOrder;
}

const defaultFilters: FileFilters = {
  search: '',
  fileType: undefined,
  tags: [],
  dateFrom: undefined,
  dateTo: undefined,
  sortBy: 'uploadedAt',
  sortOrder: 'desc',
};

export function useFileFilters() {
  const [filters, setFilters] = useState<FileFilters>(defaultFilters);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setFileType = useCallback((fileType: FileType | undefined) => {
    setFilters((prev) => ({ ...prev, fileType }));
  }, []);

  const setTags = useCallback((tags: string[]) => {
    setFilters((prev) => ({ ...prev, tags }));
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  }, []);

  const setDateFrom = useCallback((dateFrom: Date | undefined) => {
    setFilters((prev) => ({ ...prev, dateFrom }));
  }, []);

  const setDateTo = useCallback((dateTo: Date | undefined) => {
    setFilters((prev) => ({ ...prev, dateTo }));
  }, []);

  const setDateRange = useCallback(
    (dateFrom: Date | undefined, dateTo: Date | undefined) => {
      setFilters((prev) => ({ ...prev, dateFrom, dateTo }));
    },
    []
  );

  const setSortBy = useCallback((sortBy: FileSortField) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  }, []);

  const setSortOrder = useCallback((sortOrder: FileSortOrder) => {
    setFilters((prev) => ({ ...prev, sortOrder }));
  }, []);

  const setSort = useCallback(
    (sortBy: FileSortField, sortOrder: FileSortOrder) => {
      setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.fileType) count++;
    if (filters.tags.length > 0) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  // Convert to FileListParams format for useFiles hook
  const queryParams: FileListParams = useMemo(
    () => ({
      search: filters.search || undefined,
      fileType: filters.fileType,
      tags: filters.tags.length > 0 ? filters.tags : undefined,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }),
    [filters]
  );

  return {
    filters,
    queryParams,
    setSearch,
    setFileType,
    setTags,
    toggleTag,
    setDateFrom,
    setDateTo,
    setDateRange,
    setSortBy,
    setSortOrder,
    setSort,
    clearFilters,
    activeFilterCount,
    hasActiveFilters,
  };
}
