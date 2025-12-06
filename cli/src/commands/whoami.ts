import { Command } from 'commander';
import { AuthManager } from '../lib/auth-manager.js';
import { ApiClient } from '../lib/api-client.js';
import { Logger } from '../lib/logger.js';

export function createWhoamiCommand(): Command {
  const command = new Command('whoami');

  command.description('Display current user information').action(async () => {
    try {
      const authManager = new AuthManager();
      await authManager.requireAuth();

      const apiClient = new ApiClient();
      const spinner = Logger.spinner('Fetching user info...');

      const user = await apiClient.getCurrentUser();

      spinner.stop();

      Logger.log(`Email: ${user.email}`);
      if (user.name) {
        Logger.log(`Name: ${user.name}`);
      }
      Logger.log(`User ID: ${user.id}`);
      if (user.filesCount !== undefined) {
        Logger.log(`Files: ${user.filesCount}`);
      }
    } catch (error) {
      const errorMessage = ApiClient.handleError(error);
      Logger.error(errorMessage);
      process.exit(1);
    }
  });

  return command;
}
