import { NextResponse } from 'next/server';
import { PrismaClient, Job as PrismaJob, Application } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!session.user.email) {
      return NextResponse.json({ error: 'Admin email missing in session' }, { status: 400 });
    }
    const jobs = await prisma.job.findMany({
      where: {
        adminEmail: session.user.email,
      },
      include: {
        customQuestions: true,
        applications: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    const jobsWithAppCount = jobs.map((job: (PrismaJob & { applications: Application[] })) => ({
      ...job,
      applicationCount: job.applications.length,
    }));
    return NextResponse.json(jobsWithAppCount);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!session.user.email) {
      return NextResponse.json({ error: 'Admin email missing in session' }, { status: 400 });
    }
    const body = await request.json();
    const { title, department, location, salary, status, customQuestions } = body;
    if (!title || !department || !location || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    console.log("Custom Questions:", customQuestions);
    const job = await prisma.job.create({
      data: {
        title,
        department,
        location,
        salary,
        status,
        adminEmail: session.user.email, // set adminEmail from session
        customQuestions: {
          create: (customQuestions as Array<{ question: string; type: string; required: boolean }>)?.map((q) => ({
            question: q.question,
            type: q.type as import('@prisma/client').QuestionType, // Cast to QuestionType to satisfy Prisma's enum
            required: q.required,
          })) || [],
        },
      },
      include: { customQuestions: true },
    });
    return NextResponse.json({ message: 'Job created successfully', job }, { status: 201 });
  } catch (error) {
    console.error("Job creation error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 