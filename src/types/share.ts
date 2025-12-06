/**
 * Share types for PushDash
 * Types for email-based file sharing
 */

/**
 * File share record - represents an email that has access to a file
 */
export interface FileShare {
  id: string;
  email: string;
  createdAt: string;
}

/**
 * API response for GET /api/files/:id/shares
 */
export interface FileSharesResponse {
  shares: FileShare[];
  total: number;
}

/**
 * API response for POST /api/files/:id/shares
 */
export interface AddSharesResponse {
  success: boolean;
  message: string;
  shares: FileShare[];
}

/**
 * API response for DELETE /api/files/:id/shares
 */
export interface RemoveShareResponse {
  success: boolean;
  message: string;
  shares: FileShare[];
}

/**
 * Request body for adding email shares
 */
export interface AddSharesRequest {
  emails: string[];
}

/**
 * Request body for removing an email share
 */
export interface RemoveShareRequest {
  email: string;
}
