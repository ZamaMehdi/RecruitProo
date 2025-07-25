import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      education: true,
      workExperience: true,
      phone: true,
      github: true,
      portfolio: true,
    },
  });
  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await request.json();
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name,
      education: data.education, // now expects array of objects
      workExperience: data.workExperience, // now expects array of objects
      phone: data.phone,
      github: data.github,
      portfolio: data.portfolio,
    },
    select: {
      id: true,
      name: true,
      email: true,
      education: true,
      workExperience: true,
      phone: true,
      github: true,
      portfolio: true,
    },
  });
  return NextResponse.json(user);
} 