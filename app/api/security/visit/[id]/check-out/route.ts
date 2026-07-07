import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id: visitId } = await params;

    const visit = await prisma.visit.findUnique({
      where: { id: visitId }
    });

    if (!visit) {
      return NextResponse.json({ success: false, message: 'Visit record not found' }, { status: 404 });
    }

    if (visit.status !== 'CHECKED_IN') {
      return NextResponse.json({ 
        success: false, 
        message: `Cannot check-out. Visit status is currently ${visit.status}. Only CHECKED_IN visitors can check-out.` 
      }, { status: 400 });
    }

    const now = new Date();

    // Use transaction to update Visit and write MovementLog
    await prisma.$transaction([
      prisma.visit.update({
        where: { id: visitId },
        data: {
          status: 'CHECKED_OUT',
          actualCheckOut: now
        }
      }),
      prisma.movementLog.create({
        data: {
          visitId: visitId,
          zone: 'Lobby',
          eventType: 'EXIT',
          timestamp: now
        }
      })
    ]);

    return NextResponse.json({ success: true, message: 'Visitor successfully checked out.' });

  } catch (error) {
    console.error('Error during check-out:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
