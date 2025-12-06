import { Command } from 'commander';
import chalk from 'chalk';
import { AuthManager } from '../lib/auth-manager.js';
import { ApiClient } from '../lib/api-client.js';
import { Logger } from '../lib/logger.js';

export function createShareCommand(): Command {
  const command = new Command('share');

  command
    .description('Manage file sharing')
    .argument('<file-id>', 'ID of the file to share');

  // Default action: create/show share link
  command.action(async (fileId: string) => {
    try {
      const authManager = new AuthManager();
      await authManager.requireAuth();

      const apiClient = new ApiClient();
      const spinner = Logger.spinner('Creating share link...');

      try {
        const response = await apiClient.createShareLink(fileId);
        spinner.succeed('Share link ready');

        Logger.log('');
        Logger.log(chalk.green(response.shareLink.url));
        Logger.log('');
        Logger.log(chalk.dim(response.message));
      } catch (error) {
        spinner.fail('Failed to create share link');
        throw error;
      }
    } catch (error) {
      const errorMessage = ApiClient.handleError(error);
      Logger.error(errorMessage);
      process.exit(1);
    }
  });

  // Subcommand: list shared emails
  command
    .command('list')
    .alias('ls')
    .description('List people this file is shared with')
    .action(async () => {
      const fileId = command.args[0];

      try {
        const authManager = new AuthManager();
        await authManager.requireAuth();

        const apiClient = new ApiClient();
        const spinner = Logger.spinner('Fetching shares...');

        const response = await apiClient.getFileShares(fileId);
        spinner.stop();

        if (response.shares.length === 0) {
          Logger.info('This file is not shared with anyone via email.');
          Logger.log('');
          Logger.log(
            chalk.dim(
              'Share with someone: pushdash share ' + fileId + ' add <email>'
            )
          );
          return;
        }

        Logger.log('');
        Logger.log(
          chalk.bold(
            `Shared with ${response.total} ${response.total === 1 ? 'person' : 'people'}:`
          )
        );
        Logger.log('');

        response.shares.forEach((share) => {
          const date = new Date(share.createdAt).toLocaleDateString();
          Logger.log(
            `  ${chalk.cyan('•')} ${share.email} ${chalk.dim(`(${date})`)}`
          );
        });

        Logger.log('');
      } catch (error) {
        const errorMessage = ApiClient.handleError(error);
        Logger.error(errorMessage);
        process.exit(1);
      }
    });

  // Subcommand: add email(s)
  command
    .command('add <emails...>')
    .description('Share file with email address(es)')
    .action(async (emails: string[]) => {
      const fileId = command.args[0];

      try {
        const authManager = new AuthManager();
        await authManager.requireAuth();

        const apiClient = new ApiClient();

        // Validate emails
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = emails.filter((e) => !emailRegex.test(e));

        if (invalidEmails.length > 0) {
          Logger.error(`Invalid email: ${invalidEmails[0]}`);
          process.exit(1);
        }

        const spinner = Logger.spinner(
          `Sharing with ${emails.length} ${emails.length === 1 ? 'person' : 'people'}...`
        );

        try {
          const response = await apiClient.addFileShares(fileId, emails);
          spinner.succeed(response.message || 'Shared successfully');

          if (response.shares.length > 0) {
            Logger.log('');
            Logger.log(chalk.dim('Now shared with:'));
            response.shares.forEach((share) => {
              Logger.log(`  ${chalk.cyan('•')} ${share.email}`);
            });
          }
        } catch (error) {
          spinner.fail('Failed to share');
          throw error;
        }
      } catch (error) {
        const errorMessage = ApiClient.handleError(error);
        Logger.error(errorMessage);
        process.exit(1);
      }
    });

  // Subcommand: remove email
  command
    .command('remove <email>')
    .alias('rm')
    .description('Remove access for an email address')
    .action(async (email: string) => {
      const fileId = command.args[0];

      try {
        const authManager = new AuthManager();
        await authManager.requireAuth();

        const apiClient = new ApiClient();
        const spinner = Logger.spinner(`Removing access for ${email}...`);

        try {
          await apiClient.removeFileShare(fileId, email);
          spinner.succeed(`Removed access for ${email}`);
        } catch (error) {
          spinner.fail('Failed to remove access');
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
