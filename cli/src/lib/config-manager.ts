import { existsSync } from 'fs';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { CONFIG_FILE, API_BASE_URL } from './constants.js';
import type { Config } from '../types/index.js';

export class ConfigManager {
  private static instance: ConfigManager;
  private config: Config | null = null;

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  async load(): Promise<Config> {
    if (this.config) {
      return this.config;
    }

    if (!existsSync(CONFIG_FILE)) {
      this.config = this.getDefaultConfig();
      return this.config;
    }

    try {
      const data = await readFile(CONFIG_FILE, 'utf-8');
      this.config = JSON.parse(data);
      // Ensure apiUrl exists (for backwards compatibility)
      if (!this.config!.apiUrl) {
        this.config!.apiUrl = API_BASE_URL;
      }
      return this.config!;
    } catch (error) {
      // If config is corrupted, return default
      this.config = this.getDefaultConfig();
      return this.config;
    }
  }

  async save(config: Partial<Config>): Promise<void> {
    const currentConfig = await this.load();
    this.config = { ...currentConfig, ...config };

    // Ensure directory exists
    await mkdir(dirname(CONFIG_FILE), { recursive: true });

    await writeFile(CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf-8');
  }

  async clear(): Promise<void> {
    this.config = this.getDefaultConfig();
    await mkdir(dirname(CONFIG_FILE), { recursive: true });
    await writeFile(CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf-8');
  }

  getDefaultConfig(): Config {
    return {
      apiUrl: API_BASE_URL,
    };
  }

  async isAuthenticated(): Promise<boolean> {
    const config = await this.load();
    return !!config.authToken;
  }

  async getAuthToken(): Promise<string | undefined> {
    const config = await this.load();
    return config.authToken;
  }
}
