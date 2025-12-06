'use client';

import { UserMenu } from './user-menu';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background/80 sticky top-0 z-50 mx-auto flex h-16 w-full max-w-7xl items-center justify-between border-b px-6 backdrop-blur-md">
        <h1 className="text-foreground text-lg font-semibold tracking-tight">
          Dashboard
        </h1>
        <UserMenu />
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
