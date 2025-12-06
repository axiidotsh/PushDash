import { createFileRoute } from '@tanstack/react-router';
import { AuthLayout } from '@/components/auth/auth-layout';
import { SignInForm } from '@/components/auth/sign-in-form';

export const Route = createFileRoute('/_auth/sign-in')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || undefined,
    };
  },
  component: SignInPage,
});

function SignInPage() {
  const { redirect } = Route.useSearch();

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your PushDash account"
    >
      <SignInForm redirectTo={redirect} />
    </AuthLayout>
  );
}
