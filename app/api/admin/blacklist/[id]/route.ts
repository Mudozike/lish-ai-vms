import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (user && user.role !== 'ADMIN' && user.email !== 'admin@lishailabs.com') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { id: visitorId } = await params;
    const decodedId = decodeURIComponent(visitorId);

    // Resolve visitor by CUID or email
    let visitor = await prisma.visitor.findUnique({ where: { id: decodedId } });
    if (!visitor) {
      visitor = await prisma.visitor.findUnique({ where: { email: decodedId } });
    }

    if (!visitor) {
      return NextResponse.json({ success: false, message: 'Visitor not found' }, { status: 404 });
    }

    // Perform unblacklist updates in a transaction
    // Use deleteMany to avoid throwing errors if no blacklist entry exists in the table
    await prisma.$transaction([
      prisma.visitor.update({
        where: { id: visitor.id },
        data: { isBlacklisted: false }
      }),
      prisma.blacklist.deleteMany({
        where: { visitorId: visitor.id }
      })
    ]);

    return NextResponse.json({ success: true, message: 'Visitor removed from blacklist successfully' });

  } catch (error) {
    console.error('Error removing visitor from blacklist:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
