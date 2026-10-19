const bcrypt = require('bcryptjs');
const prisma = require('../src/config/prisma');

async function main() {
  console.log('Seeding database...');

  // Clean existing test data if needed
  await prisma.waterRecord.deleteMany({
    where: {
      user: {
        email: 'test@example.com',
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: 'test@example.com',
    },
  });

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  const hashedPassword = await bcrypt.hash('password123', 10);

  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      gender: 'female',
      dailyNorma: 2000,
      avatarUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
      waterRecords: {
        create: [
          {
            volume: 250,
            time: twoHoursAgo,
          },
          {
            volume: 500,
            time: oneHourAgo,
          },
        ],
      },
    },
    include: {
      waterRecords: true,
    },
  });

  console.log(`Seeding finished. Created test user with ID: ${testUser.id}`);
  console.log(`Created ${testUser.waterRecords.length} water records.`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
