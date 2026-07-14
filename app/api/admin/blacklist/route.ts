import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (user && user.role !== 'ADMIN' && user.email !== 'admin@lishailabs.com') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { visitorId, reason } = await request.json();
    if (!visitorId || !reason) {
      return NextResponse.json({ success: false, message: 'Visitor identifier and reason are required' }, { status: 400 });
    }

    // Resolve visitor by CUID or by email fallback to ensure client compatibility
    let visitor = await prisma.visitor.findUnique({ where: { id: visitorId } });
    if (!visitor) {
      visitor = await prisma.visitor.findUnique({ where: { email: visitorId } });
    }

    if (!visitor) {
      return NextResponse.json({ success: false, message: 'Visitor not found' }, { status: 404 });
    }

    // Perform blacklist updates in a transaction
    await prisma.$transaction([
      prisma.visitor.update({
        where: { id: visitor.id },
        data: { isBlacklisted: true }
      }),
      prisma.blacklist.upsert({
        where: { visitorId: visitor.id },
        update: { reason, addedBy: userId },
        create: { visitorId: visitor.id, reason, addedBy: userId }
      })
    ]);

    return NextResponse.json({ success: true, message: 'Visitor blacklisted successfully' });

  } catch (error) {
    console.error('Error blacklisting visitor:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
