import { z } from 'zod';

/**
 * Schema for file upload metadata
 */
export const uploadFileSchema = z.object({
  tag: z
    .string()
    .max(50, 'Tag must be 50 characters or less')
    .optional()
    .nullable(),
  message: z
    .string()
    .max(500, 'Message must be 500 characters or less')
    .optional()
    .nullable(),
  isPublic: z
    .union([z.boolean(), z.string().transform((v) => v === 'true')])
    .default(false),
});

export type UploadFileInput = z.infer<typeof uploadFileSchema>;

/**
 * Schema for file query parameters
 */
export const fileQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(['createdAt', 'filename', 'size', 'updatedAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().max(100).optional(),
  tag: z.string().max(50).optional(),
  mimeType: z.string().max(100).optional(),
  isPublic: z
    .union([z.boolean(), z.string().transform((v) => v === 'true')])
    .optional(),
});

export type FileQueryInput = z.infer<typeof fileQuerySchema>;

/**
 * Schema for file update
 */
export const updateFileSchema = z.object({
  tag: z.string().max(50).optional().nullable(),
  message: z.string().max(500).optional().nullable(),
  isPublic: z.boolean().optional(),
});

export type UpdateFileInput = z.infer<typeof updateFileSchema>;

/**
 * Schema for share link creation
 */
export const createShareLinkSchema = z.object({
  fileId: z.string().min(1, 'File ID is required'),
});

export type CreateShareLinkInput = z.infer<typeof createShareLinkSchema>;

/**
 * Schema for CLI auth init response
 */
export const cliAuthInitResponseSchema = z.object({
  code: z.string(),
  loginUrl: z.string().url(),
  expiresAt: z.string().datetime(),
});

/**
 * Schema for CLI auth poll request
 */
export const cliAuthPollSchema = z.object({
  code: z.string().min(1, 'Code is required'),
});

export type CliAuthPollInput = z.infer<typeof cliAuthPollSchema>;

/**
 * File response schema (for API responses)
 */
export const fileResponseSchema = z.object({
  id: z.string(),
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  tag: z.string().nullable(),
  message: z.string().nullable(),
  isPublic: z.boolean(),
  url: z.string(),
  downloadUrl: z.string(),
  shareUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type FileResponse = z.infer<typeof fileResponseSchema>;

/**
 * Paginated file list response schema
 */
export const fileListResponseSchema = z.object({
  files: z.array(fileResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
});

export type FileListResponse = z.infer<typeof fileListResponseSchema>;

/**
 * User response schema
 */
export const userResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  filesCount: z.number().optional(),
});

export type UserResponse = z.infer<typeof userResponseSchema>;
