import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateQRCode } from '@/lib/qr';
import { sendApprovalEmail } from '@/lib/email';

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

    // Fetch the visit with visitor and host details
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

    // Verify visit status
    if (visit.status !== 'PENDING') {
      return NextResponse.json({ success: false, message: 'Visit is not in PENDING state' }, { status: 400 });
    }

    // Check if visitor is blacklisted
    if (visit.visitor.isBlacklisted) {
      return NextResponse.json({ 
        success: false, 
        message: 'Cannot approve visit: Visitor is currently blacklisted.' 
      }, { status: 400 });
    }

    // Generate QR Code data URL (encodes the visit ID)
    const qrDataUrl = await generateQRCode(visitId);

    // Calculate badge expiration (24 hours after expected arrival)
    const expiresAt = new Date(visit.expectedArrival.getTime() + 24 * 60 * 60 * 1000);

    // Save Badge record and update Visit status to APPROVED in a transaction
    await prisma.$transaction([
      prisma.badge.create({
        data: {
          visitId: visitId,
          qrCode: visitId,
          qrImageUrl: qrDataUrl,
          expiresAt: expiresAt
        }
      }),
      prisma.visit.update({
        where: { id: visitId },
        data: { status: 'APPROVED' }
      })
    ]);

    // Send email notification
    const formattedDate = new Date(visit.expectedArrival).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    try {
      await sendApprovalEmail(
        visit.visitor.email,
        `${visit.visitor.firstName} ${visit.visitor.lastName}`,
        visit.host.name,
        qrDataUrl,
        formattedDate
      );
    } catch (_emailError) {
      // Gracefully fall back if Resend fails or key is missing
      console.log('SIMULATED EMAIL SENT:');
      console.log(`To: ${visit.visitor.email}`);
      console.log(`Subject: Visit Approved - Lish AI Labs`);
      console.log(`Visitor: ${visit.visitor.firstName} ${visit.visitor.lastName}`);
      console.log(`Host: ${visit.host.name}`);
      console.log(`Visit Date: ${formattedDate}`);
      console.log(`QR Code URL: [Base64 Data]`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Visit approved and QR badge generated successfully.' 
    });

  } catch (error) {
    console.error('Error approving visit:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
