import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Add your seed data here
  // Example:
  // const user = await prisma.user.create({
  //   data: {
  //     id: 'seed-user-1',
  //     name: 'Test User',
  //     email: 'test@example.com',
  //     emailVerified: true,
  //   },
  // });
  // console.log('Created user:', user.email);

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
