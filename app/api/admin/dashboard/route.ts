import { auth, currentUser } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Role check mapping - Database first check
    let dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses[0]?.emailAddress;
      if (email === 'admin@lishailabs.com') {
        dbUser = await prisma.user.create({
          data: {
            clerkId: userId,
            email: email,
            name: clerkUser?.firstName 
              ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() 
              : 'Lish Admin',
            role: 'ADMIN',
            department: 'Admin'
          }
        });
      }
    }

    if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.email !== 'admin@lishailabs.com')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Queries for stats with error boundaries
    const totalVisitorsToday = await prisma.visit.count({
      where: {
        expectedArrival: {
          gte: startOfToday,
          lte: endOfToday
        }
      }
    });

    const currentlyOnSite = await prisma.visit.count({
      where: { status: 'CHECKED_IN' }
    });

    const pendingApprovals = await prisma.visit.count({
      where: { status: 'PENDING' }
    });

    const checkedInToday = await prisma.visit.count({
      where: {
        actualCheckIn: {
          gte: startOfToday,
          lte: endOfToday
        }
      }
    });

    // Chart Data 1: Visitors per Department
    const visitsForDepartment = await prisma.visit.findMany({
      include: {
        host: true
      }
    });

    const deptMap: { [key: string]: number } = {};
    const departments = ['Executive', 'Training', 'Operations', 'HR', 'Admin'];
    departments.forEach(d => { deptMap[d] = 0; });

    visitsForDepartment.forEach(v => {
      if (v.host && v.host.department) {
        deptMap[v.host.department] = (deptMap[v.host.department] || 0) + 1;
      }
    });

    const departmentData = Object.entries(deptMap).map(([name, value]) => ({
      name,
      value
    }));

    // Chart Data 2: Visit Status Distribution
    const statusCounts = await prisma.visit.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    const statusMap: { [key: string]: number } = {
      PENDING: 0,
      APPROVED: 0,
      CHECKED_IN: 0,
      CHECKED_OUT: 0,
      REJECTED: 0
    };

    statusCounts.forEach(sc => {
      statusMap[sc.status] = sc._count.id;
    });

    const statusData = Object.entries(statusMap).map(([name, value]) => ({
      name,
      value
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalVisitorsToday,
        currentlyOnSite,
        pendingApprovals,
        checkedInToday
      },
      departmentData,
      statusData
    });

  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
