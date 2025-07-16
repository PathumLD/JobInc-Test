// app/api/jobs/[id]/status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { updateJobStatus } from '@/lib/db/jobs';
import { JobStatus } from '@/lib/types/jobs/job';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

/**
 * Update job status (MIS users only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    console.log('=== UPDATING JOB STATUS ===');
    console.log('Job ID:', params.id);

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

    const jobId = params.id;
    if (!jobId) {
      console.log('❌ No job ID provided');
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status } = body;

    console.log('New status:', status);

    if (!status || !Object.values(JobStatus).includes(status)) {
      console.log('❌ Invalid status provided:', status);
      return NextResponse.json(
        { success: false, error: 'Valid status is required' },
        { status: 400 }
      );
    }

    console.log('Updating job status in database...');

    // Update the job status
    const success = await updateJobStatus(jobId, status, payload.userId);

    if (!success) {
      console.log('❌ Job not found or access denied');
      return NextResponse.json(
        { success: false, error: 'Job not found or access denied' },
        { status: 404 }
      );
    }

    console.log('✅ Job status updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Job status updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating job status:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while updating the job status.',
        ...(process.env.NODE_ENV === 'development' && {
          debug: error instanceof Error ? error.message : 'Unknown error'
        })
      },
      { status: 500 }
    );
  }
}