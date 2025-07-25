// app/api/admin/applications/[id]/status/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

type Context = {
  params: {
    id: string;
  };
};

export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();

    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'ON_HOLD'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await prisma.application.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Failed to update application status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
