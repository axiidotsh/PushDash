import { createFileRoute } from '@tanstack/react-router';
import { prisma } from '../../db';
import { jsonResponse, errorResponse } from '../../lib/api-helpers';
import { z } from 'zod';

// CLI sends deviceCode, map it to our internal code field
const cliPollSchema = z.object({
  deviceCode: z.string().min(1, 'Device code is required'),
});

export const Route = createFileRoute('/api/auth/cli/poll')({
  server: {
    handlers: {
      /**
       * POST /api/auth/cli/poll
       * Poll for CLI authentication completion
       * CLI calls this repeatedly until auth is completed or expires
       */
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const parsed = cliPollSchema.safeParse(body);

          if (!parsed.success) {
            return errorResponse(
              parsed.error.issues.map((e) => e.message).join(', '),
              400,
              'Validation Error'
            );
          }

          const code = parsed.data.deviceCode; // Map deviceCode to code

          // Find the auth request
          const authRequest = await prisma.cliAuthRequest.findUnique({
            where: { code },
          });

          if (!authRequest) {
            return errorResponse('Invalid or expired code', 404, 'Not Found');
          }

          // Check if expired
          if (authRequest.expiresAt < new Date()) {
            // Update status to expired
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

          // Check status
          if (authRequest.status === 'EXPIRED') {
            return errorResponse(
              'Authentication code has expired',
              410,
              'Gone'
            );
          }

          if (authRequest.status === 'PENDING') {
            return jsonResponse({
              status: 'pending',
              message: 'Waiting for browser authentication',
            });
          }

          if (authRequest.status === 'COMPLETED' && authRequest.token) {
            // Get user info
            const session = await prisma.session.findUnique({
              where: { token: authRequest.token },
              include: { user: true },
            });

            if (!session) {
              return errorResponse('Session not found', 404, 'Not Found');
            }

            // Clean up the auth request
            await prisma.cliAuthRequest.delete({
              where: { id: authRequest.id },
            });

            return jsonResponse({
              status: 'completed',
              token: authRequest.token,
              user: {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
              },
            });
          }

          return errorResponse(
            'Unknown authentication status',
            500,
            'Internal Server Error'
          );
        } catch (error) {
          console.error('CLI auth poll error:', error);
          return errorResponse(
            'Failed to check authentication status',
            500,
            'Internal Server Error'
          );
        }
      },
    },
  },
});
