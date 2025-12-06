import { createFileRoute } from '@tanstack/react-router';
import { prisma } from '../../db';
import {
  jsonResponse,
  errorResponse,
  getFileUrl,
  getDownloadUrl,
  getAuthenticatedUser,
} from '../../lib/api-helpers';
import { uploadFile, generateStorageKey } from '../../lib/storage';
import {
  getMimeType,
  validateFileSize,
  sanitizeFilename,
} from '../../lib/file-utils';
import { uploadFileSchema } from '../../schemas/file.schema';

export const Route = createFileRoute('/api/files/upload')({
  server: {
    handlers: {
      /**
       * POST /api/files/upload
       * Upload a file with optional metadata
       * Expects multipart/form-data with 'file' field
       * Supports both browser (cookie) and CLI (Bearer token) auth
       */
      POST: async ({ request }) => {
        try {
          // Get the current user (supports both cookie and Bearer token)
          const user = await getAuthenticatedUser(request);

          if (!user) {
            return errorResponse('Not authenticated', 401, 'Unauthorized');
          }

          const userId = user.id;

          // Parse multipart form data
          const formData = await request.formData();
          const file = formData.get('file') as File | null;

          if (!file) {
            return errorResponse('No file provided', 400, 'Validation Error');
          }

          // Get metadata from form
          const tag = formData.get('tag') as string | null;
          const message = formData.get('message') as string | null;
          const isPublicStr = formData.get('isPublic') as string | null;

          // Validate metadata
          const metadataResult = uploadFileSchema.safeParse({
            tag,
            message,
            isPublic: isPublicStr,
          });

          if (!metadataResult.success) {
            return errorResponse(
              metadataResult.error.issues.map((e) => e.message).join(', '),
              400,
              'Validation Error'
            );
          }

          const metadata = metadataResult.data;

          // Validate file size
          const sizeValidation = validateFileSize(file.size);
          if (!sizeValidation.valid) {
            return errorResponse(
              sizeValidation.error!,
              413,
              'Payload Too Large'
            );
          }

          // Get file info
          const originalName = file.name;
          const mimeType = file.type || getMimeType(originalName);
          const sanitizedFilename = sanitizeFilename(originalName);

          // Generate storage key
          const storageKey = generateStorageKey(userId, sanitizedFilename);

          // Convert file to buffer
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Upload to S3
          await uploadFile(storageKey, buffer, mimeType);

          // Create file record in database
          const fileRecord = await prisma.file.create({
            data: {
              filename: sanitizedFilename,
              originalName,
              mimeType,
              size: file.size,
              storageKey,
              tag: metadata.tag,
              message: metadata.message,
              isPublic: metadata.isPublic,
              userId,
            },
          });

          return jsonResponse({
            file: {
              id: fileRecord.id,
              filename: fileRecord.originalName, // CLI expects original name as filename
              originalName: fileRecord.originalName,
              mimeType: fileRecord.mimeType,
              type: fileRecord.mimeType, // CLI expects 'type' field
              size: fileRecord.size,
              tag: fileRecord.tag,
              message: fileRecord.message,
              isPublic: fileRecord.isPublic,
              url: getFileUrl(fileRecord.id),
              downloadUrl: getDownloadUrl(fileRecord.id),
              createdAt: fileRecord.createdAt.toISOString(),
              updatedAt: fileRecord.updatedAt.toISOString(),
            },
          });
        } catch (error) {
          console.error('File upload error:', error);
          return errorResponse(
            'Failed to upload file',
            500,
            'Internal Server Error'
          );
        }
      },
    },
  },
});
