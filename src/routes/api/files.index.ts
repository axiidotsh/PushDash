import { createFileRoute } from '@tanstack/react-router';
import { prisma } from '../../db';
import {
  jsonResponse,
  errorResponse,
  getFileUrl,
  getDownloadUrl,
  getAuthenticatedUser,
} from '../../lib/api-helpers';
import { fileQuerySchema } from '../../schemas/file.schema';
import type { Prisma } from '../../generated/prisma/client';

export const Route = createFileRoute('/api/files/')({
  server: {
    handlers: {
      /**
       * GET /api/files
       * List files for the authenticated user with filtering, sorting, and pagination
       * Supports both browser (cookie) and CLI (Bearer token) auth
       */
      GET: async ({ request }) => {
        try {
          // Get the current user (supports both cookie and Bearer token)
          const user = await getAuthenticatedUser(request);

          if (!user) {
            return errorResponse('Not authenticated', 401, 'Unauthorized');
          }

          const userId = user.id;

          // Parse query parameters
          const url = new URL(request.url);
          const queryParams = Object.fromEntries(url.searchParams.entries());

          const parsed = fileQuerySchema.safeParse(queryParams);
          if (!parsed.success) {
            return errorResponse(
              parsed.error.issues.map((e) => e.message).join(', '),
              400,
              'Validation Error'
            );
          }

          const {
            page,
            limit,
            sortBy,
            sortOrder,
            search,
            tag,
            mimeType,
            isPublic,
          } = parsed.data;

          // Build where clause
          const where: Prisma.FileWhereInput = {
            userId,
          };

          if (search) {
            where.OR = [
              { filename: { contains: search, mode: 'insensitive' } },
              { originalName: { contains: search, mode: 'insensitive' } },
              { tag: { contains: search, mode: 'insensitive' } },
              { message: { contains: search, mode: 'insensitive' } },
            ];
          }

          if (tag) {
            where.tag = tag;
          }

          if (mimeType) {
            where.mimeType = { startsWith: mimeType };
          }

          if (isPublic !== undefined) {
            where.isPublic = isPublic;
          }

          // Get total count
          const total = await prisma.file.count({ where });

          // Calculate pagination
          const offset = (page - 1) * limit;
          const totalPages = Math.ceil(total / limit);
          const hasMore = page < totalPages;

          // Fetch files
          const files = await prisma.file.findMany({
            where,
            orderBy: { [sortBy]: sortOrder },
            skip: offset,
            take: limit,
          });

          return jsonResponse({
            files: files.map((file) => ({
              id: file.id,
              filename: file.originalName, // CLI expects original name
              originalName: file.originalName,
              mimeType: file.mimeType,
              type: file.mimeType, // CLI expects 'type' field
              size: file.size,
              tag: file.tag,
              message: file.message,
              isPublic: file.isPublic,
              url: getFileUrl(file.id),
              downloadUrl: getDownloadUrl(file.id),
              createdAt: file.createdAt.toISOString(),
              updatedAt: file.updatedAt.toISOString(),
            })),
            total, // CLI expects total at top level
            pagination: {
              page,
              limit,
              total,
              totalPages,
              hasMore,
            },
          });
        } catch (error) {
          console.error('File list error:', error);
          return errorResponse(
            'Failed to list files',
            500,
            'Internal Server Error'
          );
        }
      },
    },
  },
});
