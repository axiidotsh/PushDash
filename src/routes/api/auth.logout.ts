import { createFileRoute } from '@tanstack/react-router';
import { prisma } from '../../db';
import {
  jsonResponse,
  errorResponse,
  getBearerToken,
} from '../../lib/api-helpers';

export const Route = createFileRoute('/api/auth/logout')({
  server: {
    handlers: {
      /**
       * POST /api/auth/logout
       * Logout endpoint for CLI (invalidates bearer token)
       */
      POST: async ({ request }) => {
        try {
          const token = getBearerToken(request);

          if (token) {
            // Delete the session associated with this token
            await prisma.session.deleteMany({
              where: { token },
            });
          }

          return jsonResponse({
            success: true,
            message: 'Logged out successfully',
          });
        } catch (error) {
          console.error('Logout error:', error);
          // Return success anyway - logout should always "succeed"
          return jsonResponse({
            success: true,
            message: 'Logged out',
          });
        }
      },
    },
  },
});
