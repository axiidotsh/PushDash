import { Command } from 'commander';
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
    .action(
      async (
        file: string,
        options: { tag?: string; msg?: string; public: boolean }
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

          // Display file URL
          Logger.log(result.file.url);

          if (result.file.shareUrl) {
            Logger.info(`Share: ${result.file.shareUrl}`);
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
