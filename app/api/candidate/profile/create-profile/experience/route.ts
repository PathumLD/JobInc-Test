import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let payload: { userId: string; email: string; role: string };
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string; role: string };
  } catch (error) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  if (payload.role !== 'employee' && payload.role !== 'candidate') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let data: any;
  try {
    data = await req.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const { experiences } = data;
    
    // Delete existing work experiences
    await prisma.workExperience.deleteMany({
      where: { candidate_id: payload.userId }
    });

    // Create new work experiences
    if (experiences && experiences.length > 0) {
      const workExperiences = await prisma.workExperience.createMany({
        data: experiences.map((exp: any) => ({
          candidate_id: payload.userId,
          title: exp.title,
          company: exp.company,
          employment_type: exp.employment_type || 'full_time',
          is_current: exp.is_current || false,
          start_date: new Date(exp.start_date),
          end_date: exp.end_date ? new Date(exp.end_date) : null,
          location: exp.location || null,
          description: exp.description || null,
          skill_ids: exp.skill_ids || []
        }))
      });
    }

    return NextResponse.json({ message: 'Work experience saved successfully' });

  } catch (error) {
    console.error('Work experience error:', error);
    return NextResponse.json(
      { error: 'Failed to save work experience. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let payload: { userId: string; email: string; role: string };
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string; role: string };
  } catch (error) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  try {
    const workExperiences = await prisma.workExperience.findMany({
      where: { candidate_id: payload.userId },
      orderBy: { start_date: 'desc' }
    });

    return NextResponse.json({ workExperiences });
  } catch (error) {
    console.error('Error fetching work experience:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work experience' },
      { status: 500 }
    );
  }
}