'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  FileText,
  Image,
  FileCode,
  FileType as FileTypeIcon,
  Lock,
  Globe,
  MoreHorizontal,
  Download,
  Share2,
  Trash2,
} from 'lucide-react';

import type { File } from '@/types/file';
import { getFileType, formatFileSize } from '@/types/file';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileListSkeleton } from './file-list-skeleton';
import { EmptyFiles } from './empty-files';

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

const fileTypeIcons = {
  text: FileText,
  image: Image,
  pdf: FileText,
  code: FileCode,
  other: FileTypeIcon,
};

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
  if (isLoading) {
    return <FileListSkeleton count={5} />;
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
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[40%]">Name</TableHead>
            <TableHead className="hidden w-[10%] md:table-cell">Size</TableHead>
            <TableHead className="hidden w-[12%] sm:table-cell">
              Visibility
            </TableHead>
            <TableHead className="hidden w-[15%] lg:table-cell">Tags</TableHead>
            <TableHead className="hidden w-[15%] sm:table-cell">
              Uploaded
            </TableHead>
            <TableHead className="w-[8%]">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => {
            const fileType = getFileType(file.mimeType);
            const Icon = fileTypeIcons[fileType];

            return (
              <TableRow
                key={file.id}
                className="cursor-pointer"
                onClick={() => onPreview?.(file)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                      <Icon className="text-muted-foreground h-4 w-4" />
                    </div>
                    <span className="truncate font-medium">
                      {file.filename}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground hidden md:table-cell">
                  {formatFileSize(file.size)}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge
                    variant={
                      file.visibility === 'PUBLIC' ? 'default' : 'secondary'
                    }
                    className="gap-1"
                  >
                    {file.visibility === 'PUBLIC' ? (
                      <Globe className="h-3 w-3" />
                    ) : (
                      <Lock className="h-3 w-3" />
                    )}
                    {file.visibility === 'PUBLIC' ? 'Public' : 'Private'}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {file.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {file.tags.length > 2 && (
                      <span className="text-muted-foreground text-xs">
                        +{file.tags.length - 2}
                      </span>
                    )}
                    {file.tags.length === 0 && (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground hidden sm:table-cell">
                  {formatDistanceToNow(new Date(file.uploadedAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-40"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenuItem
                        onClick={() => onDownload?.(file)}
                        className="cursor-pointer"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onShare?.(file)}
                        className="cursor-pointer"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete?.(file)}
                        className="text-destructive focus:text-destructive cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
