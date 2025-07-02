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

  let data: any;
  try {
    data = await req.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const { educations } = data;
    
    // Delete existing education records
    await prisma.education.deleteMany({
      where: { candidate_id: payload.userId }
    });

    // Create new education records
    if (educations && educations.length > 0) {
      await prisma.education.createMany({
        data: educations.map((edu: any) => ({
          candidate_id: payload.userId,
          degree_diploma: edu.degree_diploma,
          university_school: edu.university_school,
          field_of_study: edu.field_of_study || null,
          start_date: new Date(edu.start_date),
          end_date: edu.end_date ? new Date(edu.end_date) : null,
          grade: edu.grade || null,
          activities_societies: edu.activities_societies || null,
          skill_ids: edu.skill_ids || []
        }))
      });
    }

    return NextResponse.json({ message: 'Education saved successfully' });

  } catch (error) {
    console.error('Education error:', error);
    return NextResponse.json(
      { error: 'Failed to save education. Please try again.' },
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
    const educations = await prisma.education.findMany({
      where: { candidate_id: payload.userId },
      orderBy: { start_date: 'desc' }
    });

    return NextResponse.json({ educations });
  } catch (error) {
    console.error('Error fetching education:', error);
    return NextResponse.json(
      { error: 'Failed to fetch education' },
      { status: 500 }
    );
  }
}