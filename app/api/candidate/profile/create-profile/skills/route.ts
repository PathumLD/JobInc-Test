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
    const { skills } = data;
    
    // Delete existing candidate skills
    await prisma.candidateSkill.deleteMany({
      where: { candidate_id: payload.userId }
    });

    if (skills && skills.length > 0) {
      for (const skillData of skills) {
        // Create or get skill
        const skill = await prisma.skill.upsert({
          where: { name: skillData.name },
          create: {
            name: skillData.name,
            category: skillData.category || null,
            description: skillData.description || null
          },
          update: {}
        });

        // Create candidate skill
        await prisma.candidateSkill.create({
          data: {
            candidate_id: payload.userId,
            skill_id: skill.id,
            proficiency: skillData.proficiency || 0,
            skill_source: skillData.skill_source || 'manual'
          }
        });
      }
    }

    return NextResponse.json({ message: 'Skills saved successfully' });

  } catch (error) {
    console.error('Skills error:', error);
    return NextResponse.json(
      { error: 'Failed to save skills. Please try again.' },
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
    const candidateSkills = await prisma.candidateSkill.findMany({
      where: { candidate_id: payload.userId },
      include: {
        skill: true
      }
    });

    return NextResponse.json({ skills: candidateSkills });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}