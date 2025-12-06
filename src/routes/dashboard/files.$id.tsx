'use client';

import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
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
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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

    // Basic email validation
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

  if (error) {
    return (
      <div className="py-8">
        <Link
          to="/dashboard"
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to files
        </Link>
        <Card className="border-destructive">
          <CardContent className="py-8 text-center">
            <p className="text-destructive">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !file) {
    return (
      <div className="py-8">
        <Skeleton className="mb-6 h-5 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const fileType = getFileType(file.mimeType);
  const Icon = fileTypeIcons[fileType];

  return (
    <div className="py-8">
      <Link
        to="/dashboard"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to files
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg">
                  <Icon className="text-muted-foreground h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">{file.originalName}</CardTitle>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {formatFileSize(file.size)} •{' '}
                    {formatDistanceToNow(new Date(file.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
              <Badge variant={file.isPublic ? 'default' : 'secondary'}>
                {file.isPublic ? (
                  <>
                    <Globe className="mr-1 h-3 w-3" /> Public
                  </>
                ) : (
                  <>
                    <Lock className="mr-1 h-3 w-3" /> Private
                  </>
                )}
              </Badge>
            </CardHeader>
            <CardContent>
              {/* Preview area */}
              <div className="bg-muted/50 mb-6 flex min-h-[300px] items-center justify-center rounded-lg border">
                {fileType === 'image' ? (
                  <img
                    src={file.downloadUrl}
                    alt={file.originalName}
                    className="max-h-[400px] max-w-full rounded object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <Icon className="text-muted-foreground mx-auto mb-3 h-16 w-16" />
                    <p className="text-muted-foreground text-sm">
                      Preview not available
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={handleDownload}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download to view
                    </Button>
                  </div>
                )}
              </div>

              {/* Message */}
              {file.message && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="mb-2 text-sm font-medium">Description</h4>
                  <p className="text-muted-foreground text-sm">
                    {file.message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleCopyLink}
              >
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
              </Button>
              {file.isOwner && (
                <Button variant="destructive" className="w-full justify-start">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Sharing - Only for owners */}
          {file.isOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Share2 className="h-4 w-4" />
                  Sharing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Share Link */}
                <div>
                  <label className="text-muted-foreground mb-2 block text-xs font-medium tracking-wide uppercase">
                    Share Link
                  </label>
                  {file.shareUrl ? (
                    <div className="flex gap-2">
                      <Input
                        value={file.shareUrl}
                        readOnly
                        className="text-xs"
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
                      <Button size="icon" variant="outline" asChild>
                        <a
                          href={file.shareUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => createShareLinkMutation.mutate()}
                      disabled={createShareLinkMutation.isPending}
                    >
                      <Link2 className="mr-2 h-4 w-4" />
                      {createShareLinkMutation.isPending
                        ? 'Creating...'
                        : 'Generate share link'}
                    </Button>
                  )}
                </div>

                <Separator />

                {/* Email Sharing - Only for private files */}
                {!file.isPublic && (
                  <div>
                    <label className="text-muted-foreground mb-2 block text-xs font-medium tracking-wide uppercase">
                      Share with People
                    </label>
                    <p className="text-muted-foreground mb-3 text-xs">
                      Add email addresses to give specific people access to this
                      private file.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="Enter email address"
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
                        disabled={
                          addShareMutation.isPending || !emailInput.trim()
                        }
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                    {emailError && (
                      <p className="text-destructive mt-1 text-xs">
                        {emailError}
                      </p>
                    )}
                    <p className="text-muted-foreground mt-1 text-xs">
                      Tip: Separate multiple emails with commas
                    </p>

                    {/* List of shared emails */}
                    {shares.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <div className="text-muted-foreground text-xs font-medium">
                          Shared with {shares.length}{' '}
                          {shares.length === 1 ? 'person' : 'people'}
                        </div>
                        {shares.map((share) => (
                          <div
                            key={share.id}
                            className="bg-muted/50 flex items-center justify-between rounded-md px-3 py-2"
                          >
                            <div className="flex items-center gap-2">
                              <Mail className="text-muted-foreground h-3 w-3" />
                              <span className="text-sm">{share.email}</span>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() =>
                                removeShareMutation.mutate(share.email)
                              }
                              disabled={removeShareMutation.isPending}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {file.isPublic && (
                  <p className="text-muted-foreground text-xs">
                    This file is public. Anyone with the share link can access
                    it.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span>{file.mimeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size</span>
                <span>{formatFileSize(file.size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uploaded</span>
                <span>
                  {new Date(file.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              {file.tag && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tag</span>
                  <Badge variant="outline">{file.tag}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
