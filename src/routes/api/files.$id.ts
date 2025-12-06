import { createFileRoute } from '@tanstack/react-router';
import { prisma } from '../../db';
import { auth } from '../../auth';
import {
  jsonResponse,
  errorResponse,
  getFileUrl,
  getDownloadUrl,
  getShareUrl,
} from '../../lib/api-helpers';
import { deleteFile as deleteFromStorage } from '../../lib/storage';
import { updateFileSchema } from '../../schemas/file.schema';

export const Route = createFileRoute('/api/files/$id')({
  server: {
    handlers: {
      /**
       * GET /api/files/:id
       * Get a single file's metadata
       */
      GET: async ({ request, params }) => {
        try {
          const { id } = params;

          // Get the current user session
          const session = await auth.api.getSession({
            headers: request.headers,
          });

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

          // Check access permissions
          const isOwner = session?.user?.id === file.userId;
          const isPublic = file.isPublic;

          if (!isOwner && !isPublic) {
            return errorResponse('Access denied', 403, 'Forbidden');
          }

          // Get share URL if there's an active share link
          const shareLink = file.shareLinks[0];
          const shareUrl = shareLink ? getShareUrl(shareLink.token) : undefined;

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
              shareUrl,
              createdAt: file.createdAt.toISOString(),
              updatedAt: file.updatedAt.toISOString(),
              isOwner,
            },
          });
        } catch (error) {
          console.error('Get file error:', error);
          return errorResponse(
            'Failed to get file',
            500,
            'Internal Server Error'
          );
        }
      },

      /**
       * PATCH /api/files/:id
       * Update a file's metadata
       */
      PATCH: async ({ request, params }) => {
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

          // Parse request body
          const body = await request.json();
          const parsed = updateFileSchema.safeParse(body);

          if (!parsed.success) {
            return errorResponse(
              parsed.error.issues.map((e) => e.message).join(', '),
              400,
              'Validation Error'
            );
          }

          // Update the file
          const updatedFile = await prisma.file.update({
            where: { id },
            data: parsed.data,
          });

          return jsonResponse({
            file: {
              id: updatedFile.id,
              filename: updatedFile.filename,
              originalName: updatedFile.originalName,
              mimeType: updatedFile.mimeType,
              size: updatedFile.size,
              tag: updatedFile.tag,
              message: updatedFile.message,
              isPublic: updatedFile.isPublic,
              url: getFileUrl(updatedFile.id),
              downloadUrl: getDownloadUrl(updatedFile.id),
              createdAt: updatedFile.createdAt.toISOString(),
              updatedAt: updatedFile.updatedAt.toISOString(),
            },
          });
        } catch (error) {
          console.error('Update file error:', error);
          return errorResponse(
            'Failed to update file',
            500,
            'Internal Server Error'
          );
        }
      },

      /**
       * DELETE /api/files/:id
       * Delete a file
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

          // Delete from S3
          try {
            await deleteFromStorage(file.storageKey);
          } catch (storageError) {
            console.error('Failed to delete from storage:', storageError);
            // Continue with database deletion even if storage deletion fails
          }

          // Delete from database (cascades to share links)
          await prisma.file.delete({
            where: { id },
          });

          return jsonResponse({
            success: true,
            message: 'File deleted successfully',
          });
        } catch (error) {
          console.error('Delete file error:', error);
          return errorResponse(
            'Failed to delete file',
            500,
            'Internal Server Error'
          );
        }
      },
    },
  },
});
