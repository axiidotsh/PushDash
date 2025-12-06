'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Search,
  X,
  Calendar as CalendarIcon,
  Tag,
  FileType,
  ArrowUpDown,
} from 'lucide-react';

import type {
  FileType as FileTypeValue,
  FileSortField,
  FileSortOrder,
} from '@/types/file';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  search: string;
  fileType: FileTypeValue | undefined;
  selectedTags: string[];
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  sortBy: FileSortField;
  sortOrder: FileSortOrder;
  availableTags: string[];
  onSearchChange: (search: string) => void;
  onFileTypeChange: (fileType: FileTypeValue | undefined) => void;
  onToggleTag: (tag: string) => void;
  onDateRangeChange: (from: Date | undefined, to: Date | undefined) => void;
  onSortChange: (sortBy: FileSortField, sortOrder: FileSortOrder) => void;
}

const fileTypeOptions: { value: FileTypeValue; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
  { value: 'pdf', label: 'PDF' },
  { value: 'code', label: 'Code' },
  { value: 'other', label: 'Other' },
];

const sortOptions: {
  value: `${FileSortField}-${FileSortOrder}`;
  label: string;
}[] = [
  { value: 'uploadedAt-desc', label: 'Newest first' },
  { value: 'uploadedAt-asc', label: 'Oldest first' },
  { value: 'filename-asc', label: 'Name A-Z' },
  { value: 'filename-desc', label: 'Name Z-A' },
  { value: 'size-desc', label: 'Largest first' },
  { value: 'size-asc', label: 'Smallest first' },
];

export function FilterBar({
  search,
  fileType,
  selectedTags,
  dateFrom,
  dateTo,
  sortBy,
  sortOrder,
  availableTags,
  onSearchChange,
  onFileTypeChange,
  onToggleTag,
  onDateRangeChange,
  onSortChange,
}: FilterBarProps) {
  const [searchInput, setSearchInput] = useState(search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, onSearchChange]);

  // Sync external search changes
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const handleSortChange = (value: string) => {
    const [field, order] = value.split('-') as [FileSortField, FileSortOrder];
    onSortChange(field, order);
  };

  const formatDateRange = () => {
    if (dateFrom && dateTo) {
      return `${format(dateFrom, 'MMM d')} - ${format(dateTo, 'MMM d')}`;
    }
    if (dateFrom) {
      return `From ${format(dateFrom, 'MMM d')}`;
    }
    if (dateTo) {
      return `Until ${format(dateTo, 'MMM d')}`;
    }
    return 'Date';
  };

  return (
    <div className="flex items-center gap-2">
      {/* Search Input */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="Search files..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-56 pr-9 pl-9"
        />
        {searchInput && (
          <button
            onClick={() => setSearchInput('')}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* File Type Filter */}
      <Select
        value={fileType || 'all'}
        onValueChange={(value) =>
          onFileTypeChange(
            value === 'all' ? undefined : (value as FileTypeValue)
          )
        }
      >
        <SelectTrigger>
          <FileType className="text-muted-foreground" />
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {fileTypeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Tag Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(selectedTags.length > 0 && 'border-primary')}
          >
            <Tag className="text-muted-foreground" />
            Tags
            {selectedTags.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedTags.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start">
          <div className="max-h-[200px] space-y-1 overflow-y-auto">
            {availableTags.length === 0 ? (
              <p className="text-muted-foreground py-2 text-center text-sm">
                No tags available
              </p>
            ) : (
              availableTags.map((tag) => (
                <div key={tag} className="flex items-center gap-2 py-1">
                  <Checkbox
                    id={`tag-${tag}`}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => onToggleTag(tag)}
                  />
                  <Label
                    htmlFor={`tag-${tag}`}
                    className="flex-1 cursor-pointer text-sm"
                  >
                    {tag}
                  </Label>
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Date Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn((dateFrom || dateTo) && 'border-primary')}
          >
            <CalendarIcon className="text-muted-foreground" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{ from: dateFrom, to: dateTo }}
            onSelect={(range) => onDateRangeChange(range?.from, range?.to)}
            numberOfMonths={1}
          />
          {(dateFrom || dateTo) && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => onDateRangeChange(undefined, undefined)}
              >
                Clear dates
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Sort Control */}
      <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
        <SelectTrigger>
          <ArrowUpDown className="text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
