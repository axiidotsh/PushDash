import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ArrowRight,
  Terminal,
  LayoutDashboard,
  Share2,
  Lock,
  Check,
  Copy,
  Github,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { useSession } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export const Route = createFileRoute('/')({
  component: HomePage,
});

// Animated Terminal Component
function AnimatedTerminal() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Stagger line appearance
    const delays = [0, 800, 1600, 2400, 3200, 4000];
    delays.forEach((delay, index) => {
      const timer = setTimeout(() => {
        setVisibleLines(index + 1);
      }, delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  const lines = [
    { type: 'command', content: '$ pushdash login' },
    { type: 'output', content: '◐ Opening browser for authentication...' },
    { type: 'success', content: '✓ Logged in as dev@example.com' },
    { type: 'command', content: '$ pushdash push ./report.pdf --tag "work"' },
    { type: 'success', content: '✓ Uploaded report.pdf (2.4 MB)' },
    { type: 'link', content: '→ https://pushdash.app/f/abc123' },
  ];

  return (
    <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
      <div className="bg-muted/50 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
          <span className="text-muted-foreground ml-3 text-xs font-medium">
            terminal
          </span>
        </div>
      </div>
      <div className="bg-muted/30 p-4 font-mono text-sm">
        <div className="space-y-1.5">
          {lines.map((line, index) => (
            <div
              key={index}
              className={`transition-opacity duration-300 ${
                index < visibleLines ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {line.type === 'command' && (
                <span className="text-foreground">{line.content}</span>
              )}
              {line.type === 'output' && (
                <span className="text-muted-foreground">{line.content}</span>
              )}
              {line.type === 'success' && (
                <span className="text-green-600 dark:text-green-400">
                  {line.content}
                </span>
              )}
              {line.type === 'link' && (
                <span className="text-muted-foreground/70">{line.content}</span>
              )}
            </div>
          ))}
          {visibleLines >= lines.length && (
            <div className="mt-1 flex items-center">
              <span className="text-foreground">$</span>
              <span className="bg-foreground/80 ml-1 inline-block h-4 w-2 animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Code Block with Copy Button
function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative">
      {label && (
        <span className="text-muted-foreground mb-2 block text-sm">
          {label}
        </span>
      )}
      <div className="bg-muted/50 flex items-center justify-between rounded-lg border px-4 py-3 font-mono text-sm">
        <code className="text-foreground">{code}</code>
        <button
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground ml-4 transition-colors"
          aria-label="Copy to clipboard"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

// Feature Card
function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Card className="gap-4 py-5">
      <CardHeader className="gap-3">
        <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
          <Icon className="h-5 w-5" />
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-lg font-medium">PushDash</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/axiidotsh/PushDash"
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
          >
            <Github className="h-5 w-5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-16 md:pt-48 md:pb-24">
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
            {/* Left: Text Content */}
            <div>
              <h1 className="text-foreground mb-6 text-4xl font-bold tracking-tight md:text-5xl">
                Push files from terminal to cloud
              </h1>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                Upload files via CLI, manage them in a beautiful dashboard.
                Preview, search, and share — all from one command.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="group px-8">
                  <Link to={session ? '/dashboard' : '/sign-in'}>
                    {session ? 'Go to Dashboard' : 'Get started free'}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: Animated Terminal */}
            <div className="order-first md:order-last">
              <AnimatedTerminal />
            </div>
          </div>
        </section>

        {/* Why PushDash Section */}
        <section className="py-24 md:py-48">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight">
                Why PushDash?
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl">
                A developer-first approach to file management. No bloated apps,
                no complicated workflows.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={Terminal}
                title="One Command Upload"
                description="Push files instantly with a single CLI command. No browser needed."
              />
              <FeatureCard
                icon={LayoutDashboard}
                title="Beautiful Dashboard"
                description="Preview, search, and organize your files in a clean web interface."
              />
              <FeatureCard
                icon={Share2}
                title="Instant Sharing"
                description="Generate shareable links with --public flag. Share in seconds."
              />
              <FeatureCard
                icon={Lock}
                title="Secure by Default"
                description="Files are private unless explicitly shared. You control access."
              />
            </div>
          </div>
        </section>

        {/* Quick Start Section */}
        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <h2 className="text-foreground mb-4 text-3xl font-bold tracking-tight">
                Quick Start
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl">
                Get up and running in under a minute.
              </p>
            </div>

            <div className="mx-auto max-w-2xl space-y-6">
              <div className="flex gap-4">
                <div className="bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                  1
                </div>
                <div className="flex-1">
                  <CodeBlock
                    code="npm install -g pushdash"
                    label="Install the CLI globally"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                  2
                </div>
                <div className="flex-1">
                  <CodeBlock
                    code="pushdash login"
                    label="Authenticate with your account"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                  3
                </div>
                <div className="flex-1">
                  <CodeBlock
                    code='pushdash push ./file.pdf --tag "work"'
                    label="Push your first file"
                  />
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              {!session && (
                <Button asChild size="lg" className="group px-8">
                  <Link to="/sign-up" search={{ redirect: undefined }}>
                    Create your account
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-muted-foreground flex flex-col items-center justify-between gap-4 text-sm sm:flex-row">
              <span>PushDash</span>
              <div className="flex gap-6">
                <a
                  href="https://github.com/axiidotsh/PushDash"
                  className="hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
