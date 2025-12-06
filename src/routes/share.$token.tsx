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
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
    // Use the share token download endpoint for shared files
    window.open(`/api/share/${token}/download`, '_blank');
  };

  if (error) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <FileTypeIcon className="text-muted-foreground h-8 w-8" />
            </div>
            <h1 className="mb-2 text-xl font-semibold">Link Not Found</h1>
            <p className="text-muted-foreground mb-6 text-sm">
              This share link may have expired or been removed.
            </p>
            <Button asChild>
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

  if (isLoading || !file) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-4 w-48" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle login required state
  if (requiresAuth) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <Lock className="text-primary h-8 w-8" />
            </div>
            <h1 className="mb-2 text-xl font-semibold">Private File</h1>
            <p className="text-muted-foreground mb-2 text-sm">
              <span className="font-medium">{file.originalName}</span>
            </p>
            <p className="text-muted-foreground mb-6 text-sm">
              {file.owner.name
                ? `Shared by ${file.owner.name}`
                : 'This file requires authentication to access.'}
            </p>
            <p className="text-muted-foreground mb-6 text-sm">
              Sign in with the email address this file was shared with.
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link to="/sign-in" search={{ redirect: `/share/${token}` }}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in to access
                </Link>
              </Button>
              <Button variant="outline" asChild>
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

  // Handle access denied state (user is logged in but doesn't have access)
  if (!accessGranted) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <div className="bg-destructive/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <ShieldX className="text-destructive h-8 w-8" />
            </div>
            <h1 className="mb-2 text-xl font-semibold">Access Denied</h1>
            <p className="text-muted-foreground mb-2 text-sm">
              <span className="font-medium">{file.originalName}</span>
            </p>
            <p className="text-muted-foreground mb-6 text-sm">
              You don't have permission to access this file. Ask the owner to
              share it with your email address.
            </p>
            <Button asChild>
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

  const fileType = getFileType(file.mimeType || 'application/octet-stream');
  const Icon = fileTypeIcons[fileType];

  return (
    <div className="bg-background min-h-screen p-4 py-8 md:py-16">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground mb-4 inline-block text-sm font-medium transition-colors"
          >
            Shared via <span className="text-primary">PushDash</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl">
              <Icon className="text-muted-foreground h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">{file.originalName}</CardTitle>
            <div className="text-muted-foreground flex items-center justify-center gap-3 text-sm">
              {file.size && <span>{formatFileSize(file.size)}</span>}
              {file.size && file.createdAt && <span>•</span>}
              {file.createdAt && (
                <span>
                  {formatDistanceToNow(new Date(file.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              )}
              {file.owner.name && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {file.owner.name}
                  </span>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Preview area */}
            <div className="bg-muted/50 mb-6 flex min-h-[300px] items-center justify-center rounded-lg border">
              {fileType === 'image' ? (
                <img
                  src={`/api/share/${token}/download`}
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
              <div className="bg-muted/30 mb-6 rounded-lg p-4">
                <p className="text-muted-foreground text-sm">{file.message}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download File
              </Button>
              <Button variant="outline" size="lg" onClick={handleCopyLink}>
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
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-3 text-sm">
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
