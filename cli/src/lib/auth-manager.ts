import open from 'open';
import { ApiClient } from './api-client.js';
import { ConfigManager } from './config-manager.js';
import { Logger } from './logger.js';
import type { LoginResponse } from '../types/index.js';

export class AuthManager {
  private apiClient: ApiClient;
  private configManager: ConfigManager;

  constructor() {
    this.apiClient = new ApiClient();
    this.configManager = ConfigManager.getInstance();
  }

  async login(): Promise<void> {
    try {
      // Initiate login flow
      const spinner = Logger.spinner('Initiating login...');

      const { loginUrl, deviceCode } = await this.apiClient.initiateLogin();

      spinner.succeed('Login initiated');

      // Open browser
      Logger.info(`Opening browser for authentication...`);
      Logger.info(`If browser doesn't open, visit: ${loginUrl}`);

      await open(loginUrl);

      // Poll for authentication
      const pollSpinner = Logger.spinner('Waiting for authentication...');

      const maxAttempts = 60; // 5 minutes (60 attempts * 5 seconds)
      let attempts = 0;

      while (attempts < maxAttempts) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
          const result = await this.apiClient.pollLogin(deviceCode);

          // Login successful
          pollSpinner.succeed('Authentication successful');

          // Save token and user info
          await this.saveLoginData(result);

          Logger.success(`Logged in as ${result.user.email}`);
          return;
        } catch (error) {
          attempts++;
          if (attempts >= maxAttempts) {
            pollSpinner.fail('Authentication timeout');
            throw new Error('Login timeout. Please try again.');
          }
          // Continue polling
        }
      }
    } catch (error) {
      const errorMessage = ApiClient.handleError(error);
      Logger.error(errorMessage);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const isAuthenticated = await this.configManager.isAuthenticated();

      if (!isAuthenticated) {
        Logger.warn('Not currently logged in');
        return;
      }

      const spinner = Logger.spinner('Logging out...');

      // Call logout endpoint
      await this.apiClient.logout();

      // Clear local config
      await this.configManager.clear();

      spinner.succeed('Logged out successfully');
    } catch (error) {
      const errorMessage = ApiClient.handleError(error);
      Logger.error(errorMessage);
      throw error;
    }
  }

  async requireAuth(): Promise<void> {
    const isAuthenticated = await this.configManager.isAuthenticated();

    if (!isAuthenticated) {
      Logger.error('Authentication required. Please run "pushdash login"');
      process.exit(1);
    }
  }

  private async saveLoginData(loginResponse: LoginResponse): Promise<void> {
    await this.configManager.save({
      authToken: loginResponse.token,
      userId: loginResponse.user.id,
      userEmail: loginResponse.user.email,
    });
  }
}
