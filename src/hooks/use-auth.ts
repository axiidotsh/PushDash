'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authClient } from '../../auth-client';
import type {
  AuthSession,
  SignInCredentials,
  SignUpCredentials,
} from '@/types/auth';

/**
 * Query key for session data
 */
export const sessionQueryKey = ['session'] as const;

/**
 * Hook to get the current session
 * Returns the authenticated user and session data
 */
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
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}

/**
 * Hook to sign in a user
 * Uses email/password authentication
 */
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
      // Invalidate session query to refetch user data
      queryClient.invalidateQueries({ queryKey: sessionQueryKey });
    },
  });
}

/**
 * Hook to sign up a new user
 * Creates account with email/password
 */
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
      // Invalidate session query to refetch user data
      queryClient.invalidateQueries({ queryKey: sessionQueryKey });
    },
  });
}

/**
 * Hook to sign out the current user
 * Clears session and invalidates cache
 */
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
      // Clear session from cache
      queryClient.setQueryData(sessionQueryKey, null);
      // Invalidate all queries to ensure fresh state
      queryClient.invalidateQueries({ queryKey: sessionQueryKey });
    },
  });
}
