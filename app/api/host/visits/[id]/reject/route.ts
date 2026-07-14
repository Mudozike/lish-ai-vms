import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { sendRejectionEmail } from '@/lib/email';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id: visitId } = await params;
    const { reason } = await request.json();

    if (!reason || reason.trim() === '') {
      return NextResponse.json({ success: false, message: 'Rejection reason is required' }, { status: 400 });
    }

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        visitor: true,
        host: true
      }
    });

    if (!visit) {
      return NextResponse.json({ success: false, message: 'Visit not found' }, { status: 404 });
    }

    if (visit.status !== 'PENDING') {
      return NextResponse.json({ success: false, message: 'Visit is not in PENDING state' }, { status: 400 });
    }

    await prisma.visit.update({
      where: { id: visitId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason
      }
    });

    try {
      await sendRejectionEmail(
        visit.visitor.email,
        `${visit.visitor.firstName} ${visit.visitor.lastName}`,
        visit.host.name,
        reason
      );
    } catch {
      console.log('SIMULATED EMAIL SENT (REJECTION):');
      console.log(`To: ${visit.visitor.email}`);
      console.log(`Subject: Visit Update - Lish AI Labs`);
      console.log(`Visitor: ${visit.visitor.firstName} ${visit.visitor.lastName}`);
      console.log(`Host: ${visit.host.name}`);
      console.log(`Status: REJECTED`);
      console.log(`Reason: ${reason}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Visit rejected successfully.' 
    });

  } catch (error) {
    console.error('Error rejecting visit:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
