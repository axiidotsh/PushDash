import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Upload, ArrowRight, LogOut } from 'lucide-react';

import { useSession } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { SignOutButton } from '@/components/auth/sign-out-button';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const { data: session, isLoading } = useSession();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0a0a0f]">
      {/* Gradient background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 -left-[10%] h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -right-[5%] bottom-0 h-[400px] w-[400px] rounded-full bg-fuchsia-600/15 blur-[100px]" />
        <div className="absolute top-1/3 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[80px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25">
            <Upload className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">PushDash</span>
        </div>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-white/5" />
          ) : session ? (
            <>
              <span className="text-sm text-zinc-400">
                {session.user.email}
              </span>
              <SignOutButton
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:bg-white/5 hover:text-white"
              />
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:bg-white/5 hover:text-white"
              >
                <Link to="/sign-in">Sign in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-fuchsia-500"
              >
                <Link to="/sign-up">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            Developer-focused file sharing
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 text-5xl leading-tight font-bold tracking-tight text-white md:text-6xl"
            style={{ fontFamily: 'Syne, system-ui, sans-serif' }}
          >
            Push files from{' '}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              terminal
            </span>{' '}
            to cloud
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-10 text-lg text-zinc-400 md:text-xl"
          >
            Upload files via CLI, manage them in a beautiful dashboard. Preview,
            search, and share with one command.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            {session ? (
              <Button
                size="lg"
                className="group bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-violet-500/40"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  className="group bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-violet-500/40"
                >
                  <Link to="/sign-up">
                    Get started free
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/10 bg-white/5 px-8 text-white hover:bg-white/10"
                >
                  <Link to="/sign-in">Sign in</Link>
                </Button>
              </>
            )}
          </motion.div>

          {/* CLI Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] p-1 shadow-2xl"
          >
            <div className="rounded-lg bg-[#0d0d12] p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs text-zinc-600">terminal</span>
              </div>
              <pre className="text-left text-sm">
                <code className="text-zinc-400">
                  <span className="text-violet-400">$</span> pushdash push
                  ./report.pdf --tag &quot;work&quot;{'\n'}
                  <span className="text-green-400">✓</span> Uploaded{' '}
                  <span className="text-white">report.pdf</span> (2.4 MB){'\n'}
                  <span className="text-zinc-600">
                    → https://pushdash.app/f/abc123
                  </span>
                </code>
              </pre>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-sm text-zinc-600">
        Built for Prisma Hackathon
      </footer>
    </div>
  );
}
