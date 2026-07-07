const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clean up existing data in reverse order of dependencies
  await prisma.movementLog.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.visit.deleteMany({});
  await prisma.blacklist.deleteMany({});
  await prisma.host.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleaned up existing records.');

  // Create Users and Hosts
  const hostsData = [
    {
      name: 'Dr. Alex Kiprop',
      email: 'alex.kiprop@lishailabs.com',
      department: 'Executive',
      role: 'Director',
      requiresEscort: false,
    },
    {
      name: 'Mercy Jepchumba',
      email: 'mercy.jepchumba@lishailabs.com',
      department: 'Training',
      role: 'Coordinator',
      requiresEscort: true,
    },
    {
      name: 'John Njuguna',
      email: 'john.njuguna@lishailabs.com',
      department: 'Operations',
      role: 'Manager',
      requiresEscort: true,
    },
    {
      name: 'Sarah Wambui',
      email: 'sarah.wambui@lishailabs.com',
      department: 'HR',
      role: 'Coordinator',
      requiresEscort: true,
    },
  ];

  console.log('Seeding Hosts...');
  for (const item of hostsData) {
    // Create base User
    const user = await prisma.user.create({
      data: {
        clerkId: `seed_host_${item.email.split('@')[0]}`,
        email: item.email,
        name: item.name,
        role: 'HOST',
        department: item.department,
      },
    });

    // Create corresponding Host
    await prisma.host.create({
      data: {
        userId: user.id,
        email: item.email,
        name: item.name,
        department: item.department,
        role: item.role,
        requiresEscort: item.requiresEscort,
      },
    });
  }

  // Create Seed Admin and Security Users
  console.log('Seeding Admin and Security users...');
  await prisma.user.create({
    data: {
      clerkId: 'seed_admin',
      email: 'admin@lishailabs.com',
      name: 'Lish Admin',
      role: 'ADMIN',
      department: 'Administration',
    },
  });

  await prisma.user.create({
    data: {
      clerkId: 'seed_security',
      email: 'security@lishailabs.com',
      name: 'Lish Security Desk',
      role: 'SECURITY',
      department: 'Security',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
