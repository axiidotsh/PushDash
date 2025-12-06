import { createFileRoute } from '@tanstack/react-router';
import { prisma } from '../../db';
import {
  jsonResponse,
  errorResponse,
  getAuthenticatedUser,
} from '../../lib/api-helpers';
import { z } from 'zod';

// Schema for adding shares
const addSharesSchema = z.object({
  emails: z
    .array(z.string().email('Invalid email address'))
    .min(1, 'At least one email is required')
    .max(20, 'Maximum 20 emails at once'),
});

// Schema for removing a share
const removeShareSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const Route = createFileRoute('/api/files/$id/shares')({
  server: {
    handlers: {
      /**
       * GET /api/files/:id/shares
       * List all email shares for a file
       */
      GET: async ({ request, params }) => {
        try {
          const { id } = params;

          const user = await getAuthenticatedUser(request);

          if (!user) {
            return errorResponse('Not authenticated', 401, 'Unauthorized');
          }

          // Find the file
          const file = await prisma.file.findUnique({
            where: { id },
            include: {
              shares: {
                orderBy: { createdAt: 'desc' },
              },
            },
          });

          if (!file) {
            return errorResponse('File not found', 404, 'Not Found');
          }

          // Check ownership
          if (file.userId !== user.id) {
            return errorResponse('Access denied', 403, 'Forbidden');
          }

          return jsonResponse({
            shares: file.shares.map((share) => ({
              id: share.id,
              email: share.email,
              createdAt: share.createdAt.toISOString(),
            })),
            total: file.shares.length,
          });
        } catch (error) {
          console.error('List shares error:', error);
          return errorResponse(
            'Failed to list shares',
            500,
            'Internal Server Error'
          );
        }
      },

      /**
       * POST /api/files/:id/shares
       * Add email addresses to share the file with
       */
      POST: async ({ request, params }) => {
        try {
          const { id } = params;

          const user = await getAuthenticatedUser(request);

          if (!user) {
            return errorResponse('Not authenticated', 401, 'Unauthorized');
          }

          // Parse request body
          const body = await request.json();
          const parsed = addSharesSchema.safeParse(body);

          if (!parsed.success) {
            return errorResponse(
              parsed.error.issues.map((e) => e.message).join(', '),
              400,
              'Validation Error'
            );
          }

          const { emails } = parsed.data;

          // Find the file
          const file = await prisma.file.findUnique({
            where: { id },
          });

          if (!file) {
            return errorResponse('File not found', 404, 'Not Found');
          }

          // Check ownership
          if (file.userId !== user.id) {
            return errorResponse('Access denied', 403, 'Forbidden');
          }

          // Normalize emails to lowercase
          const normalizedEmails = emails.map((e) => e.toLowerCase().trim());

          // Filter out the owner's email
          const filteredEmails = normalizedEmails.filter(
            (e) => e !== user.email.toLowerCase()
          );

          if (filteredEmails.length === 0) {
            return errorResponse(
              "You can't share a file with yourself",
              400,
              'Validation Error'
            );
          }

          // Create shares (upsert to handle duplicates gracefully)
          const results = await Promise.allSettled(
            filteredEmails.map((email) =>
              prisma.fileShare.upsert({
                where: {
                  fileId_email: { fileId: id, email },
                },
                create: {
                  fileId: id,
                  email,
                  sharedBy: user.id,
                },
                update: {}, // No update needed, just ensure it exists
              })
            )
          );

          const created = results.filter(
            (r) => r.status === 'fulfilled'
          ).length;
          const failed = results.filter((r) => r.status === 'rejected').length;

          // Get updated shares list
          const shares = await prisma.fileShare.findMany({
            where: { fileId: id },
            orderBy: { createdAt: 'desc' },
          });

          return jsonResponse({
            success: true,
            message: `Shared with ${created} email(s)${failed > 0 ? `, ${failed} failed` : ''}`,
            shares: shares.map((share) => ({
              id: share.id,
              email: share.email,
              createdAt: share.createdAt.toISOString(),
            })),
          });
        } catch (error) {
          console.error('Add shares error:', error);
          return errorResponse(
            'Failed to add shares',
            500,
            'Internal Server Error'
          );
        }
      },

      /**
       * DELETE /api/files/:id/shares
       * Remove an email from file shares
       * Expects { email: string } in body
       */
      DELETE: async ({ request, params }) => {
        try {
          const { id } = params;

          const user = await getAuthenticatedUser(request);

          if (!user) {
            return errorResponse('Not authenticated', 401, 'Unauthorized');
          }

          // Parse request body
          const body = await request.json();
          const parsed = removeShareSchema.safeParse(body);

          if (!parsed.success) {
            return errorResponse(
              parsed.error.issues.map((e) => e.message).join(', '),
              400,
              'Validation Error'
            );
          }

          const { email } = parsed.data;

          // Find the file
          const file = await prisma.file.findUnique({
            where: { id },
          });

          if (!file) {
            return errorResponse('File not found', 404, 'Not Found');
          }

          // Check ownership
          if (file.userId !== user.id) {
            return errorResponse('Access denied', 403, 'Forbidden');
          }

          // Delete the share
          const normalizedEmail = email.toLowerCase().trim();

          try {
            await prisma.fileShare.delete({
              where: {
                fileId_email: { fileId: id, email: normalizedEmail },
              },
            });
          } catch {
            return errorResponse('Share not found', 404, 'Not Found');
          }

          // Get updated shares list
          const shares = await prisma.fileShare.findMany({
            where: { fileId: id },
            orderBy: { createdAt: 'desc' },
          });

          return jsonResponse({
            success: true,
            message: `Removed access for ${email}`,
            shares: shares.map((share) => ({
              id: share.id,
              email: share.email,
              createdAt: share.createdAt.toISOString(),
            })),
          });
        } catch (error) {
          console.error('Remove share error:', error);
          return errorResponse(
            'Failed to remove share',
            500,
            'Internal Server Error'
          );
        }
      },
    },
  },
});
