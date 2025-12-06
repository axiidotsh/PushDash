'use client';

import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  Download,
  FileText,
  Image as ImageIcon,
  FileCode,
  FileType as FileTypeIcon,
  User,
  Copy,
  Check,
  ArrowRight,
  Lock,
  LogIn,
  ShieldX,
  Globe,
  Tag,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { FilePreview } from '@/components/file-preview';
import { getFileType, formatFileSize } from '@/types/file';

export const Route = createFileRoute('/share/$token')({
  component: SharePage,
});

interface SharedFileData {
  id: string;
  filename?: string;
  originalName: string;
  mimeType?: string;
  size?: number;
  tag?: string | null;
  message?: string | null;
  isPublic: boolean;
  url?: string;
  downloadUrl?: string;
  shareUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  owner: {
    id?: string;
    name: string | null;
  };
}

interface ShareResponse {
  file: SharedFileData;
  accessGranted: boolean;
  requiresAuth?: boolean;
  accessReason?: string;
  message?: string;
}

const fileTypeIcons = {
  text: FileText,
  image: ImageIcon,
  pdf: FileText,
  code: FileCode,
  other: FileTypeIcon,
};

function SharePage() {
  const { token } = Route.useParams();
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['shared-file', token],
    queryFn: async () => {
      const res = await fetch(`/api/share/${token}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Share link not found or expired');
      }
      return res.json() as Promise<ShareResponse>;
    },
  });

  const file = data?.file;
  const accessGranted = data?.accessGranted ?? false;
  const requiresAuth = data?.requiresAuth ?? false;

  const handleCopyLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!file) return;
    window.open(`/api/share/${token}/download`, '_blank');
  };

  // Error state - link not found
  if (error) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="pt-12 pb-10 text-center">
            <div className="bg-muted mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl">
              <AlertCircle className="text-muted-foreground h-10 w-10" />
            </div>
            <h1 className="text-foreground mb-2 text-2xl font-semibold tracking-tight">
              Link Not Found
            </h1>
            <p className="text-muted-foreground mx-auto mb-8 max-w-xs text-sm leading-relaxed">
              This share link may have expired, been removed, or never existed.
            </p>
            <Button asChild size="lg" className="px-8">
              <Link to="/">
                Go to PushDash
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading || !file) {
    return (
      <div className="bg-background min-h-screen p-4 py-8 md:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 text-center">
            <Skeleton className="mx-auto h-4 w-32" />
          </div>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="mb-6 flex items-start gap-4">
                <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="mb-2 h-7 w-64" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <Skeleton className="mb-4 h-[400px] w-full rounded-lg" />
              <div className="flex justify-center gap-3">
                <Skeleton className="h-11 w-36" />
                <Skeleton className="h-11 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Login required state
  if (requiresAuth) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="pt-12 pb-10 text-center">
            <div className="from-primary/20 to-primary/5 mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br">
              <Lock className="text-primary h-10 w-10" />
            </div>
            <h1 className="text-foreground mb-2 text-2xl font-semibold tracking-tight">
              Private File
            </h1>
            <p className="text-foreground mb-1 font-medium">
              {file.originalName}
            </p>
            <p className="text-muted-foreground mb-6 text-sm">
              {file.owner.name
                ? `Shared by ${file.owner.name}`
                : 'This file requires authentication to access.'}
            </p>

            <div className="bg-muted/50 mx-auto mb-8 max-w-xs rounded-lg p-4">
              <p className="text-muted-foreground text-xs leading-relaxed">
                Sign in with the email address this file was shared with to view
                and download.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild size="lg">
                <Link to="/sign-in" search={{ redirect: `/share/${token}` }}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in to access
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/sign-up" search={{ redirect: `/share/${token}` }}>
                  Create an account
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Access denied state (user is logged in but doesn't have access)
  if (!accessGranted) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="pt-12 pb-10 text-center">
            <div className="from-destructive/20 to-destructive/5 mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br">
              <ShieldX className="text-destructive h-10 w-10" />
            </div>
            <h1 className="text-foreground mb-2 text-2xl font-semibold tracking-tight">
              Access Denied
            </h1>
            <p className="text-foreground mb-1 font-medium">
              {file.originalName}
            </p>
            <p className="text-muted-foreground mx-auto mb-8 max-w-xs text-sm leading-relaxed">
              You don't have permission to access this file. Ask the owner to
              share it with your email address.
            </p>
            <Button asChild size="lg" className="px-8">
              <Link to="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Access granted - show full preview
  const fileType = getFileType(file.mimeType || 'application/octet-stream');
  const Icon = fileTypeIcons[fileType];
  const downloadUrl = `/api/share/${token}/download`;

  return (
    <div className="bg-background min-h-screen p-4 py-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header branding */}
        <div className="mb-6 text-center">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground inline-block text-sm font-medium transition-colors"
          >
            Shared via{' '}
            <span className="text-primary font-semibold">PushDash</span>
          </Link>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            {/* File header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="bg-muted flex h-14 w-14 shrink-0 items-center justify-center rounded-xl">
                  <Icon className="text-foreground/70 h-7 w-7" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-foreground mb-1 truncate text-xl font-semibold tracking-tight">
                    {file.originalName}
                  </h1>
                  <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    {file.size != null && (
                      <span>{formatFileSize(file.size)}</span>
                    )}
                    {file.createdAt && (
                      <>
                        <span className="text-muted-foreground/50">•</span>
                        <span>
                          {formatDistanceToNow(new Date(file.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </>
                    )}
                    {file.owner.name && (
                      <>
                        <span className="text-muted-foreground/50">•</span>
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {file.owner.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Visibility badge */}
              <Badge
                variant={file.isPublic ? 'default' : 'secondary'}
                className="shrink-0 gap-1.5"
              >
                {file.isPublic ? (
                  <>
                    <Globe className="h-3.5 w-3.5" />
                    Public
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    Private
                  </>
                )}
              </Badge>
            </div>

            {/* File preview */}
            <div className="mb-6 overflow-hidden rounded-lg border">
              <FilePreview
                url={downloadUrl}
                downloadUrl={downloadUrl}
                filename={file.originalName}
                mimeType={file.mimeType || 'application/octet-stream'}
              />
            </div>

            {/* Message and tag */}
            {(file.message || file.tag) && (
              <div className="mb-6 space-y-3">
                {file.message && (
                  <div className="bg-muted/50 flex items-start gap-3 rounded-lg p-4">
                    <MessageSquare className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {file.message}
                    </p>
                  </div>
                )}
                {file.tag && (
                  <div className="flex items-center gap-2">
                    <Tag className="text-muted-foreground h-4 w-4" />
                    <Badge variant="outline">{file.tag}</Badge>
                  </div>
                )}
              </div>
            )}

            <Separator className="mb-6" />

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" onClick={handleDownload} className="px-8">
                <Download className="mr-2 h-4 w-4" />
                Download File
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleCopyLink}
                className="px-8"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer CTA */}
        <div className="mt-10 text-center">
          <p className="text-muted-foreground mb-4 text-sm">
            Want to share files from your terminal?
          </p>
          <Button variant="outline" asChild>
            <Link to="/">
              Get started with PushDash
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
