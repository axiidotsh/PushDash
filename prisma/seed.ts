import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createHash, randomBytes } from 'crypto';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

/**
 * Generate a deterministic ID based on a seed string
 * This makes the seed idempotent
 */
function generateId(seed: string): string {
  return createHash('sha256').update(seed).digest('hex').substring(0, 24);
}

/**
 * Generate a CUID-like ID for files
 */
function generateCuid(seed: string): string {
  const hash = createHash('sha256').update(seed).digest('hex');
  return `cl${hash.substring(0, 23)}`;
}

/**
 * Sample text content for different file types
 */
const sampleContents = {
  readme: `# PushDash

A developer-focused tool for pushing files from terminal to cloud dashboard.

## Features
- Upload files via CLI
- Manage files in a web dashboard
- Share files with unique links
- Preview text, images, and PDFs

## Quick Start
\`\`\`bash
pushdash login
pushdash push ./my-file.txt --tag "docs"
\`\`\`
`,
  config: `{
  "name": "my-project",
  "version": "1.0.0",
  "description": "Sample project configuration",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0",
    "dotenv": "^16.0.0"
  }
}
`,
  notes: `Meeting Notes - Sprint Planning

Date: December 6, 2025
Attendees: Team Alpha

## Action Items
1. Complete API integration by EOD Friday
2. Review PR #123 for auth changes
3. Update documentation

## Decisions
- Using S3 for file storage
- CLI will support --public flag
- Dashboard MVP by next week

## Next Steps
- Frontend development starts Monday
- User testing scheduled for next Thursday
`,
  snippet: `// Utility function for API requests
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', \`Bearer \${token}\`);
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }
  
  return response.json();
}

export { fetchWithAuth };
`,
  env: `# Application Configuration
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb

# Auth
JWT_SECRET=your-secret-key-here
SESSION_EXPIRY=7d

# Storage
S3_BUCKET=my-bucket
S3_REGION=us-east-1
`,
};

