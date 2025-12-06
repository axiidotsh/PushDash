'use client';

import { Download, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImagePreview } from './image-preview';
import { TextPreview } from './text-preview';
import { CodePreview } from './code-preview';
import { MarkdownPreview } from './markdown-preview';
import { PdfPreview } from './pdf-preview';

type PreviewType =
  | 'image'
  | 'pdf'
  | 'markdown'
  | 'code'
  | 'text'
  | 'unsupported';

interface FilePreviewProps {
  url: string;
  downloadUrl: string;
  filename: string;
  mimeType: string;
  className?: string;
}

// Code file extensions
const CODE_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs',
  '.py',
  '.rb',
  '.go',
  '.rs',
  '.java',
  '.kt',
  '.scala',
  '.php',
  '.swift',
  '.c',
  '.cpp',
  '.h',
  '.hpp',
  '.cs',
  '.sh',
  '.bash',
  '.zsh',
  '.fish',
  '.ps1',
  '.sql',
  '.prisma',
  '.graphql',
  '.gql',
  '.html',
  '.htm',
  '.css',
  '.scss',
  '.sass',
  '.less',
  '.vue',
  '.svelte',
  '.astro',
  '.json',
  '.jsonc',
  '.yaml',
  '.yml',
  '.toml',
  '.ini',
  '.env',
  '.xml',
  '.lua',
  '.r',
  '.dart',
  '.ex',
  '.exs',
  '.erl',
  '.hs',
  '.clj',
  '.vim',
  '.dockerfile',
  '.makefile',
]);

// Plain text extensions (non-code)
const TEXT_EXTENSIONS = new Set(['.txt', '.log', '.csv', '.tsv']);

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(lastDot).toLowerCase() : '';
}

function determinePreviewType(mimeType: string, filename: string): PreviewType {
  const ext = getFileExtension(filename);

  // Image types
  if (mimeType.startsWith('image/')) {
    return 'image';
  }

  // PDF
  if (mimeType === 'application/pdf') {
    return 'pdf';
  }

  // Markdown
  if (ext === '.md' || ext === '.mdx' || mimeType === 'text/markdown') {
    return 'markdown';
  }

  // Code files (by extension)
  if (CODE_EXTENSIONS.has(ext)) {
    return 'code';
  }

  // Plain text files
  if (TEXT_EXTENSIONS.has(ext) || mimeType.startsWith('text/')) {
    return 'text';
  }

  // JSON/XML that might not have proper extensions
  if (mimeType === 'application/json' || mimeType === 'application/xml') {
    return 'code';
  }

  // Unsupported
  return 'unsupported';
}

export function FilePreview({
  url,
  downloadUrl,
  filename,
  mimeType,
  className = '',
}: FilePreviewProps) {
  const previewType = determinePreviewType(mimeType, filename);

  if (previewType === 'unsupported') {
    return (
      <div
        className={`flex flex-col items-center justify-center py-20 ${className}`}
      >
        <FileQuestion className="text-muted-foreground mb-4 h-16 w-16" />
        <p className="text-muted-foreground mb-1 text-sm font-medium">
          Preview not available
        </p>
        <p className="text-muted-foreground/70 mb-4 text-xs">
          This file type cannot be previewed in the browser
        </p>
        <Button variant="outline" size="sm" asChild>
          <a href={downloadUrl} download>
            <Download className="mr-2 h-4 w-4" />
            Download file
          </a>
        </Button>
      </div>
    );
  }

  switch (previewType) {
    case 'image':
      return <ImagePreview url={url} alt={filename} className={className} />;

    case 'pdf':
      return <PdfPreview url={url} className={className} />;

    case 'markdown':
      return <MarkdownPreview url={url} className={className} />;

    case 'code':
      return (
        <CodePreview url={url} filename={filename} className={className} />
      );

    case 'text':
      return <TextPreview url={url} className={className} />;

    default:
      return null;
  }
}
