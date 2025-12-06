import { Command } from 'commander';
import open from 'open';
import { AuthManager } from '../lib/auth-manager.js';
import { ApiClient } from '../lib/api-client.js';
import { Logger } from '../lib/logger.js';
import { resolveFile } from '../lib/file-resolver.js';
import { API_BASE_URL } from '../lib/constants.js';

export function createOpenCommand(): Command {
  const command = new Command('open');

  command
    .description('Open a file in your browser')
    .argument('<file>', 'File ID or filename to open')
    .option('-d, --download', 'Open the download URL directly')
    .option('-s, --share', 'Open the share link (if available)')
    .option('--no-browser', 'Just print the URL without opening')
    .action(
      async (
        fileIdentifier: string,
        options: { download?: boolean; share?: boolean; browser: boolean }
      ) => {
        try {
          const authManager = new AuthManager();
          await authManager.requireAuth();

          const apiClient = new ApiClient();

          // Resolve file by ID or filename
          const { id: fileId, file } = await resolveFile(
            apiClient,
            fileIdentifier,
            'Looking up file...'
          );

          // Determine which URL to open
          let url: string;
          let urlType: string;

          if (options.download) {
            url =
              file.downloadUrl ||
              `${API_BASE_URL}/api/files/${fileId}/download`;
            urlType = 'download';
          } else if (options.share) {
            if (file.shareUrl) {
              url = file.shareUrl;
              urlType = 'share link';
            } else {
              Logger.warn('No share link exists for this file.');
              Logger.info(`Create one with: pushdash share ${fileId}`);
              process.exit(1);
            }
          } else {
            url = file.url || `${API_BASE_URL}/dashboard/files/${fileId}`;
            urlType = 'file page';
          }

          if (options.browser) {
            const spinner = Logger.spinner(`Opening ${urlType}...`);
            await open(url);
            spinner.succeed(`Opened ${urlType} in browser`);
          } else {
            Logger.log(url);
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
