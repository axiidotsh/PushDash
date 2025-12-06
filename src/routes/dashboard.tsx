import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { AppShell } from '@/components/dashboard/app-shell';
import { getServerSession } from '@/lib/server-auth';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    // Check if user is authenticated using server function
    // This avoids the SSR issue where auth client would make HTTP requests to itself
    const session = await getServerSession();

    // If not authenticated, redirect to sign-in
    if (!session?.user) {
      throw redirect({
        to: '/sign-in',
      });
    }
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
