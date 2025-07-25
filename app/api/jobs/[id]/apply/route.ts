import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const url = new URL(request.url);
  const jobId = url.pathname.split('/').slice(-2, -1)[0];
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID missing in session.' }, { status: 400 });
    }
    const body = await request.json();
    const { answers, resumeUrl } = body;
    // Check if user already applied
    const existing = await prisma.application.findFirst({ where: { userId, jobId } });
    if (existing) {
      return NextResponse.json({ error: 'You have already applied to this job.' }, { status: 409 });
    }
    // Create application
    const application = await prisma.application.create({
      data: {
        userId,
        jobId,
        resumeUrl,
        answers: {
          create: (answers as Array<{ customQuestionId: string; answer: string }>).map((a) => ({
            customQuestionId: a.customQuestionId,
            answer: a.answer,
          })),
        },
      },
      include: { answers: true },
    });
    return NextResponse.json({ message: 'Application submitted successfully', application }, { status: 201 });
  } catch (error) {
    console.error("Application submission error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 