'use client';

import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { Link, useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { signInSchema, type SignInInput } from '@/schemas/auth.schema';
import { useSignIn } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface SignInFormProps {
  redirectTo?: string;
}

export function SignInForm({ redirectTo }: SignInFormProps) {
  const navigate = useNavigate();
  const signIn = useSignIn();

  const form = useForm<SignInInput>({
    resolver: standardSchemaResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInInput) => {
    try {
      await signIn.mutateAsync(data);
      toast.success('Welcome back!', {
        description: 'You have been signed in successfully',
      });

      // Redirect to specified URL or home
      if (redirectTo) {
        window.location.href = redirectTo;
      } else {
        navigate({ to: '/' });
      }
    } catch (error) {
      toast.error('Sign in failed', {
        description:
          error instanceof Error ? error.message : 'Invalid credentials',
      });
    }
  };

  // Build sign-up link with redirect if present
  const signUpSearch = redirectTo ? { redirect: redirectTo } : undefined;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={signIn.isPending} className="w-full">
          {signIn.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>

        <p className="text-muted-foreground text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link
            to="/sign-up"
            search={signUpSearch}
            className="text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </form>
    </Form>
  );
}
