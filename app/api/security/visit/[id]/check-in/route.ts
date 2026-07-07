import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { sendCheckInNotification } from '@/lib/email';

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
      where: { id: visitId },
      include: {
        visitor: true,
        host: true
      }
    });

    if (!visit) {
      return NextResponse.json({ success: false, message: 'Visit record not found' }, { status: 404 });
    }

    if (visit.status !== 'APPROVED') {
      return NextResponse.json({ 
        success: false, 
        message: `Cannot check-in. Visit status is currently ${visit.status}. Only APPROVED visits can check-in.` 
      }, { status: 400 });
    }

    const now = new Date();

    // Use transaction to update Visit and write MovementLog
    await prisma.$transaction([
      prisma.visit.update({
        where: { id: visitId },
        data: {
          status: 'CHECKED_IN',
          actualCheckIn: now
        }
      }),
      prisma.movementLog.create({
        data: {
          visitId: visitId,
          zone: 'Lobby',
          eventType: 'ENTRY',
          timestamp: now
        }
      })
    ]);

    // Notify Host via Resend
    try {
      await sendCheckInNotification(
        visit.host.email,
        visit.host.name,
        `${visit.visitor.firstName} ${visit.visitor.lastName}`,
        visit.purpose
      );
    } catch (_emailError) {
      console.log('SIMULATED CHECK-IN NOTIFICATION EMAIL:");');
      console.log(`To Host Email: ${visit.host.email}`);
      console.log(`Host: ${visit.host.name}`);
      console.log(`Visitor: ${visit.visitor.firstName} ${visit.visitor.lastName}`);
      console.log(`Purpose: ${visit.purpose}`);
    }

    return NextResponse.json({ success: true, message: 'Visitor successfully checked in.' });

  } catch (error) {
    console.error('Error during check-in:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
