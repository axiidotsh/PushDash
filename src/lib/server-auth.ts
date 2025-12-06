import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '../auth';

/**
 * Server function to get the current user session.
 * This runs on the server and has direct access to request headers/cookies,
 * avoiding the SSR issue where the auth client would make HTTP requests to itself.
 */
export const getServerSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    return session;
  }
);
