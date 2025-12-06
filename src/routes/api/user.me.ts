import { createFileRoute } from '@tanstack/react-router';
import { prisma } from '../../db';
import {
  jsonResponse,
  errorResponse,
  getAuthenticatedUser,
} from '../../lib/api-helpers';

export const Route = createFileRoute('/api/user/me')({
  server: {
    handlers: {
      /**
       * GET /api/user/me
       * Get the current authenticated user's information
       * Supports both browser (cookie) and CLI (Bearer token) auth
       */
      GET: async ({ request }) => {
        try {
          // Get the current user (supports both cookie and Bearer token)
          const user = await getAuthenticatedUser(request);

          if (!user) {
            return errorResponse('Not authenticated', 401, 'Unauthorized');
          }

          // Get file count for the user
          const filesCount = await prisma.file.count({
            where: { userId: user.id },
          });

          return jsonResponse({
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              emailVerified: user.emailVerified,
              filesCount,
            },
          });
        } catch (error) {
          console.error('Get user error:', error);
          return errorResponse(
            'Failed to get user information',
            500,
            'Internal Server Error'
          );
        }
      },
    },
  },
});
