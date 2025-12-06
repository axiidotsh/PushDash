import { existsSync, statSync } from 'fs';
import { basename } from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import { API_BASE_URL, API_ENDPOINTS } from './constants.js';
import { ConfigManager } from './config-manager.js';
import { Logger } from './logger.js';
import type { UploadResponse } from '../types/index.js';

export class FileUploader {
  private configManager: ConfigManager;

  constructor() {
    this.configManager = ConfigManager.getInstance();
  }

  async upload(
    filePath: string,
    options: {
      tag?: string;
      message?: string;
      isPublic?: boolean;
    } = {}
  ): Promise<UploadResponse> {
    // Validate file exists
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const stats = statSync(filePath);
    if (!stats.isFile()) {
      throw new Error(`Not a file: ${filePath}`);
    }

    const filename = basename(filePath);
    const fileSize = stats.size;

    // Create form data
    const form = new FormData();
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

    // Get auth token
    const token = await this.configManager.getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please run "pushdash login"');
    }

    // Create spinner for upload
    const spinner = Logger.spinner(`Uploading ${filename}...`);

    let lastPercent = 0;

    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.FILE_UPLOAD}`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${token}`,
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              if (percent !== lastPercent && percent % 10 === 0) {
                spinner.text = `Uploading ${filename}... ${percent}%`;
                lastPercent = percent;
              }
            }
          },
        }
      );

      spinner.succeed(`Uploaded ${filename}`);
      return response.data;
    } catch (error) {
      spinner.fail(`Failed to upload ${filename}`);
      throw error;
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
