import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { getServerSession } from '@/lib/server-auth';

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    // Check if user is already authenticated using server function
    // This avoids the SSR issue where auth client would make HTTP requests to itself
    const session = await getServerSession();

    // If authenticated, redirect to home
    if (session?.user) {
      throw redirect({
        to: '/',
      });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return <Outlet />;
}
