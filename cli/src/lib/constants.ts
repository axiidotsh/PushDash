import { homedir } from 'os';
import { join } from 'path';

export const API_BASE_URL = 'https://pushdash.axii.xyz';

export const API_ENDPOINTS = {
  LOGIN_INIT: '/api/auth/cli/init',
  LOGIN_POLL: '/api/auth/cli/poll',
  LOGOUT: '/api/auth/logout',
  USER_ME: '/api/user/me',
  FILE_UPLOAD: '/api/files/upload',
  FILE_LIST: '/api/files',
} as const;

export const CONFIG_DIR = join(homedir(), '.pushdash');
export const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export const CLI_CALLBACK_PORT = 3456;
export const CLI_CALLBACK_URL = `http://localhost:${CLI_CALLBACK_PORT}/callback`;
