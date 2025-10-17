import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Seed organizers
  const org1 = await prisma.user.create({
    data: { name: 'Org1', email: 'org1@mail.com', password: 'hashed', role: 'ORGANIZER' }
  });

  const org2 = await prisma.user.create({
    data: { name: 'Org2', email: 'org2@mail.com', password: 'hashed', role: 'ORGANIZER' }
  });

  // Seed competitions
  for (let i = 1; i <= 5; i++) {
    await prisma.competition.create({
      data: {
        title: `Competition ${i}`,
        description: 'Sample event',
        tags: ['tech'],
        capacity: 5,
        regDeadline: new Date(Date.now() + 3 * 86400000), // 3 days from now
      },
    });
  }

  // Seed participants
  for (let i = 1; i <= 5; i++) {
    await prisma.user.create({
      data: {
        name: `User${i}`,
        email: `user${i}@mail.com`,
        password: 'hashed',
        role: 'PARTICIPANT',
      },
    });
  }
}

main()
  .then(() => console.log('✅ Seeding complete!'))
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
