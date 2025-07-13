// app/api/skills/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { getAllSkills } from '@/lib/db/jobs';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

interface SkillsResponse {
  success: boolean;
  data?: Array<{
    id: string;
    name: string;
    category?: string;
  }>;
  error?: string;
  message?: string;
}

/**
 * Get all active skills
 */
export async function GET(request: NextRequest): Promise<NextResponse<SkillsResponse>> {
  try {
    // Get the token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify and decode JWT
    let payload: JWTPayload;
    try {
      payload = jwtDecode<JWTPayload>(token);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if token is expired
    if (payload.exp * 1000 < Date.now()) {
      return NextResponse.json(
        { success: false, error: 'Token expired' },
        { status: 401 }
      );
    }

    // Check if user has appropriate role (MIS users can access skills)
    if (payload.role !== 'mis' && payload.role !== 'employer' && payload.role !== 'candidate') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions.' },
        { status: 403 }
      );
    }

    // Fetch all active skills
    const skills = await getAllSkills();

    return NextResponse.json({
      success: true,
      data: skills,
      message: skills.length === 0 ? 'No skills found' : undefined
    });

  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching skills.'
      },
      { status: 500 }
    );
  }
}