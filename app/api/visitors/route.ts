import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      firstName, lastName, email, phone, company, 
      visitorType, hostId, purpose, expectedArrival 
    } = body;

    // Check if visitor already exists
    let visitor = await prisma.visitor.findUnique({
      where: { email }
    });

    // If not, create them
    if (!visitor) {
      visitor = await prisma.visitor.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          company,
          visitorType
        }
      });
    }

    // Create the visit
    const visit = await prisma.visit.create({
      data: {
        visitorId: visitor.id,
        hostId: hostId,
        purpose: purpose,
        expectedArrival: new Date(expectedArrival),
        status: 'PENDING'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Registration submitted! Waiting for host approval.',
      visitId: visit.id 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong.' },
      { status: 500 }
    );
  }
}
