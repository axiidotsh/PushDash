import axios, { AxiosInstance, AxiosError } from 'axios';
import FormData from 'form-data';
import { createReadStream, statSync } from 'fs';
import { API_BASE_URL, API_ENDPOINTS } from './constants.js';
import { ConfigManager } from './config-manager.js';
import type {
  User,
  LoginResponse,
  UploadResponse,
  FileListResponse,
  PollResponse,
} from '../types/index.js';

export class ApiClient {
  private client: AxiosInstance;
  private configManager: ConfigManager;

  constructor() {
    this.configManager = ConfigManager.getInstance();
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use(async (config) => {
      const token = await this.configManager.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth methods
  async initiateLogin(): Promise<{ loginUrl: string; deviceCode: string }> {
    const response = await this.client.post(API_ENDPOINTS.LOGIN_INIT);
    return response.data;
  }

  async pollLogin(deviceCode: string): Promise<PollResponse> {
    const response = await this.client.post(API_ENDPOINTS.LOGIN_POLL, {
      deviceCode,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Ignore errors during logout
    }
  }

  // User methods
  async getCurrentUser(): Promise<User> {
    const response = await this.client.get(API_ENDPOINTS.USER_ME);
    return response.data.user;
  }

  // File methods
  async uploadFile(
    filePath: string,
    options: {
      tag?: string;
      message?: string;
      isPublic?: boolean;
    } = {}
  ): Promise<UploadResponse> {
    const form = new FormData();
    const stats = statSync(filePath);

    form.append('file', createReadStream(filePath));

    if (options.tag) {
      form.append('tag', options.tag);
    }
    if (options.message) {
      form.append('message', options.message);
    }
    if (options.isPublic !== undefined) {
      form.append('isPublic', String(options.isPublic));
    }

    const response = await this.client.post(API_ENDPOINTS.FILE_UPLOAD, form, {
      headers: {
        ...form.getHeaders(),
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    return response.data;
  }

  async listFiles(limit = 10): Promise<FileListResponse> {
    const response = await this.client.get(API_ENDPOINTS.FILE_LIST, {
      params: { limit },
    });
    return response.data;
  }

  // Error handling helper
  static handleError(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      if (axiosError.response?.data?.message) {
        return axiosError.response.data.message;
      }
      if (axiosError.response?.status === 401) {
        return 'Authentication required. Please run "pushdash login"';
      }
      if (axiosError.response?.status === 403) {
        return 'Access forbidden';
      }
      if (axiosError.code === 'ECONNREFUSED') {
        return 'Cannot connect to PushDash API. Please check your internet connection.';
      }
      return axiosError.message;
    }
    return 'An unexpected error occurred';
  }
}
