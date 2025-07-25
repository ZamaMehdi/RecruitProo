import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { NextApiRequest } from 'next';
import type { NextRequest as VercelNextRequest } from 'next/server';

const prisma = new PrismaClient();

export async function PATCH(
  req: VercelNextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await req.json();

    if (!['PENDING', 'ACCEPTED', 'REJECTED', 'ON_HOLD'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await prisma.application.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
