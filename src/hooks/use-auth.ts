'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authClient } from '../../auth-client';
import type {
  AuthSession,
  SignInCredentials,
  SignUpCredentials,
} from '@/types/auth';

export const sessionQueryKey = ['session'] as const;

export function useSession() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: async (): Promise<AuthSession | null> => {
      const response = await authClient.getSession();
      if (response.error || !response.data) {
        return null;
      }
      return response.data as AuthSession;
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: SignInCredentials) => {
      const response = await authClient.signIn.email({
        email: credentials.email,
        password: credentials.password,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Sign in failed');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionQueryKey });
    },
  });
}

export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: SignUpCredentials) => {
      const response = await authClient.signUp.email({
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Sign up failed');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionQueryKey });
    },
  });
}

export function useGitHubSignIn(callbackURL?: string) {
  return useMutation({
    mutationFn: async () => {
      await authClient.signIn.social({
        provider: 'github',
        callbackURL: callbackURL || '/dashboard',
      });
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await authClient.signOut();

      if (response.error) {
        throw new Error(response.error.message || 'Sign out failed');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.setQueryData(sessionQueryKey, null);
      queryClient.invalidateQueries({ queryKey: sessionQueryKey });
    },
  });
}
