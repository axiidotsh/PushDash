import { Command } from 'commander';
import chalk from 'chalk';
import { resolve } from 'path';
import { AuthManager } from '../lib/auth-manager.js';
import { FileUploader } from '../lib/file-uploader.js';
import { Logger } from '../lib/logger.js';
import { ApiClient } from '../lib/api-client.js';

export function createPushCommand(): Command {
  const command = new Command('push');

  command
    .description('Upload a file to PushDash')
    .argument('<file>', 'Path to the file to upload')
    .option('--tag <tag>', 'Add a tag to the file')
    .option('--msg <message>', 'Add a message/description to the file')
    .option('--public', 'Make the file publicly accessible', false)
    .option('--open', 'Open the file in browser after upload')
    .action(
      async (
        file: string,
        options: { tag?: string; msg?: string; public: boolean; open?: boolean }
      ) => {
        try {
          const authManager = new AuthManager();
          await authManager.requireAuth();

          const filePath = resolve(file);
          const uploader = new FileUploader();

          const result = await uploader.upload(filePath, {
            tag: options.tag,
            message: options.msg,
            isPublic: options.public,
          });

          // Display results
          Logger.log('');
          Logger.log(chalk.green(result.file.url));
          Logger.log('');

          // Show helpful commands
          Logger.log(chalk.dim(`ID: ${result.file.id}`));
          Logger.log(chalk.dim(`Open: pushdash open ${result.file.id}`));
          Logger.log(chalk.dim(`Info: pushdash info ${result.file.id}`));

          // Open in browser if requested
          if (options.open) {
            const open = (await import('open')).default;
            await open(result.file.url);
            Logger.info('Opened in browser');
          }
        } catch (error) {
          const errorMessage = ApiClient.handleError(error);
          Logger.error(errorMessage);
          process.exit(1);
        }
      }
    );

  return command;
}
