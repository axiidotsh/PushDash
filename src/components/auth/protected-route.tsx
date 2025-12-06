'use client';

import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';

import { useSession } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

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

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || isError) {
    return null;
  }

  return <>{children}</>;
}
