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
  Trash2,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type { File } from '@/types/file';
import { getFileType, formatFileSize } from '@/types/file';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FileCardProps {
  file: File;
  onPreview?: (file: File) => void;
  onDownload?: (file: File) => void;
  onDelete?: (file: File) => void;
}

const fileTypeIcons = {
  text: FileText,
  image: Image,
  pdf: FileText,
  code: FileCode,
  other: FileTypeIcon,
};

export function FileCard({
  file,
  onPreview,
  onDownload,
  onDelete,
}: FileCardProps) {
  const fileType = getFileType(file.mimeType);
  const Icon = fileTypeIcons[fileType];

  return (
    <Card
      className="group hover:bg-accent/50 cursor-pointer transition-colors"
      onClick={() => onPreview?.(file)}
    >
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
            <Icon className="text-muted-foreground h-5 w-5" />
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(file)}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 className="text-destructive mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="text-foreground mb-1 truncate text-sm font-medium">
          {file.filename}
        </h3>

        <div className="text-muted-foreground mb-3 flex items-center gap-2 text-xs">
          <span>{formatFileSize(file.size)}</span>
          <span>•</span>
          <span>
            {formatDistanceToNow(new Date(file.uploadedAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
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

          {file.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="h-5 px-1.5 text-[10px]"
            >
              {tag}
            </Badge>
          ))}
          {file.tags.length > 2 && (
            <span className="text-muted-foreground text-[10px]">
              +{file.tags.length - 2}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
