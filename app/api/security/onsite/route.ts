import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const visitors = await prisma.visit.findMany({
      where: {
        status: 'CHECKED_IN'
      },
      include: {
        visitor: true,
        host: true
      },
      orderBy: {
        actualCheckIn: 'desc'
      }
    });

    return NextResponse.json({ success: true, visitors });
  } catch (error) {
    console.error('Error fetching onsite visitors:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
