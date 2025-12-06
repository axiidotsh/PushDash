import { createFileRoute } from '@tanstack/react-router';
import { prisma } from '../../db';
import { errorResponse, getAuthenticatedUser } from '../../lib/api-helpers';
import { getFile } from '../../lib/storage';

export const Route = createFileRoute('/api/share/$token/download')({
  server: {
    handlers: {
      /**
       * GET /api/share/:token/download
       * Download a shared file via share token
       * - Public files: Anyone can download
       * - Private files: Only owner or users with email share access
       */
      GET: async ({ request, params }) => {
        try {
          const { token } = params;

          // Find the share link
          const shareLink = await prisma.shareLink.findUnique({
            where: { token },
            include: {
              file: {
                include: {
                  shares: true,
                },
              },
            },
          });

          if (!shareLink) {
            return errorResponse(
              'Share link not found or expired',
              404,
              'Not Found'
            );
          }

          const file = shareLink.file;

          // If file is private, check access permissions
          if (!file.isPublic) {
            const user = await getAuthenticatedUser(request);

            if (!user) {
              return errorResponse(
                'Authentication required to download this file',
                401,
                'Unauthorized'
              );
            }

            // Check if user is owner or has email access
            const isOwner = user.id === file.userId;
            const hasEmailAccess = file.shares.some(
              (share) => share.email.toLowerCase() === user.email.toLowerCase()
            );

            if (!isOwner && !hasEmailAccess) {
              return errorResponse(
                'You do not have access to this file',
                403,
                'Forbidden'
              );
            }
          }

          // Get file from storage
          const fileBuffer = await getFile(file.storageKey);

          // Return file with proper headers
          return new Response(new Uint8Array(fileBuffer), {
            status: 200,
            headers: {
              'Content-Type': file.mimeType,
              'Content-Disposition': `attachment; filename="${encodeURIComponent(file.originalName)}"`,
              'Content-Length': file.size.toString(),
              'Cache-Control': 'private, max-age=3600',
            },
          });
        } catch (error) {
          console.error('Download shared file error:', error);
          return errorResponse(
            'Failed to download shared file',
            500,
            'Internal Server Error'
          );
        }
      },
    },
  },
});
