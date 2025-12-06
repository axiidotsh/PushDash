import { createFileRoute } from '@tanstack/react-router';
import { prisma } from '../../db';
import { auth } from '../../auth';
import { jsonResponse, errorResponse } from '../../lib/api-helpers';

export const Route = createFileRoute('/api/user/me')({
  server: {
    handlers: {
      /**
       * GET /api/user/me
       * Get the current authenticated user's information
       */
      GET: async ({ request }) => {
        try {
          // Get the current user session
          const session = await auth.api.getSession({
            headers: request.headers,
          });

          if (!session?.user) {
            return errorResponse('Not authenticated', 401, 'Unauthorized');
          }

          // Get file count for the user
          const filesCount = await prisma.file.count({
            where: { userId: session.user.id },
          });

          return jsonResponse({
            user: {
              id: session.user.id,
              email: session.user.email,
              name: session.user.name,
              image: session.user.image,
              emailVerified: session.user.emailVerified,
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
