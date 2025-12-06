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

import { cn } from '@/lib/utils';
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

interface FileRowProps {
  file: File;
  onPreview?: (file: File) => void;
  onDownload?: (file: File) => void;
  onShare?: (file: File) => void;
  onDelete?: (file: File) => void;
}

const fileTypeIcons = {
  text: FileText,
  image: Image,
  pdf: FileText,
  code: FileCode,
  other: FileTypeIcon,
};

export function FileRow({
  file,
  onPreview,
  onDownload,
  onShare,
  onDelete,
}: FileRowProps) {
  const fileType = getFileType(file.mimeType);
  const Icon = fileTypeIcons[fileType];

  return (
    <div
      className={cn(
        'group flex cursor-pointer items-center gap-4 rounded-lg border border-transparent px-4 py-3',
        'hover:border-border hover:bg-accent/50 transition-colors'
      )}
      onClick={() => onPreview?.(file)}
    >
      <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
        <Icon className="text-muted-foreground h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-foreground truncate text-sm font-medium">
          {file.filename}
        </h3>
        {file.message && (
          <p className="text-muted-foreground truncate text-xs">
            {file.message}
          </p>
        )}
      </div>

      <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
        {file.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="outline" className="h-5 px-1.5 text-[10px]">
            {tag}
          </Badge>
        ))}
        {file.tags.length > 2 && (
          <span className="text-muted-foreground text-[10px]">
            +{file.tags.length - 2}
          </span>
        )}
      </div>

      <div className="text-muted-foreground hidden w-20 shrink-0 text-right text-xs md:block">
        {formatFileSize(file.size)}
      </div>

      <div className="text-muted-foreground hidden w-28 shrink-0 text-right text-xs sm:block">
        {formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}
      </div>

      <div className="hidden w-20 shrink-0 sm:block">
        <Badge
          variant={file.visibility === 'PUBLIC' ? 'default' : 'secondary'}
          className="h-5 gap-1 px-1.5 text-[10px]"
        >
          {file.visibility === 'PUBLIC' ? (
            <Globe className="h-3 w-3" />
          ) : (
            <Lock className="h-3 w-3" />
          )}
          {file.visibility === 'PUBLIC' ? 'Public' : 'Private'}
        </Badge>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          onClick={(e) => e.stopPropagation()}
          className="hover:bg-accent rounded-md p-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus:outline-none"
        >
          <MoreHorizontal className="text-muted-foreground h-4 w-4" />
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
    </div>
  );
}
