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

function padEnd(str: string, len: number): string {
  // Handle strings with ANSI codes or emojis
  const visibleLen = str.replace(/\x1b\[[0-9;]*m/g, '').length;
  const padding = Math.max(0, len - visibleLen);
  return str + ' '.repeat(padding);
}

function padStart(str: string, len: number): string {
  const visibleLen = str.replace(/\x1b\[[0-9;]*m/g, '').length;
  const padding = Math.max(0, len - visibleLen);
  return ' '.repeat(padding) + str;
}

function getFileTypeIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼 ';
  if (mimeType.startsWith('text/')) return '📄';
  if (mimeType === 'application/pdf') return '📕';
  if (mimeType.startsWith('application/json')) return '📋';
  if (mimeType.includes('javascript') || mimeType.includes('typescript'))
    return '📜';
  return '📁';
}

interface DisplayOptions {
  showId?: boolean;
  showUrl?: boolean;
  compact?: boolean;
}

function displayFiles(
  files: UploadedFile[],
  total: number,
  options: DisplayOptions
): void {
  if (files.length === 0) {
    Logger.info('No files found.');
    Logger.log('');
    Logger.log(chalk.dim('Upload your first file with: pushdash push <file>'));
    return;
  }

  const showId = options.showId ?? false;
  const showUrl = options.showUrl ?? false;
  const compact = options.compact ?? false;

  if (compact) {
    // Compact view - one file per line with essential info
    files.forEach((file) => {
      const visibility = file.isPublic
        ? chalk.green('public')
        : chalk.dim('private');
      const id = showId ? chalk.dim(`[${file.id.slice(0, 8)}] `) : '';
      Logger.log(
        `${id}${file.filename} ${chalk.dim(`(${formatFileSize(file.size)})`)} ${visibility}`
      );
      if (showUrl) {
        Logger.log(chalk.dim(`  → ${file.url}`));
      }
    });
  } else {
    // Table view with proper alignment
    Logger.log('');

    // Calculate column widths
    const COL_ID = 12;
    const COL_NAME = showId ? 30 : 35;
    const COL_SIZE = 9;
    const COL_VIS = 8;
    const COL_DATE = 12;

    // Header
    let header = '';
    if (showId) {
      header += chalk.dim(padEnd('ID', COL_ID));
    }
    header += chalk.bold(padEnd('Filename', COL_NAME + 2)); // +2 for icon
    header += chalk.dim(padStart('Size', COL_SIZE));
    header += '  ';
    header += chalk.dim(padEnd('Visibility', COL_VIS));
    header += '  ';
    header += chalk.dim('Uploaded');

    Logger.log(header);

    const lineWidth =
      (showId ? COL_ID : 0) +
      COL_NAME +
      2 +
      COL_SIZE +
      2 +
      COL_VIS +
      2 +
      COL_DATE;
    Logger.log(chalk.dim('─'.repeat(lineWidth)));

    // Rows
    files.forEach((file) => {
      const icon = getFileTypeIcon(file.type);
      const visibility = file.isPublic
        ? chalk.green('public')
        : chalk.dim('private');
      const date = formatDate(file.createdAt);
      const size = formatFileSize(file.size);
      const tag = file.tag ? chalk.cyan(` #${file.tag}`) : '';
      const name = truncate(
        file.filename,
        COL_NAME - (file.tag ? file.tag.length + 2 : 0)
      );

      let row = '';
      if (showId) {
        row += chalk.dim(padEnd(file.id.slice(0, 10) + '..', COL_ID));
      }
      row += icon + ' ';
      row += padEnd(name + tag, COL_NAME);
      row += padStart(size, COL_SIZE);
      row += '  ';
      row += padEnd(visibility, COL_VIS);
      row += '  ';
      row += chalk.dim(date);

      Logger.log(row);

      // Show URL on next line if requested
      if (showUrl) {
        const indent = showId ? ' '.repeat(COL_ID) : '';
        Logger.log(indent + chalk.dim(`   ↳ ${file.url}`));
      }
    });

    Logger.log('');
  }

  // Summary
  const showing =
    files.length < total
      ? `Showing ${files.length} of ${total} files`
      : `${total} file${total !== 1 ? 's' : ''} total`;
  Logger.log(chalk.dim(showing));

  // Tip
  if (!showId) {
    Logger.log(
      chalk.dim('Tip: Use --id to show file IDs for use with other commands')
    );
  }
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
    .option('-u, --url', 'Show file URLs')
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
        url?: boolean;
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
            showUrl: options.url,
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
