import { Command } from 'commander';
import chalk from 'chalk';
import prompts from 'prompts';
import { AuthManager } from '../lib/auth-manager.js';
import { ApiClient } from '../lib/api-client.js';
import { Logger } from '../lib/logger.js';

export function createDeleteCommand(): Command {
  const command = new Command('delete');

  command
    .alias('rm')
    .description('Delete a file from PushDash')
    .argument('<file-id>', 'ID of the file to delete')
    .option('-f, --force', 'Skip confirmation prompt', false)
    .action(async (fileId: string, options: { force: boolean }) => {
      try {
        const authManager = new AuthManager();
        await authManager.requireAuth();

        const apiClient = new ApiClient();

        // If not forced, ask for confirmation
        if (!options.force) {
          Logger.log('');
          Logger.warn(`You are about to delete file: ${chalk.bold(fileId)}`);
          Logger.log(chalk.dim('This action cannot be undone.'));
          Logger.log('');

          const response = await prompts({
            type: 'confirm',
            name: 'confirm',
            message: 'Are you sure you want to delete this file?',
            initial: false,
          });

          // Handle Ctrl+C
          if (response.confirm === undefined) {
            Logger.log('');
            Logger.info('Deletion cancelled.');
            process.exit(0);
          }

          if (!response.confirm) {
            Logger.info('Deletion cancelled.');
            process.exit(0);
          }
        }

        const spinner = Logger.spinner('Deleting file...');

        try {
          const result = await apiClient.deleteFile(fileId);
          spinner.succeed('File deleted successfully');

          if (result.message) {
            Logger.log(chalk.dim(result.message));
          }
        } catch (error) {
          spinner.fail('Failed to delete file');
          throw error;
        }
      } catch (error) {
        const errorMessage = ApiClient.handleError(error);
        Logger.error(errorMessage);
        process.exit(1);
      }
    });

  return command;
}
