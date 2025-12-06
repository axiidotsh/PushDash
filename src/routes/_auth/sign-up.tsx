import { createFileRoute } from '@tanstack/react-router';
import { AuthLayout } from '@/components/auth/auth-layout';
import { SignUpForm } from '@/components/auth/sign-up-form';

export const Route = createFileRoute('/_auth/sign-up')({
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <AuthLayout
      title="Create an account"
      description="Get started with PushDash and push your first file"
    >
      <SignUpForm />
    </AuthLayout>
  );
}
