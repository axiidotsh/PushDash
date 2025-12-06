import { createFileRoute } from '@tanstack/react-router';
import { prisma } from '../../db';
import { auth } from '../../auth';
import {
  jsonResponse,
  errorResponse,
  getShareUrl,
} from '../../lib/api-helpers';

export const Route = createFileRoute('/api/files/$id/share')({
  server: {
    handlers: {
      /**
       * POST /api/files/:id/share
       * Create a share link for a file
       */
      POST: async ({ request, params }) => {
        try {
          const { id } = params;

          // Get the current user session
          const session = await auth.api.getSession({
            headers: request.headers,
          });

          if (!session?.user) {
            return errorResponse('Not authenticated', 401, 'Unauthorized');
          }

          // Find the file
          const file = await prisma.file.findUnique({
            where: { id },
            include: {
              shareLinks: true,
            },
          });

          if (!file) {
            return errorResponse('File not found', 404, 'Not Found');
          }

          // Check ownership
          if (file.userId !== session.user.id) {
            return errorResponse('Access denied', 403, 'Forbidden');
          }

          // Check if share link already exists
          if (file.shareLinks.length > 0) {
            const existingLink = file.shareLinks[0];
            return jsonResponse({
              shareLink: {
                id: existingLink.id,
                token: existingLink.token,
                url: getShareUrl(existingLink.token),
                createdAt: existingLink.createdAt.toISOString(),
              },
              message: 'Share link already exists',
            });
          }

          // Create new share link
          const shareLink = await prisma.shareLink.create({
            data: {
              fileId: id,
            },
          });

          return jsonResponse({
            shareLink: {
              id: shareLink.id,
              token: shareLink.token,
              url: getShareUrl(shareLink.token),
              createdAt: shareLink.createdAt.toISOString(),
            },
            message: 'Share link created successfully',
          });
        } catch (error) {
          console.error('Create share link error:', error);
          return errorResponse(
            'Failed to create share link',
            500,
            'Internal Server Error'
          );
        }
      },

      /**
       * DELETE /api/files/:id/share
       * Revoke all share links for a file
       */
      DELETE: async ({ request, params }) => {
        try {
          const { id } = params;

          // Get the current user session
          const session = await auth.api.getSession({
            headers: request.headers,
          });

          if (!session?.user) {
            return errorResponse('Not authenticated', 401, 'Unauthorized');
          }

          // Find the file
          const file = await prisma.file.findUnique({
            where: { id },
          });

          if (!file) {
            return errorResponse('File not found', 404, 'Not Found');
          }

          // Check ownership
          if (file.userId !== session.user.id) {
            return errorResponse('Access denied', 403, 'Forbidden');
          }

          // Delete all share links for this file
          const result = await prisma.shareLink.deleteMany({
            where: { fileId: id },
          });

          return jsonResponse({
            success: true,
            message: `Revoked ${result.count} share link(s)`,
          });
        } catch (error) {
          console.error('Delete share link error:', error);
          return errorResponse(
            'Failed to revoke share link',
            500,
            'Internal Server Error'
          );
        }
      },
    },
  },
});
