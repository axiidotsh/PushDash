'use client';

import { Link } from '@tanstack/react-router';
import { Upload, LayoutDashboard, Settings } from 'lucide-react';

import { cn } from '@/lib/utils';
import { UserMenu } from './user-menu';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Upload className="text-primary-foreground h-4 w-4" />
            </div>
            <span className="text-foreground text-base font-semibold">
              PushDash
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/dashboard" icon={LayoutDashboard}>
              Dashboard
            </NavLink>
            <NavLink to="/dashboard/settings" icon={Settings}>
              Settings
            </NavLink>
          </nav>

          <UserMenu />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6">{children}</main>
    </div>
  );
}

interface NavLinkProps {
  to: '/dashboard' | '/dashboard/settings';
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

function NavLink({ to, icon: Icon, children }: NavLinkProps) {
  const isActive =
    typeof window !== 'undefined' && window.location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}
