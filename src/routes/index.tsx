import { createFileRoute, Link } from '@tanstack/react-router';
import { Upload, ArrowRight } from 'lucide-react';

import { useSession } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { SignOutButton } from '@/components/auth/sign-out-button';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const { data: session, isLoading } = useSession();

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-lg">
            <Upload className="text-primary-foreground h-4 w-4" />
          </div>
          <span className="text-foreground text-lg font-semibold">
            PushDash
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="bg-muted h-9 w-20 animate-pulse rounded-md" />
          ) : session ? (
            <>
              <span className="text-muted-foreground text-sm">
                {session.user.email}
              </span>
              <SignOutButton variant="ghost" size="sm" />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/sign-up">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="max-w-2xl">
          <div className="bg-secondary text-secondary-foreground mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm">
            <span className="bg-primary h-1.5 w-1.5 rounded-full" />
            Developer-focused file sharing
          </div>

          <h1 className="text-foreground mb-6 text-4xl font-bold tracking-tight md:text-5xl">
            Push files from terminal to cloud
          </h1>

          <p className="text-muted-foreground mb-10 text-lg">
            Upload files via CLI, manage them in a beautiful dashboard. Preview,
            search, and share with one command.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            {session ? (
              <Button asChild size="lg" className="group px-8">
                <a href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="group px-8">
                  <Link to="/sign-up">
                    Get started free
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-8">
                  <Link to="/sign-in">Sign in</Link>
                </Button>
              </>
            )}
          </div>

          <div className="bg-card mt-16 overflow-hidden rounded-xl border p-1 shadow-sm">
            <div className="bg-muted rounded-lg p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="text-muted-foreground ml-2 text-xs">
                  terminal
                </span>
              </div>
              <pre className="text-left text-sm">
                <code className="text-muted-foreground">
                  <span className="text-foreground">$</span> pushdash push
                  ./report.pdf --tag &quot;work&quot;{'\n'}
                  <span className="text-green-600 dark:text-green-400">
                    ✓
                  </span>{' '}
                  Uploaded <span className="text-foreground">report.pdf</span>{' '}
                  (2.4 MB){'\n'}
                  <span className="text-muted-foreground/60">
                    → https://pushdash.app/f/abc123
                  </span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-muted-foreground py-6 text-center text-sm">
        Built for Prisma Hackathon
      </footer>
    </div>
  );
}
