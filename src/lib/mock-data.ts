/**
 * Mock data generators for development
 */

import type { File, Visibility } from '@/types/file';

/**
 * Sample file data for realistic mock generation
 */
const sampleFiles = [
  {
    name: 'quarterly-report.pdf',
    mimeType: 'application/pdf',
    tags: ['work', 'reports'],
  },
  {
    name: 'project-notes.md',
    mimeType: 'text/markdown',
    tags: ['notes', 'project'],
  },
  {
    name: 'api-response.json',
    mimeType: 'application/json',
    tags: ['api', 'debug'],
  },
  {
    name: 'screenshot-2024.png',
    mimeType: 'image/png',
    tags: ['screenshot'],
  },
  {
    name: 'database-backup.sql',
    mimeType: 'text/plain',
    tags: ['database', 'backup'],
  },
  {
    name: 'config.yaml',
    mimeType: 'text/yaml',
    tags: ['config'],
  },
  {
    name: 'error-logs.txt',
    mimeType: 'text/plain',
    tags: ['logs', 'debug'],
  },
  {
    name: 'design-mockup.png',
    mimeType: 'image/png',
    tags: ['design', 'ui'],
  },
  {
    name: 'meeting-notes.md',
    mimeType: 'text/markdown',
    tags: ['meetings', 'notes'],
  },
  {
    name: 'index.tsx',
    mimeType: 'text/typescript',
    tags: ['code', 'react'],
  },
  {
    name: 'styles.css',
    mimeType: 'text/css',
    tags: ['code', 'styles'],
  },
  {
    name: 'user-avatar.jpg',
    mimeType: 'image/jpeg',
    tags: ['images'],
  },
  {
    name: 'invoice-jan.pdf',
    mimeType: 'application/pdf',
    tags: ['finance', 'invoices'],
  },
  {
    name: 'readme.md',
    mimeType: 'text/markdown',
    tags: ['docs'],
  },
  {
    name: 'package.json',
    mimeType: 'application/json',
    tags: ['config', 'npm'],
  },
];

const messages = [
  'Updated version with latest changes',
  'Final draft for review',
  'Debug output from production',
  'Quick screenshot for reference',
  'Backup before migration',
  null,
  null,
  null, // Some files have no message
];

/**
 * Generate a random file size in bytes
 */
function randomFileSize(): number {
  const sizes = [
    1024 * 10, // 10 KB
    1024 * 50, // 50 KB
    1024 * 100, // 100 KB
    1024 * 500, // 500 KB
    1024 * 1024, // 1 MB
    1024 * 1024 * 2, // 2 MB
    1024 * 1024 * 5, // 5 MB
  ];
  return (
    sizes[Math.floor(Math.random() * sizes.length)] +
    Math.floor(Math.random() * 1024)
  );
}

/**
 * Generate a random date within the last 30 days
 */
function randomRecentDate(): Date {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const hoursAgo = Math.floor(Math.random() * 24);
  return new Date(
    now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000
  );
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `file_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Generate a single mock file
 */
export function generateMockFile(
  userId: string,
  overrides?: Partial<File>
): File {
  const sample = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
  const uploadedAt = randomRecentDate();

  return {
    id: generateId(),
    filename: sample.name,
    originalName: sample.name,
    size: randomFileSize(),
    mimeType: sample.mimeType,
    visibility: (Math.random() > 0.7 ? 'PUBLIC' : 'PRIVATE') as Visibility,
    tags: sample.tags,
    message: messages[Math.floor(Math.random() * messages.length)],
    s3Key: `uploads/${userId}/${Date.now()}-${sample.name}`,
    uploadedAt,
    updatedAt: uploadedAt,
    userId,
    ...overrides,
  };
}

/**
 * Generate multiple mock files
 */
export function generateMockFiles(userId: string, count: number = 10): File[] {
  const files: File[] = [];
  const usedSamples = new Set<number>();

  for (let i = 0; i < count; i++) {
    // Try to use unique samples first
    let sampleIndex: number;
    if (usedSamples.size < sampleFiles.length) {
      do {
        sampleIndex = Math.floor(Math.random() * sampleFiles.length);
      } while (usedSamples.has(sampleIndex));
      usedSamples.add(sampleIndex);
    } else {
      sampleIndex = Math.floor(Math.random() * sampleFiles.length);
    }

    const sample = sampleFiles[sampleIndex];
    const uploadedAt = randomRecentDate();

    files.push({
      id: generateId(),
      filename: sample.name,
      originalName: sample.name,
      size: randomFileSize(),
      mimeType: sample.mimeType,
      visibility: (Math.random() > 0.7 ? 'PUBLIC' : 'PRIVATE') as Visibility,
      tags: sample.tags,
      message: messages[Math.floor(Math.random() * messages.length)],
      s3Key: `uploads/${userId}/${Date.now()}-${sample.name}`,
      uploadedAt,
      updatedAt: uploadedAt,
      userId,
    });
  }

  // Sort by upload date, newest first
  return files.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
}

/**
 * Static mock user ID for development
 */
export const MOCK_USER_ID = 'user_mock_12345';

/**
 * Pre-generated mock files for consistent development experience
 */
export const mockFiles = generateMockFiles(MOCK_USER_ID, 12);
