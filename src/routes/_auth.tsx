import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { getServerSession } from '@/lib/server-auth';

export const Route = createFileRoute('/_auth')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || undefined,
    };
  },
  beforeLoad: async ({ search }) => {
    // Check if user is already authenticated using server function
    // This avoids the SSR issue where auth client would make HTTP requests to itself
    const session = await getServerSession();

    // If authenticated, redirect to specified URL or home
    if (session?.user) {
      const redirectTo = search.redirect || '/';

      // Parse the redirect URL to properly handle query parameters
      // TanStack Router's redirect expects path and search to be separate
      if (redirectTo.includes('?')) {
        const [path, queryString] = redirectTo.split('?');
        const searchParams = Object.fromEntries(
          new URLSearchParams(queryString)
        );
        throw redirect({
          to: path,
          search: searchParams,
        });
      } else {
        throw redirect({
          to: redirectTo,
        });
      }
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return <Outlet />;
}
