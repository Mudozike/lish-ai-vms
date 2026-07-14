import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const hosts = await prisma.host.findMany({
      select: {
        id: true,
        name: true,
        department: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(hosts);
  } catch (error) {
    console.error('Failed to fetch hosts from database:', error);
    return NextResponse.json(
      { success: false, error: 'Database connection failed' },
      { status: 500 }
    );
  }
}