async function main() {
  console.log('🌱 Seeding database...\n');

  // =============================================
  // Create Demo Users
  // =============================================
  console.log('👤 Creating demo users...');

  const demoUser1 = await prisma.user.upsert({
    where: { email: 'demo@pushdash.dev' },
    update: {},
    create: {
      id: generateId('demo-user-1'),
      name: 'Demo User',
      email: 'demo@pushdash.dev',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    },
  });
  console.log(`  ✓ Created user: ${demoUser1.email}`);

  const demoUser2 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      id: generateId('demo-user-2'),
      name: 'Alice Developer',
      email: 'alice@example.com',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    },
  });
  console.log(`  ✓ Created user: ${demoUser2.email}`);

  // =============================================
  // Create Sessions for CLI testing
  // =============================================
  console.log('\n🔐 Creating test sessions...');

  const session1Token = `demo_session_${generateId('session-1')}`;
  const session1 = await prisma.session.upsert({
    where: { token: session1Token },
    update: {
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    create: {
      id: generateId('session-1'),
      token: session1Token,
      userId: demoUser1.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      userAgent: 'PushDash CLI/1.0.0',
    },
  });
  console.log(`  ✓ Created session for ${demoUser1.email}`);
  console.log(`    Token: ${session1.token}`);

  // =============================================
  // Create Sample Files for Demo User
  // =============================================
  console.log('\n📁 Creating sample files...');

  const files = [
    {
      seed: 'file-readme',
      filename: 'README_md',
      originalName: 'README.md',
      mimeType: 'text/markdown',
      size: Buffer.byteLength(sampleContents.readme),
      tag: 'docs',
      message: 'Project documentation',
      isPublic: true,
    },
    {
      seed: 'file-config',
      filename: 'package_json',
      originalName: 'package.json',
      mimeType: 'application/json',
      size: Buffer.byteLength(sampleContents.config),
      tag: 'config',
      message: 'NPM package configuration',
      isPublic: false,
    },
    {
      seed: 'file-notes',
      filename: 'meeting_notes_txt',
      originalName: 'meeting-notes.txt',
      mimeType: 'text/plain',
      size: Buffer.byteLength(sampleContents.notes),
      tag: 'notes',
      message: 'Sprint planning notes from December meeting',
      isPublic: false,
    },
    {
      seed: 'file-snippet',
      filename: 'api_utils_ts',
      originalName: 'api-utils.ts',
      mimeType: 'application/typescript',
      size: Buffer.byteLength(sampleContents.snippet),
      tag: 'code',
      message: 'Reusable API utility function',
      isPublic: true,
    },
    {
      seed: 'file-env',
      filename: '_env_example',
      originalName: '.env.example',
      mimeType: 'text/plain',
      size: Buffer.byteLength(sampleContents.env),
      tag: 'config',
      message: 'Environment variables template',
      isPublic: false,
    },
    {
      seed: 'file-image-1',
      filename: 'screenshot_png',
      originalName: 'screenshot.png',
      mimeType: 'image/png',
      size: 245760, // ~240KB
      tag: 'images',
      message: 'Dashboard screenshot for presentation',
      isPublic: true,
    },
    {
      seed: 'file-pdf-1',
      filename: 'report_pdf',
      originalName: 'quarterly-report.pdf',
      mimeType: 'application/pdf',
      size: 512000, // ~500KB
      tag: 'reports',
      message: 'Q4 2025 quarterly report',
      isPublic: false,
    },
    {
      seed: 'file-code-2',
      filename: 'schema_prisma',
      originalName: 'schema.prisma',
      mimeType: 'text/plain',
      size: 2048,
      tag: 'database',
      message: 'Database schema definition',
      isPublic: false,
    },
  ];

  const createdFiles: { id: string; originalName: string }[] = [];

  for (const file of files) {
    const fileId = generateCuid(file.seed);
    const storageKey = `${demoUser1.id}/${Date.now()}-${randomBytes(4).toString('hex')}-${file.filename}`;

    const createdFile = await prisma.file.upsert({
      where: { id: fileId },
      update: {
        tag: file.tag,
        message: file.message,
        isPublic: file.isPublic,
      },
      create: {
        id: fileId,
        filename: file.filename,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        storageKey,
        tag: file.tag,
        message: file.message,
        isPublic: file.isPublic,
        userId: demoUser1.id,
      },
    });
    createdFiles.push({
      id: createdFile.id,
      originalName: createdFile.originalName,
    });
    console.log(
      `  ✓ ${file.originalName} (${file.tag}, ${file.isPublic ? 'public' : 'private'})`
    );
  }

  // =============================================
  // Create Files for Alice
  // =============================================
  console.log('\n📁 Creating files for Alice...');

  const aliceFiles = [
    {
      seed: 'alice-file-1',
      filename: 'todo_md',
      originalName: 'todo.md',
      mimeType: 'text/markdown',
      size: 1024,
      tag: 'personal',
      message: 'Personal TODO list',
      isPublic: false,
    },
    {
      seed: 'alice-file-2',
      filename: 'design_sketch_png',
      originalName: 'design-sketch.png',
      mimeType: 'image/png',
      size: 189440,
      tag: 'design',
      message: 'UI mockup for new feature',
      isPublic: true,
    },
  ];

  for (const file of aliceFiles) {
    const fileId = generateCuid(file.seed);
    const storageKey = `${demoUser2.id}/${Date.now()}-${randomBytes(4).toString('hex')}-${file.filename}`;

    await prisma.file.upsert({
      where: { id: fileId },
      update: {
        tag: file.tag,
        message: file.message,
      },
      create: {
        id: fileId,
        filename: file.filename,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        storageKey,
        tag: file.tag,
        message: file.message,
        isPublic: file.isPublic,
        userId: demoUser2.id,
      },
    });
    console.log(`  ✓ ${file.originalName} (${file.tag})`);
  }

  // =============================================
  // Create Share Links
  // =============================================
  console.log('\n🔗 Creating share links...');

  // Share link for README.md
  const shareLink1Id = generateCuid('share-readme');
  const shareLink1Token = `share_${generateId('share-token-readme')}`;
  await prisma.shareLink.upsert({
    where: { id: shareLink1Id },
    update: {},
    create: {
      id: shareLink1Id,
      token: shareLink1Token,
      fileId: createdFiles[0].id, // README.md
    },
  });
  console.log(`  ✓ Share link for ${createdFiles[0].originalName}`);
  console.log(`    Token: ${shareLink1Token}`);

  // Share link for api-utils.ts
  const shareLink2Id = generateCuid('share-utils');
  const shareLink2Token = `share_${generateId('share-token-utils')}`;
  await prisma.shareLink.upsert({
    where: { id: shareLink2Id },
    update: {},
    create: {
      id: shareLink2Id,
      token: shareLink2Token,
      fileId: createdFiles[3].id, // api-utils.ts
    },
  });
  console.log(`  ✓ Share link for ${createdFiles[3].originalName}`);
  console.log(`    Token: ${shareLink2Token}`);

  // =============================================
  // Summary
  // =============================================
  console.log('\n' + '='.repeat(50));
  console.log('✅ Database seeded successfully!\n');
  console.log('Demo Accounts:');
  console.log('  Email: demo@pushdash.dev');
  console.log(`  Session Token: ${session1.token}`);
  console.log('  (Use this token for CLI testing)\n');
  console.log('  Email: alice@example.com\n');
  console.log(`Total files created: ${files.length + aliceFiles.length}`);
  console.log(`Share links created: 2`);
  console.log('='.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Database seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
