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

export interface UploadResponse {
  file: UploadedFile;
}

export interface FileListResponse {
  files: UploadedFile[];
  total: number;
}
