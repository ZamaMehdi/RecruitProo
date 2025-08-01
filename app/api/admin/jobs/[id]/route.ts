import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(job);
  } catch (error) {
    console.error("Failed to fetch job:", error);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    const data = await req.json();
    const updated = await prisma.job.update({
      where: { id },
      data: {
        title: data.title,
        department: data.department,
        location: data.location,
        salary: data.salary,
        status: data.status,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update job:", error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
} 