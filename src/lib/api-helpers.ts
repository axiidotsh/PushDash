import { auth } from '../auth';
import { env } from '../env';

/**
 * API Response types
 */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface ApiSuccess<T> {
  data: T;
}

/**
 * Create a JSON response with proper headers
 */
export function jsonResponse<T>(data: T, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Create an error response
 */
export function errorResponse(
  message: string,
  statusCode: number = 400,
  error: string = 'Bad Request'
): Response {
  return jsonResponse<ApiError>(
    {
      error,
      message,
      statusCode,
    },
    statusCode
  );
}

/**
 * Create a success response
 */
export function successResponse<T>(data: T, status: number = 200): Response {
  return jsonResponse(data, status);
}

/**
 * Get the authenticated user from a request
 * Supports both session cookies (browser) and Bearer token (CLI)
 * Returns null if not authenticated
 */
export async function getAuthenticatedUser(request: Request) {
  try {
    // First try session-based auth (browser)
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (session?.user) {
      return session.user;
    }

    // Fall back to Bearer token auth (CLI)
    const token = getBearerToken(request);
    if (token) {
      // Import prisma here to avoid circular dependency
      const { prisma } = await import('../db');
      const dbSession = await prisma.session.findUnique({
        where: { token },
        include: { user: true },
      });
      if (dbSession && dbSession.expiresAt > new Date()) {
        return dbSession.user;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Require authentication for an API route
 * Throws an error response if not authenticated
 */
export async function requireAuth(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    throw errorResponse('Authentication required', 401, 'Unauthorized');
  }
  return user;
}

/**
 * Get Bearer token from Authorization header
 */
export function getBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Generate the frontend URL for a file (file detail page)
 */
export function getFileUrl(fileId: string): string {
  return `${env.APP_URL}/dashboard/files/${fileId}`;
}

/**
 * Generate the frontend share URL for a file (public share page)
 */
export function getShareUrl(shareToken: string): string {
  return `${env.APP_URL}/share/${shareToken}`;
}

/**
 * Generate the download URL for a file (API endpoint for direct download)
 */
export function getDownloadUrl(fileId: string): string {
  return `${env.APP_URL}/api/files/${fileId}/download`;
}

/**
 * Generate the API URL for a file (for programmatic access)
 */
export function getFileApiUrl(fileId: string): string {
  return `${env.APP_URL}/api/files/${fileId}`;
}

/**
 * Parse pagination parameters from request URL
 */
export function parsePaginationParams(url: URL) {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10))
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Parse sort parameters from request URL
 */
export function parseSortParams(
  url: URL,
  allowedFields: string[] = ['createdAt', 'filename', 'size']
) {
  const sortBy = url.searchParams.get('sortBy') || 'createdAt';
  const sortOrder =
    url.searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

  // Validate sort field
  const validSortBy = allowedFields.includes(sortBy) ? sortBy : 'createdAt';

  return { sortBy: validSortBy, sortOrder };
}

/**
 * Generate a random code for CLI auth
 */
export function generateCliAuthCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * CLI auth expiration time (10 minutes)
 */
export const CLI_AUTH_EXPIRY_MS = 10 * 60 * 1000;
