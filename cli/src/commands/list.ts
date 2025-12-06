import { Command } from 'commander';
import chalk from 'chalk';
import { AuthManager } from '../lib/auth-manager.js';
import { ApiClient } from '../lib/api-client.js';
import { Logger } from '../lib/logger.js';
import type { UploadedFile, FileListOptions } from '../types/index.js';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes <= 1 ? 'just now' : `${minutes}m ago`;
    }
    return hours === 1 ? '1h ago' : `${hours}h ago`;
  }
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

function getFileTypeIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️ ';
  if (mimeType.startsWith('text/')) return '📄';
  if (mimeType === 'application/pdf') return '📕';
  if (mimeType.startsWith('application/json')) return '📋';
  if (mimeType.includes('javascript') || mimeType.includes('typescript'))
    return '📜';
  return '📁';
}

function displayFiles(
  files: UploadedFile[],
  total: number,
  options: { showId?: boolean; compact?: boolean }
): void {
  if (files.length === 0) {
    Logger.info('No files found.');
    Logger.log('');
    Logger.log(chalk.dim('Upload your first file with: pushdash push <file>'));
    return;
  }

  const showId = options.showId ?? false;
  const compact = options.compact ?? false;

  if (compact) {
    // Compact view - just filenames
    files.forEach((file) => {
      const visibility = file.isPublic
        ? chalk.green('public')
        : chalk.dim('private');
      Logger.log(
        `${file.filename} ${chalk.dim(`(${formatFileSize(file.size)})`)} ${visibility}`
      );
    });
  } else {
    // Table-like view
    Logger.log('');

    // Header
    const header = showId
      ? `${chalk.dim('ID'.padEnd(12))} ${chalk.bold('Filename'.padEnd(35))} ${chalk.dim('Size'.padStart(10))} ${chalk.dim('Type'.padEnd(6))} ${chalk.dim('Visibility'.padEnd(10))} ${chalk.dim('Uploaded')}`
      : `${chalk.bold('Filename'.padEnd(40))} ${chalk.dim('Size'.padStart(10))} ${chalk.dim('Type'.padEnd(6))} ${chalk.dim('Visibility'.padEnd(10))} ${chalk.dim('Uploaded')}`;

    Logger.log(header);
    Logger.log(chalk.dim('─'.repeat(showId ? 100 : 88)));

    files.forEach((file) => {
      const icon = getFileTypeIcon(file.type);
      const visibility = file.isPublic
        ? chalk.green('public'.padEnd(10))
        : chalk.dim('private'.padEnd(10));
      const date = formatDate(file.createdAt);
      const size = formatFileSize(file.size).padStart(10);
      const tag = file.tag ? chalk.cyan(` [${file.tag}]`) : '';

      if (showId) {
        const shortId = file.id.slice(0, 10) + '..';
        const name = truncate(file.filename, 32) + tag;
        Logger.log(
          `${chalk.dim(shortId.padEnd(12))} ${icon} ${name.padEnd(34)} ${size} ${visibility} ${chalk.dim(date)}`
        );
      } else {
        const name = truncate(file.filename, 37) + tag;
        Logger.log(
          `${icon} ${name.padEnd(39)} ${size} ${visibility} ${chalk.dim(date)}`
        );
      }
    });

    Logger.log('');
  }

  // Summary
  const showing =
    files.length < total
      ? `Showing ${files.length} of ${total}`
      : `${total} file${total !== 1 ? 's' : ''}`;
  Logger.log(chalk.dim(showing));
}

export function createListCommand(): Command {
  const command = new Command('list');

  command
    .alias('ls')
    .description('List your uploaded files')
    .option('-n, --limit <number>', 'Number of files to show', '20')
    .option('-p, --page <number>', 'Page number', '1')
    .option('-s, --search <query>', 'Search by filename or tag')
    .option('-t, --tag <tag>', 'Filter by tag')
    .option('--public', 'Show only public files')
    .option('--private', 'Show only private files')
    .option('--sort <field>', 'Sort by: createdAt, filename, size', 'createdAt')
    .option('--asc', 'Sort in ascending order (default is descending)')
    .option('--id', 'Show file IDs')
    .option('-c, --compact', 'Compact output format')
    .action(
      async (options: {
        limit: string;
        page: string;
        search?: string;
        tag?: string;
        public?: boolean;
        private?: boolean;
        sort: string;
        asc?: boolean;
        id?: boolean;
        compact?: boolean;
      }) => {
        try {
          const authManager = new AuthManager();
          await authManager.requireAuth();

          const apiClient = new ApiClient();
          const spinner = Logger.spinner('Fetching files...');

          const listOptions: FileListOptions = {
            limit: parseInt(options.limit, 10) || 20,
            page: parseInt(options.page, 10) || 1,
            sortBy: ['createdAt', 'filename', 'size'].includes(options.sort)
              ? (options.sort as 'createdAt' | 'filename' | 'size')
              : 'createdAt',
            sortOrder: options.asc ? 'asc' : 'desc',
          };

          if (options.search) listOptions.search = options.search;
          if (options.tag) listOptions.tag = options.tag;
          if (options.public) listOptions.isPublic = true;
          if (options.private) listOptions.isPublic = false;

          const response = await apiClient.listFiles(listOptions);
          spinner.stop();

          displayFiles(response.files, response.total, {
            showId: options.id,
            compact: options.compact,
          });

          // Show pagination info if there are more pages
          if (response.pagination?.hasMore) {
            Logger.log('');
            Logger.log(
              chalk.dim(
                `Page ${response.pagination.page} of ${response.pagination.totalPages} • Use --page ${response.pagination.page + 1} to see more`
              )
            );
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
