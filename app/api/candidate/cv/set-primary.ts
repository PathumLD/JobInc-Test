// app/api/cv/set-primary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    let payload: JWTPayload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (payload.role !== 'candidate') {
      return NextResponse.json(
        { error: 'Access denied. Only candidates can set primary resume.' },
        { status: 403 }
      );
    }

    // 2. Parse request body
    const { resumeId } = await request.json();

    if (!resumeId) {
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }

    // 3. Verify resume ownership
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        candidate_id: payload.userId
      }
    });

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found or access denied' },
        { status: 404 }
      );
    }

    // 4. Update primary resume status
    const result = await prisma.$transaction(async (tx) => {
      // Set all resumes to non-primary
      await tx.resume.updateMany({
        where: { candidate_id: payload.userId },
        data: { is_primary: false }
      });

      // Set the selected resume as primary
      const updatedResume = await tx.resume.update({
        where: { id: resumeId },
        data: { is_primary: true }
      });

      // Update candidate's resume_url
      await tx.candidate.update({
        where: { user_id: payload.userId },
        data: { resume_url: updatedResume.resume_url }
      });

      return updatedResume;
    });

    console.log('✅ Primary resume updated:', resumeId);

    return NextResponse.json({
      success: true,
      message: 'Primary resume updated successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Set primary resume error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}