import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: true,
        job: true,
        answers: {
          include: {
            customQuestion: true,
          },
        },
        actionLogs: {
          select: {
            id: true,
            action: true,
            timestamp: true,
          },
          orderBy: { timestamp: 'desc' },
        },
      },
    });
    if (!application) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(application);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
  }
} 