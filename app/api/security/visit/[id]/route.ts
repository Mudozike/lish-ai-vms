import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
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
      return NextResponse.json({ success: false, message: 'Visit record not found or invalid QR code.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, visit });
  } catch (error) {
    console.error('Error fetching scanned visit:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
