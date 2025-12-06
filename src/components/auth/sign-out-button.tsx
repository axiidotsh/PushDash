'use client';

import { useNavigate } from '@tanstack/react-router';
import { LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useSignOut } from '@/hooks/use-auth';
import { Button, type buttonVariants } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

interface SignOutButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  showIcon?: boolean;
  redirectTo?: string;
}

export function SignOutButton({
  children,
  className,
  variant = 'ghost',
  size = 'default',
  showIcon = true,
  redirectTo = '/sign-in',
  ...props
}: SignOutButtonProps) {
  const navigate = useNavigate();
  const signOut = useSignOut();

  const handleSignOut = async () => {
    try {
      await signOut.mutateAsync();
      toast.success('Signed out', {
        description: 'You have been signed out successfully',
      });
      navigate({ to: redirectTo });
    } catch (error) {
      toast.error('Sign out failed', {
        description:
          error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSignOut}
      disabled={signOut.isPending}
      className={cn(className)}
      {...props}
    >
      {signOut.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing out...
        </>
      ) : (
        <>
          {showIcon && <LogOut className="mr-2 h-4 w-4" />}
          {children || 'Sign out'}
        </>
      )}
    </Button>
  );
}
