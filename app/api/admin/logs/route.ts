import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (user && user.role !== 'ADMIN' && user.email !== 'admin@lishailabs.com') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ALL';

    const whereClause: Record<string, string> = {};
    if (status !== 'ALL') {
      whereClause.status = status;
    }

    const logs = await prisma.visit.findMany({
      where: whereClause,
      include: {
        visitor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            isBlacklisted: true
          }
        },
        host: {
          select: {
            name: true,
            department: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
