import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: 'ACTIVE' },
      include: { customQuestions: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
} 