import { Command } from 'commander';
import chalk from 'chalk';
import { AuthManager } from '../lib/auth-manager.js';
import { ApiClient } from '../lib/api-client.js';
import { Logger } from '../lib/logger.js';
import { resolveFile } from '../lib/file-resolver.js';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

export function createInfoCommand(): Command {
  const command = new Command('info');

  command
    .description('Get detailed information about a file')
    .argument('<file>', 'File ID or filename')
    .option('--json', 'Output as JSON')
    .action(async (fileIdentifier: string, options: { json?: boolean }) => {
      try {
        const authManager = new AuthManager();
        await authManager.requireAuth();

        const apiClient = new ApiClient();

        // Resolve file by ID or filename
        const { id: fileId, file } = await resolveFile(
          apiClient,
          fileIdentifier,
          'Fetching file info...'
        );

        if (options.json) {
          Logger.log(JSON.stringify(file, null, 2));
          return;
        }

        // Display file info in a nice format
        Logger.log('');
        Logger.log(chalk.bold(file.originalName || file.filename));
        Logger.log(chalk.dim('─'.repeat(50)));
        Logger.log('');

        const info: [string, string][] = [
          ['ID', fileId],
          ['Filename', file.filename],
          ['Original Name', file.originalName || file.filename],
          ['Type', file.mimeType || file.type],
          ['Size', formatFileSize(file.size)],
          ['Visibility', file.isPublic ? chalk.green('Public') : 'Private'],
          ['Tag', file.tag || chalk.dim('(none)')],
          ['Message', file.message || chalk.dim('(none)')],
          ['Uploaded', formatDate(file.createdAt)],
          ['Updated', formatDate(file.updatedAt || file.createdAt)],
        ];

        const maxLabelLen = Math.max(...info.map(([label]) => label.length));

        info.forEach(([label, value]) => {
          Logger.log(`${chalk.dim(label.padEnd(maxLabelLen))}  ${value}`);
        });

        Logger.log('');
        Logger.log(chalk.dim('─'.repeat(50)));
        Logger.log('');
        Logger.log(chalk.dim('URLs:'));
        Logger.log(`  ${chalk.cyan('View:')}     ${file.url}`);
        Logger.log(`  ${chalk.cyan('Download:')} ${file.downloadUrl}`);
        if (file.shareUrl) {
          Logger.log(`  ${chalk.cyan('Share:')}    ${file.shareUrl}`);
        }
        Logger.log('');

        // Show quick actions
        Logger.log(chalk.dim('Quick actions:'));
        Logger.log(
          chalk.dim(`  pushdash open ${fileId}        # Open in browser`)
        );
        Logger.log(chalk.dim(`  pushdash open ${fileId} -d     # Download`));
        if (!file.shareUrl) {
          Logger.log(
            chalk.dim(`  pushdash share ${fileId}       # Create share link`)
          );
        }
        Logger.log(chalk.dim(`  pushdash delete ${fileId}      # Delete file`));
      } catch (error) {
        const errorMessage = ApiClient.handleError(error);
        Logger.error(errorMessage);
        process.exit(1);
      }
    });

  return command;
}
