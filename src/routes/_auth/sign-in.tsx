import { createFileRoute } from '@tanstack/react-router';
import { AuthLayout } from '@/components/auth/auth-layout';
import { SignInForm } from '@/components/auth/sign-in-form';

export const Route = createFileRoute('/_auth/sign-in')({
  component: SignInPage,
});

function SignInPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your PushDash account"
    >
      <SignInForm />
    </AuthLayout>
  );
}
