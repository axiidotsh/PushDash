import { ApiClient } from './api-client.js';
import { Logger } from './logger.js';
import type { FileDetail } from '../types/index.js';

export interface ResolvedFile {
  id: string;
  file: FileDetail;
}

/**
 * Resolves a file identifier (ID or filename) to a file.
 * - If it looks like a CUID, tries to fetch by ID first
 * - Otherwise searches by filename
 * - Returns the file details if found
 * - Exits with error if not found or ambiguous
 */
export async function resolveFile(
  apiClient: ApiClient,
  identifier: string,
  spinnerText = 'Looking up file...'
): Promise<ResolvedFile> {
  const spinner = Logger.spinner(spinnerText);

  try {
    // Check if it looks like a CUID (starts with 'c' and is ~25 chars)
    const looksLikeId = /^c[a-z0-9]{20,}$/i.test(identifier);

    if (looksLikeId) {
      // Try to fetch by ID directly
      try {
        const response = await apiClient.getFile(identifier);
        spinner.succeed(
          `Found: ${response.file.filename || response.file.originalName}`
        );
        return { id: response.file.id, file: response.file };
      } catch {
        // If that fails, maybe it's actually a filename - try search
        const searchResult = await apiClient.listFiles({
          search: identifier,
          limit: 1,
        });
        if (searchResult.files.length === 0) {
          spinner.fail('File not found');
          Logger.error(`No file found with ID or name: ${identifier}`);
          process.exit(1);
        }
        const fileId = searchResult.files[0].id;
        const response = await apiClient.getFile(fileId);
        spinner.succeed(
          `Found: ${response.file.filename || response.file.originalName}`
        );
        return { id: fileId, file: response.file };
      }
    } else {
      // Search by filename
      const searchResult = await apiClient.listFiles({
        search: identifier,
        limit: 10,
      });

      if (searchResult.files.length === 0) {
        spinner.fail('File not found');
        Logger.error(`No file found matching: ${identifier}`);
        process.exit(1);
      }

      // Find exact match first
      const exactMatch = searchResult.files.find(
        (f) => f.filename.toLowerCase() === identifier.toLowerCase()
      );

      let fileId: string;

      if (exactMatch) {
        fileId = exactMatch.id;
      } else if (searchResult.files.length === 1) {
        fileId = searchResult.files[0].id;
      } else {
        // Multiple matches - show them and ask to be more specific
        spinner.stop();
        Logger.warn(`Multiple files match "${identifier}":`);
        Logger.log('');
        searchResult.files.slice(0, 5).forEach((f) => {
          Logger.log(`  ${f.filename}`);
          Logger.log(`    ID: ${f.id}`);
        });
        if (searchResult.files.length > 5) {
          Logger.log(`  ... and ${searchResult.files.length - 5} more`);
        }
        Logger.log('');
        Logger.info('Please use the file ID to be more specific.');
        process.exit(1);
      }

      const response = await apiClient.getFile(fileId);
      spinner.succeed(
        `Found: ${response.file.filename || response.file.originalName}`
      );
      return { id: fileId, file: response.file };
    }
  } catch (error) {
    spinner.fail('Failed to find file');
    throw error;
  }

  // TypeScript needs this even though it's unreachable
  throw new Error('Unreachable');
}
