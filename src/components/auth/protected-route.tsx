'use client';

import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';

import { useSession } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

/**
 * Protected route wrapper component
 * Redirects unauthenticated users to sign-in page
 */
export function ProtectedRoute({
  children,
  fallbackPath = '/sign-in',
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { data: session, isLoading, isError } = useSession();

  useEffect(() => {
    if (!isLoading && !session) {
      navigate({ to: fallbackPath });
    }
  }, [session, isLoading, navigate, fallbackPath]);

  // Show loading state while checking session
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!session || isError) {
    return null;
  }

  return <>{children}</>;
}
