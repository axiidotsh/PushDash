import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { authClient } from '../../auth-client';

import { AppShell } from '@/components/dashboard/app-shell';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    // Check if user is authenticated
    const response = await authClient.getSession();

    // If not authenticated, redirect to sign-in
    if (!response.data?.session) {
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
