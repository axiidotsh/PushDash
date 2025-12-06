import { z } from 'zod';

/**
 * Common reusable validation schemas
 */

/**
 * ID validation - accepts UUIDs, CUIDs, or custom IDs
 */
export const idSchema = z.string().min(1, 'ID is required');

/**
 * UUID validation
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .toLowerCase()
  .trim();

/**
 * Password validation with strength requirements
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Name validation
 */
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .trim();

/**
 * URL validation
 */
export const urlSchema = z.string().url('Please enter a valid URL');

/**
 * Optional URL validation (can be null or undefined)
 */
export const optionalUrlSchema = z
  .string()
  .url('Please enter a valid URL')
  .optional()
  .nullable();

/**
 * Date string validation (ISO 8601 format)
 */
export const dateStringSchema = z.string().datetime('Invalid date format');

/**
 * Boolean validation with coercion from string
 */
export const booleanSchema = z.coerce.boolean();

/**
 * Positive integer validation
 */
export const positiveIntSchema = z.coerce
  .number()
  .int()
  .positive('Must be a positive integer');

/**
 * Non-negative integer validation
 */
export const nonNegativeIntSchema = z.coerce
  .number()
  .int()
  .nonnegative('Must be a non-negative integer');

/**
 * Pagination schema for list endpoints
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * Search/filter schema
 */
export const searchSchema = z.object({
  search: z.string().max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * Combined pagination and search schema
 */
export const paginatedSearchSchema = paginationSchema.merge(searchSchema);

/**
 * TypeScript types inferred from common schemas
 */
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type PaginatedSearchInput = z.infer<typeof paginatedSearchSchema>;
