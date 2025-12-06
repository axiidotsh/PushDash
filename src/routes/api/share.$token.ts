import { createFileRoute } from '@tanstack/react-router';
import { prisma } from '../../db';
import {
  jsonResponse,
  errorResponse,
  getFileUrl,
  getDownloadUrl,
  getShareUrl,
  getAuthenticatedUser,
} from '../../lib/api-helpers';

export const Route = createFileRoute('/api/share/$token')({
  server: {
    handlers: {
      /**
       * GET /api/share/:token
       * Access a shared file via share token
       * - Public files: Anyone can access
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
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
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

          // If file is public, allow access to everyone
          if (file.isPublic) {
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
              accessGranted: true,
            });
          }

          // For private files, check if user is authenticated
          const user = await getAuthenticatedUser(request);

          if (!user) {
            // Return limited info - user needs to log in
            return jsonResponse({
              file: {
                id: file.id,
                originalName: file.originalName,
                isPublic: false,
                owner: {
                  name: file.user.name,
                },
              },
              accessGranted: false,
              requiresAuth: true,
              message: 'Please sign in to access this file',
            });
          }

          // Check if user is the owner
          if (user.id === file.userId) {
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
              accessGranted: true,
              accessReason: 'owner',
            });
          }

          // Check if user has been granted access via email share
          const hasEmailAccess = file.shares.some(
            (share) => share.email.toLowerCase() === user.email.toLowerCase()
          );

          if (hasEmailAccess) {
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
              accessGranted: true,
              accessReason: 'shared',
            });
          }

          // User is logged in but doesn't have access
          return jsonResponse({
            file: {
              id: file.id,
              originalName: file.originalName,
              isPublic: false,
              owner: {
                name: file.user.name,
              },
            },
            accessGranted: false,
            requiresAuth: false,
            message: 'You do not have access to this file',
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
