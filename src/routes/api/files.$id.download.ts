import { createFileRoute } from '@tanstack/react-router';
import { prisma } from '../../db';
import { errorResponse, getAuthenticatedUser } from '../../lib/api-helpers';
import { getFile } from '../../lib/storage';

export const Route = createFileRoute('/api/files/$id/download')({
  server: {
    handlers: {
      /**
       * GET /api/files/:id/download
       * Download a file
       * Supports both browser (cookie) and CLI (Bearer token) auth
       */
      GET: async ({ request, params }) => {
        try {
          const { id } = params;

          // Get the current user (supports both cookie and Bearer token)
          const user = await getAuthenticatedUser(request);

          // Find the file
          const file = await prisma.file.findUnique({
            where: { id },
          });

          if (!file) {
            return errorResponse('File not found', 404, 'Not Found');
          }

          // Check access permissions
          const isOwner = user?.id === file.userId;
          const isPublic = file.isPublic;

          if (!isOwner && !isPublic) {
            return errorResponse('Access denied', 403, 'Forbidden');
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
          console.error('Download file error:', error);
          return errorResponse(
            'Failed to download file',
            500,
            'Internal Server Error'
          );
        }
      },
    },
  },
});
