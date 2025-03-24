import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to view statistics' },
        { status: 401 }
      );
    }

    const applications = await prisma.application.findMany({
      where: {
        userId: session.user.id
      }
    });

    const stats = {
      totalApplications: applications.length,
      pending: applications.filter(app => app.status === 'PENDING').length,
      interviews: applications.filter(app => app.status === 'INTERVIEW').length,
      offers: applications.filter(app => app.status === 'OFFER').length
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching application statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application statistics' },
      { status: 500 }
    );
  }
} 