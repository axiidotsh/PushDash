export interface Config {
  authToken?: string;
  userId?: string;
  userEmail?: string;
  apiUrl: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  filesCount?: number;
}

export interface UploadedFile {
  id: string;
  filename: string;
  url: string;
  shareUrl?: string;
  size: number;
  type: string;
  tag?: string;
  message?: string;
  isPublic: boolean;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface PollPendingResponse {
  status: 'pending';
  message: string;
}

export interface PollCompletedResponse {
  status: 'completed';
  token: string;
  user: User;
}

export type PollResponse = PollPendingResponse | PollCompletedResponse;

export interface UploadResponse {
  file: UploadedFile;
}

export interface FileListResponse {
  files: UploadedFile[];
  total: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface FileDeleteResponse {
  success: boolean;
  message: string;
}

export interface FileListOptions {
  limit?: number;
  page?: number;
  sortBy?: 'createdAt' | 'filename' | 'size';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  tag?: string;
  isPublic?: boolean;
}

export interface FileDetail extends UploadedFile {
  originalName: string;
  mimeType: string;
  downloadUrl: string;
  isOwner: boolean;
  updatedAt: string;
}

export interface FileDetailResponse {
  file: FileDetail;
}

export interface ShareLink {
  id: string;
  token: string;
  url: string;
  createdAt: string;
}

export interface ShareLinkResponse {
  shareLink: ShareLink;
  message: string;
}

export interface FileShare {
  id: string;
  email: string;
  createdAt: string;
}

export interface FileSharesResponse {
  shares: FileShare[];
  total: number;
  success?: boolean;
  message?: string;
}
