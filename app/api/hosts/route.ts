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
    console.error('Failed to fetch hosts:', error);
    return NextResponse.json([]);
  }
}
