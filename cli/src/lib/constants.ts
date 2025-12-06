import { homedir } from 'os';
import { join } from 'path';

export const API_BASE_URL = 'https://pushdash.carboxy.dev';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN_INIT: '/api/auth/cli/init',
  LOGIN_POLL: '/api/auth/cli/poll',
  LOGOUT: '/api/auth/logout',

  // User endpoints
  USER_ME: '/api/user/me',

  // File endpoints
  FILE_UPLOAD: '/api/files/upload',
  FILE_LIST: '/api/files',
} as const;

// Config paths
export const CONFIG_DIR = join(homedir(), '.pushdash');
export const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

// OAuth callback
export const CLI_CALLBACK_PORT = 3456;
export const CLI_CALLBACK_URL = `http://localhost:${CLI_CALLBACK_PORT}/callback`;
