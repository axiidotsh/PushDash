'use client';

import { useState } from 'react';
import { X, UserPlus, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { File } from '@/types/file';
import {
  useFileShares,
  useAddShareEmails,
  useRemoveShareEmail,
} from '@/hooks/use-shares';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null;
}

export function ShareDialog({ open, onOpenChange, file }: ShareDialogProps) {
  const [emailInput, setEmailInput] = useState('');

  const { data: sharesData, isLoading: isLoadingShares } = useFileShares(
    file?.id
  );
  const addSharesMutation = useAddShareEmails();
  const removeShareMutation = useRemoveShareEmail();

  const shares = sharesData?.shares ?? [];

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !emailInput.trim()) return;

    // Basic email validation
    const email = emailInput.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error('Invalid email address');
      return;
    }

    // Check if already shared
    if (shares.some((s) => s.email.toLowerCase() === email)) {
      toast.error('File is already shared with this email');
      return;
    }

    try {
      await addSharesMutation.mutateAsync({
        fileId: file.id,
        emails: [email],
      });

      setEmailInput('');
      toast.success('File shared successfully', {
        description: `Shared with ${email}`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to share file';
      toast.error('Failed to share file', {
        description: errorMessage,
      });
    }
  };

  const handleRemoveShare = async (email: string) => {
    if (!file) return;

    try {
      await removeShareMutation.mutateAsync({
        fileId: file.id,
        email,
      });

      toast.success('Access removed', {
        description: `Removed access for ${email}`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to remove access';
      toast.error('Failed to remove access', {
        description: errorMessage,
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setEmailInput('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Share File
          </DialogTitle>
          <DialogDescription>
            Share{' '}
            <span className="text-foreground font-medium">
              {file?.filename}
            </span>{' '}
            with others by email address.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAddEmail} className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="email"
              placeholder="Enter email address"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              disabled={addSharesMutation.isPending}
              className="pl-9"
            />
          </div>
          <Button
            type="submit"
            disabled={!emailInput.trim() || addSharesMutation.isPending}
          >
            {addSharesMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Add'
            )}
          </Button>
        </form>

        <Separator />

        <div className="space-y-2">
          <h4 className="text-muted-foreground text-sm font-medium">
            Shared with ({shares.length})
          </h4>

          {isLoadingShares ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : shares.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              Not shared with anyone yet
            </p>
          ) : (
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="bg-muted/50 group flex items-center justify-between rounded-md px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">
                      {share.email}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Added{' '}
                      {formatDistanceToNow(new Date(share.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemoveShare(share.email)}
                    disabled={removeShareMutation.isPending}
                    className="text-muted-foreground hover:text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    {removeShareMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    <span className="sr-only">Remove {share.email}</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
