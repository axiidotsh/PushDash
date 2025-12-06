import { createFileRoute } from '@tanstack/react-router';
import { prisma } from '../../db';
import { auth } from '../../auth';
import { jsonResponse, errorResponse } from '../../lib/api-helpers';

export const Route = createFileRoute('/api/auth/cli/callback')({
  server: {
    handlers: {
      /**
       * POST /api/auth/cli/callback
       * Complete CLI authentication after browser login
       * Called from the browser after user authenticates
       */
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { code } = body;

          if (!code || typeof code !== 'string') {
            return errorResponse('Code is required', 400, 'Validation Error');
          }

          // Get the current user session
          const session = await auth.api.getSession({
            headers: request.headers,
          });

          if (!session?.user) {
            return errorResponse('Not authenticated', 401, 'Unauthorized');
          }

          // Find the auth request
          const authRequest = await prisma.cliAuthRequest.findUnique({
            where: { code },
          });

          if (!authRequest) {
            return errorResponse('Invalid or expired code', 404, 'Not Found');
          }

          // Check if expired
          if (authRequest.expiresAt < new Date()) {
            await prisma.cliAuthRequest.update({
              where: { id: authRequest.id },
              data: { status: 'EXPIRED' },
            });
            return errorResponse(
              'Authentication code has expired',
              410,
              'Gone'
            );
          }

          // Check if already completed
          if (authRequest.status === 'COMPLETED') {
            return errorResponse(
              'Code has already been used',
              400,
              'Bad Request'
            );
          }

          // Get the session token from cookies
          const sessionToken = session.session?.token;

          if (!sessionToken) {
            return errorResponse(
              'Session token not found',
              500,
              'Internal Server Error'
            );
          }

          // Update the auth request with the session token
          await prisma.cliAuthRequest.update({
            where: { id: authRequest.id },
            data: {
              status: 'COMPLETED',
              token: sessionToken,
              userId: session.user.id,
            },
          });

          return jsonResponse({
            success: true,
            message: 'CLI authentication completed. You can close this window.',
          });
        } catch (error) {
          console.error('CLI auth callback error:', error);
          return errorResponse(
            'Failed to complete authentication',
            500,
            'Internal Server Error'
          );
        }
      },
    },
  },
});
