import { createFileRoute } from '@tanstack/react-router';
import { prisma } from '../../db';
import {
  jsonResponse,
  errorResponse,
  getFileUrl,
  getDownloadUrl,
  getShareUrl,
} from '../../lib/api-helpers';

export const Route = createFileRoute('/api/share/$token')({
  server: {
    handlers: {
      /**
       * GET /api/share/:token
       * Access a shared file via share token
       */
      GET: async ({ params }) => {
        try {
          const { token } = params;

          // Find the share link
          const shareLink = await prisma.shareLink.findUnique({
            where: { token },
            include: {
              file: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
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

          return jsonResponse({
            file: {
              id: file.id,
              filename: file.filename,
              originalName: file.originalName,
              mimeType: file.mimeType,
              size: file.size,
              tag: file.tag,
              message: file.message,
              isPublic: file.isPublic,
              url: getFileUrl(file.id),
              downloadUrl: getDownloadUrl(file.id),
              shareUrl: getShareUrl(token),
              createdAt: file.createdAt.toISOString(),
              updatedAt: file.updatedAt.toISOString(),
              owner: {
                id: file.user.id,
                name: file.user.name,
              },
            },
          });
        } catch (error) {
          console.error('Get shared file error:', error);
          return errorResponse(
            'Failed to get shared file',
            500,
            'Internal Server Error'
          );
        }
      },
    },
  },
});
