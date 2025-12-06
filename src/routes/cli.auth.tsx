import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Terminal, CheckCircle2, XCircle, Github, Mail } from 'lucide-react';
import { authClient } from '../../auth-client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/cli/auth')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      code: (search.code as string) || '',
    };
  },
  component: CliAuthPage,
});

type AuthStatus =
  | 'checking'
  | 'needs_login'
  | 'authorizing'
  | 'success'
  | 'error';

function CliAuthPage() {
  const { code } = Route.useSearch();
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [error, setError] = useState<string>('');

  // Check if user is logged in on mount
  useEffect(() => {
    if (!code) return;

    async function checkAuth() {
      try {
        const session = await authClient.getSession();
        if (session.data?.user) {
          // User is logged in, proceed to authorize CLI
          setStatus('authorizing');
          await completeAuth();
        } else {
          // User needs to log in
          setStatus('needs_login');
        }
      } catch {
        // Session check failed, show login
        setStatus('needs_login');
      }
    }

    checkAuth();
  }, [code]);

  async function completeAuth() {
    try {
      const response = await fetch('/api/auth/cli/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to authorize CLI');
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch {
      setError('Failed to connect to server');
      setStatus('error');
    }
  }

  // No code provided - invalid request
  if (!code) {
    return (
      <CliAuthLayout>
        <StatusIcon status="error" />
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Invalid Request</CardTitle>
          <CardDescription>
            No authorization code provided. Please try logging in from the CLI
            again.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild variant="outline">
            <Link to="/">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </CliAuthLayout>
    );
  }

  // Checking authentication status
  if (status === 'checking') {
    return (
      <CliAuthLayout>
        <StatusIcon status="loading" />
        <CardHeader className="text-center">
          <CardTitle className="text-xl">PushDash CLI</CardTitle>
          <CardDescription>Checking authentication status...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <PulsingDots />
        </CardContent>
      </CliAuthLayout>
    );
  }

  // User not logged in - show login options
  if (status === 'needs_login') {
    return (
      <CliAuthLayout>
        <StatusIcon status="pending" />
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Authorize CLI</CardTitle>
          <CardDescription>
            Sign in to authorize the PushDash CLI on your machine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 flex items-center justify-center gap-2 rounded-lg border px-4 py-3">
            <span className="text-muted-foreground text-sm">Device Code:</span>
            <code className="bg-background rounded px-2 py-1 font-mono text-sm font-medium">
              {code}
            </code>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild size="lg" className="w-full">
              <Link
                to="/sign-in"
                search={{ redirect: `/cli/auth?code=${code}` }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Sign in with Email
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() =>
                authClient.signIn.social({
                  provider: 'github',
                  callbackURL: `/cli/auth?code=${code}`,
                })
              }
            >
              <Github className="mr-2 h-4 w-4" />
              Sign in with GitHub
            </Button>
          </div>
          <p className="text-muted-foreground text-center text-xs">
            Don&apos;t have an account?{' '}
            <Link
              to="/sign-up"
              search={{ redirect: `/cli/auth?code=${code}` }}
              className="text-primary hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardContent>
      </CliAuthLayout>
    );
  }

  // Authorizing in progress
  if (status === 'authorizing') {
    return (
      <CliAuthLayout>
        <StatusIcon status="loading" />
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Authorizing CLI</CardTitle>
          <CardDescription>Completing authorization...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <PulsingDots />
        </CardContent>
      </CliAuthLayout>
    );
  }

  // Success
  if (status === 'success') {
    return (
      <CliAuthLayout>
        <StatusIcon status="success" />
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-emerald-500">
            CLI Authorized
          </CardTitle>
          <CardDescription>
            You can now close this window and return to your terminal.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <p className="text-muted-foreground text-sm">
            The CLI is now connected to your account.
          </p>
        </CardContent>
      </CliAuthLayout>
    );
  }

  // Error
  return (
    <CliAuthLayout>
      <StatusIcon status="error" />
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-red-500">
          Authorization Failed
        </CardTitle>
        <CardDescription>{error}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </CardContent>
    </CliAuthLayout>
  );
}

// Layout wrapper for consistent styling
function CliAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="overflow-hidden">{children}</Card>
        <p className="text-muted-foreground mt-6 text-center text-xs">
          PushDash — Push files from terminal to cloud
        </p>
      </div>
    </div>
  );
}

// Animated status icon
function StatusIcon({
  status,
}: {
  status: 'loading' | 'pending' | 'success' | 'error';
}) {
  return (
    <div className="flex justify-center pt-6">
      <div
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-2xl transition-colors',
          status === 'loading' && 'bg-primary/10 text-primary',
          status === 'pending' && 'bg-amber-500/10 text-amber-500',
          status === 'success' && 'bg-emerald-500/10 text-emerald-500',
          status === 'error' && 'bg-red-500/10 text-red-500'
        )}
      >
        {status === 'loading' && <Spinner className="h-6 w-6" />}
        {status === 'pending' && <Terminal className="h-6 w-6" />}
        {status === 'success' && <CheckCircle2 className="h-6 w-6" />}
        {status === 'error' && <XCircle className="h-6 w-6" />}
      </div>
    </div>
  );
}

// Animated pulsing dots for loading states
function PulsingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="bg-muted-foreground h-2 w-2 animate-pulse rounded-full"
          style={{
            animationDelay: `${i * 150}ms`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );
}
