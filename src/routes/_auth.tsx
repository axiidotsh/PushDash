import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { authClient } from '../../auth-client';

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    // Check if user is already authenticated
    const response = await authClient.getSession();

    // If authenticated, redirect to dashboard
    if (response.data?.session) {
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
