import { auth } from '@clerk/nextjs';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (user && user.role !== 'ADMIN' && user.email !== 'admin@lishailabs.com') {
      return new Response('Forbidden', { status: 403 });
    }

    const visits = await prisma.visit.findMany({
      include: {
        visitor: true,
        host: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Generate CSV Header
    let csvContent = 'Visit ID,Visitor Name,Visitor Email,Visitor Phone,Visitor Company,Visitor Type,Host Name,Host Department,Purpose,Expected Arrival,Check-In Time,Check-Out Time,Status,Allowed Zone\n';

    // Add rows
    visits.forEach((v) => {
      const visitorName = `"${v.visitor.firstName} ${v.visitor.lastName}"`;
      const company = `"${v.visitor.company || ''}"`;
      const purpose = `"${v.purpose.replace(/"/g, '""')}"`;
      const checkIn = v.actualCheckIn ? v.actualCheckIn.toISOString() : '';
      const checkOut = v.actualCheckOut ? v.actualCheckOut.toISOString() : '';

      csvContent += `${v.id},${visitorName},${v.visitor.email},${v.visitor.phone},${company},${v.visitor.visitorType},"${v.host.name}","${v.host.department}",${purpose},${v.expectedArrival.toISOString()},${checkIn},${checkOut},${v.status},${v.allowedZone}\n`;
    });

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="visitor-logs-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Error exporting logs:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
