// app/api/jobs/[id]/route.ts - Fixed for Next.js 15

import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { getJobById } from '@/lib/db/jobs';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

/**
 * Get a job by ID (MIS users only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    console.log('=== FETCHING JOB BY ID ===');
    
    // Await params to fix Next.js 15 compatibility issue
    const resolvedParams = await params;
    const jobId = resolvedParams.id;
    
    console.log('Job ID:', jobId);

    // Get the token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No authorization header found');
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
      console.log('✅ Token decoded successfully for user:', payload.userId);
    } catch (error) {
      console.log('❌ Invalid token:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if token is expired
    if (payload.exp * 1000 < Date.now()) {
      console.log('❌ Token expired');
      return NextResponse.json(
        { success: false, error: 'Token expired' },
        { status: 401 }
      );
    }

    // Check if user has MIS role
    if (payload.role !== 'mis') {
      console.log('❌ User does not have MIS role:', payload.role);
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. MIS role required.' },
        { status: 403 }
      );
    }

    if (!jobId) {
      console.log('❌ No job ID provided');
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    console.log('Fetching job from database...');
    
    // Fetch the job
    const job = await getJobById(jobId);

    if (!job) {
      console.log('❌ Job not found in database');
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    console.log('✅ Job found:', job.id);
    console.log('Job creator_id:', job.creator_id);
    console.log('Current user ID:', payload.userId);

    // Verify that the job was created by this MIS user
    if (job.creator_id !== payload.userId) {
      console.log('❌ Access denied - user did not create this job');
      return NextResponse.json(
        { success: false, error: 'Access denied. You can only view jobs you created.' },
        { status: 403 }
      );
    }

    console.log('✅ Job fetch successful');

    return NextResponse.json({
      success: true,
      data: job
    });

  } catch (error) {
    console.error('❌ Error in GET /api/jobs/[id]:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching the job.',
        ...(process.env.NODE_ENV === 'development' && {
          debug: error instanceof Error ? error.message : 'Unknown error'
        })
      },
      { status: 500 }
    );
  }
}

