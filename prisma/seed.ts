import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createHash } from 'crypto';

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

function generateId(seed: string): string {
  return createHash('sha256').update(seed).digest('hex').substring(0, 24);
}

async function main() {
  console.log('🌱 Seeding database...\n');

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@pushdash.dev' },
    update: {},
    create: {
      id: generateId('demo-user-1'),
      name: 'Demo User',
      email: 'demo@pushdash.dev',
      emailVerified: true,
    },
  });
  console.log(`✓ Created user: ${demoUser.email}`);

  // Create a session for CLI testing
  const sessionToken = `demo_session_${generateId('session-1')}`;
  await prisma.session.upsert({
    where: { token: sessionToken },
    update: {
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    create: {
      id: generateId('session-1'),
      token: sessionToken,
      userId: demoUser.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  console.log(`✓ Created session token: ${sessionToken}`);

  console.log('\n✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Database seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
