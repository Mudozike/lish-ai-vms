import { auth, currentUser } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;

    // Find user in DB
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    // Fallback: match by email for seeded users
    if (!dbUser && email) {
      dbUser = await prisma.user.findUnique({
        where: { email }
      });
      if (dbUser) {
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { clerkId: userId }
        });
      }
    }

    // Auto-create User fallback
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: email || `${userId}@placeholder.com`,
          name: clerkUser?.firstName 
            ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() 
            : 'Lish Staff Member',
          role: email === 'admin@lishailabs.com' ? 'ADMIN' : email === 'security@lishailabs.com' ? 'SECURITY' : 'HOST',
          department: 'Training'
        }
      });
    }

    // Ensure Host record exists for HOST role users
    let host = null;
    if (dbUser.role === 'HOST') {
      host = await prisma.host.findUnique({
        where: { userId: dbUser.id }
      });
      if (!host) {
        host = await prisma.host.create({
          data: {
            userId: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            department: dbUser.department || 'Training',
            role: 'Coordinator'
          }
        });
      }
    }

    // Get filter from query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';

    const whereClause: Record<string, string> = {};
    
    // Hosts only see their own visits; Admins/Security see all
    if (dbUser.role === 'HOST' && host) {
      whereClause.hostId = host.id;
    }

    if (status !== 'ALL') {
      whereClause.status = status;
    }

    const visits = await prisma.visit.findMany({
      where: whereClause,
      include: {
        visitor: true
      },
      orderBy: {
        expectedArrival: 'desc'
      }
    });

    return NextResponse.json({ success: true, visits });
  } catch (error) {
    console.error('Error fetching host visits:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
