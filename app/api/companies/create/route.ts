import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, email, contact, website } = await req.json();
    const company = await prisma.company.create({
      data: { name, email, contact, website }
    });
    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}