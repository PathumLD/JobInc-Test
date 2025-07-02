// app/api/candidate/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { Decimal } from '@prisma/client/runtime/library';

// GET - Fetch candidate profile
export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let payload: any;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  if (payload.role !== 'employee' && payload.role !== 'candidate') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const candidate = await prisma.candidate.findUnique({
      where: { user_id: payload.userId },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Convert Decimal to string for JSON serialization
    const candidateWithSerializedDecimals = {
      ...candidate,
      expected_salary_min: candidate.expected_salary_min?.toString(),
      expected_salary_max: candidate.expected_salary_max?.toString(),
      availability_date: candidate.availability_date?.toISOString(),
    };

    return NextResponse.json({ candidate: candidateWithSerializedDecimals });
  } catch (error) {
    console.error('Fetch candidate profile error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST - Update candidate profile
export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let payload: any;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  if (payload.role !== 'employee' && payload.role !== 'candidate') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const data = await req.json();

  // Helper functions for type conversion
  function toInt(val: any): number | null {
    if (val === undefined || val === null || val === '') return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  }

  function toDecimal(val: any): Decimal | null {
    if (val === undefined || val === null || val === '') return null;
    const n = Number(val);
    return isNaN(n) ? null : new Decimal(n);
  }

  function toDate(val: any): Date | null {
    if (!val) return null;
    return new Date(val);
  }

  const candidateData = {
    first_name: data.first_name,
    last_name: data.last_name,
    title: data.title || null,
    bio: data.bio || null,
    location: data.location || null,
    remote_preference: data.remote_preference || 'flexible',
    experience_level: data.experience_level || 'entry',
    years_of_experience: toInt(data.years_of_experience),
    expected_salary_min: toDecimal(data.expected_salary_min),
    expected_salary_max: toDecimal(data.expected_salary_max),
    currency: data.currency || 'USD',
    availability_status: data.availability_status || 'available',
    availability_date: toDate(data.availability_date),
    resume_url: data.resume_url || null,
    portfolio_url: data.portfolio_url || null,
    github_url: data.github_url || null,
    linkedin_url: data.linkedin_url || null,
    personal_website: data.personal_website || null,
    profile_completion_percentage: toInt(data.profile_completion_percentage) || 0,
  };

  try {
    const candidate = await prisma.candidate.upsert({
      where: { user_id: payload.userId },
      update: candidateData,
      create: {
        ...candidateData,
        user: { connect: { id: payload.userId } },
      },
    });
    
    // Return the updated profile with serialized decimals
    const responseData = {
      ...candidate,
      expected_salary_min: candidate.expected_salary_min?.toString(),
      expected_salary_max: candidate.expected_salary_max?.toString(),
      availability_date: candidate.availability_date?.toISOString(),
    };
    
    return NextResponse.json({ candidate: responseData });
  } catch (error) {
    console.error('Candidate profile error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}