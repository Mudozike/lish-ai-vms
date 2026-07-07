const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    const hosts = await prisma.host.findMany();
    const visitors = await prisma.visitor.findMany();
    const visits = await prisma.visit.findMany();
    
    console.log('Database Connection: SUCCESS');
    console.log('Users count:', users.length);
    console.log('Hosts count:', hosts.length);
    console.log('Visitors count:', visitors.length);
    console.log('Visits count:', visits.length);
    
    if (hosts.length > 0) {
      console.log('Hosts:', hosts.map(h => ({ id: h.id, name: h.name, department: h.department })));
    }
  } catch (error) {
    console.error('Database Connection: FAILED', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
