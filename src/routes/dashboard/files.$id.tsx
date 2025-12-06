'use client';

import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow, format } from 'date-fns';
import {
  ArrowLeft,
  Download,
  Trash2,
  Globe,
  Lock,
  FileText,
  Image as ImageIcon,
  FileCode,
  FileType as FileTypeIcon,
  Copy,
  Check,
  ExternalLink,
  Share2,
  UserPlus,
  X,
  Link2,
  Mail,
  Calendar,
  HardDrive,
  Tag,
  MoreHorizontal,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FilePreview } from '@/components/file-preview';
import { getFileType, formatFileSize } from '@/types/file';

export const Route = createFileRoute('/dashboard/files/$id')({
  component: FileDetailPage,
});

interface FileData {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  tag: string | null;
  message: string | null;
  isPublic: boolean;
  url: string;
  downloadUrl: string;
  shareUrl?: string;
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
}

interface ShareData {
  id: string;
  email: string;
  createdAt: string;
}

const fileTypeIcons = {
  text: FileText,
  image: ImageIcon,
  pdf: FileText,
  code: FileCode,
  other: FileTypeIcon,
};

function FileDetailPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showSharePanel, setShowSharePanel] = useState(false);

  // Fetch file data
  const { data, isLoading, error } = useQuery({
    queryKey: ['file', id],
    queryFn: async () => {
      const res = await fetch(`/api/files/${id}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to load file');
      }
      return res.json() as Promise<{ file: FileData }>;
    },
  });

  // Fetch shares
  const { data: sharesData } = useQuery({
    queryKey: ['file-shares', id],
    queryFn: async () => {
      const res = await fetch(`/api/files/${id}/shares`);
      if (!res.ok) return { shares: [], total: 0 };
      return res.json() as Promise<{ shares: ShareData[]; total: number }>;
    },
    enabled: !!data?.file?.isOwner,
  });

  // Create share link mutation
  const createShareLinkMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/files/${id}/share`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create share link');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['file', id] });
    },
  });

  // Add email share mutation
  const addShareMutation = useMutation({
    mutationFn: async (emails: string[]) => {
      const res = await fetch(`/api/files/${id}/shares`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to share');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['file-shares', id] });
      setEmailInput('');
      setEmailError('');
    },
    onError: (err: Error) => {
      setEmailError(err.message);
    },
  });

  // Remove email share mutation
  const removeShareMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch(`/api/files/${id}/shares`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed to remove share');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['file-shares', id] });
    },
  });

  const file = data?.file;
  const shares = sharesData?.shares ?? [];

  const handleCopyLink = async () => {
    if (!file) return;
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyShareLink = async () => {
    if (!file?.shareUrl) return;
    await navigator.clipboard.writeText(file.shareUrl);
    setShareLinkCopied(true);
    setTimeout(() => setShareLinkCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!file) return;
    window.open(file.downloadUrl, '_blank');
  };

  const handleAddEmail = () => {
    if (!emailInput.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emails = emailInput
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    const invalidEmails = emails.filter((e) => !emailRegex.test(e));
    if (invalidEmails.length > 0) {
      setEmailError(`Invalid email: ${invalidEmails[0]}`);
      return;
    }

    addShareMutation.mutate(emails);
  };

  // Error state
  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Link
          to="/dashboard"
          className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to files
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/20">
          <p className="text-red-600 dark:text-red-400">{error.message}</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !file) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Skeleton className="mb-8 h-5 w-28" />
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div>
              <Skeleton className="mb-2 h-7 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  const fileType = getFileType(file.mimeType);
  const Icon = fileTypeIcons[fileType];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Back link */}
      <Link
        to="/dashboard"
        className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to files
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="bg-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
            <Icon className="text-foreground/70 h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight">
              {file.originalName}
            </h1>
            <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <HardDrive className="h-3.5 w-3.5" />
                {formatFileSize(file.size)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDistanceToNow(new Date(file.createdAt), {
                  addSuffix: true,
                })}
              </span>
              {file.isPublic ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Globe className="h-3.5 w-3.5" />
                  Public
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  Private
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button onClick={handleDownload} size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>

          {file.isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSharePanel(!showSharePanel)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyLink}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy link
                  </>
                )}
              </DropdownMenuItem>
              {file.shareUrl && (
                <DropdownMenuItem asChild>
                  <a
                    href={file.shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open share link
                  </a>
                </DropdownMenuItem>
              )}
              {file.isOwner && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete file
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Share Panel */}
      {showSharePanel && file.isOwner && (
        <div className="mb-6 rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium">Share settings</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowSharePanel(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Share Link Section */}
          <div className="mb-4">
            <label className="text-muted-foreground mb-2 block text-xs font-medium tracking-wide uppercase">
              Public Link
            </label>
            {file.shareUrl ? (
              <div className="flex gap-2">
                <Input
                  value={file.shareUrl}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyShareLink}
                >
                  {shareLinkCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => createShareLinkMutation.mutate()}
                disabled={createShareLinkMutation.isPending}
              >
                {createShareLinkMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Link2 className="mr-2 h-4 w-4" />
                    Generate share link
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Email Sharing - Only for private files */}
          {!file.isPublic && (
            <>
              <Separator className="my-4" />
              <div>
                <label className="text-muted-foreground mb-2 block text-xs font-medium tracking-wide uppercase">
                  Share with specific people
                </label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter email addresses (comma separated)"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setEmailError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEmail();
                      }
                    }}
                    className="text-sm"
                  />
                  <Button
                    size="icon"
                    onClick={handleAddEmail}
                    disabled={addShareMutation.isPending || !emailInput.trim()}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
                {emailError && (
                  <p className="mt-1 text-xs text-red-500">{emailError}</p>
                )}

                {/* Shared emails list */}
                {shares.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {shares.map((share) => (
                      <div
                        key={share.id}
                        className="bg-muted/50 flex items-center justify-between rounded-md px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <Mail className="text-muted-foreground h-3.5 w-3.5" />
                          <span className="text-sm">{share.email}</span>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() =>
                            removeShareMutation.mutate(share.email)
                          }
                          disabled={removeShareMutation.isPending}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* File Preview */}
      <div className="rounded-lg border">
        <FilePreview
          url={file.url}
          downloadUrl={file.downloadUrl}
          filename={file.originalName}
          mimeType={file.mimeType}
        />
      </div>

      {/* Details Section */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {/* Description */}
        {file.message && (
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 text-sm font-medium">Description</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {file.message}
            </p>
          </div>
        )}

        {/* File Info */}
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 text-sm font-medium">File details</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Type</dt>
              <dd className="font-mono text-xs">{file.mimeType}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Size</dt>
              <dd>{formatFileSize(file.size)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Uploaded</dt>
              <dd>{format(new Date(file.createdAt), 'MMM d, yyyy')}</dd>
            </div>
            {file.tag && (
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Tag</dt>
                <dd>
                  <Badge variant="secondary" className="font-normal">
                    <Tag className="mr-1 h-3 w-3" />
                    {file.tag}
                  </Badge>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
