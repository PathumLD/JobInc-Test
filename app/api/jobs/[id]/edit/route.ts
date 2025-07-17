// app/api/jobs/[id]/edit/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { updateJobSchema } from '@/lib/validations/job';
import { updateJob, getJobById } from '@/lib/db/jobs';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

/**
 * Update a job (MIS users only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    console.log('=== UPDATING JOB ===');
    
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

    // Check if job exists and user has permission
    const existingJob = await getJobById(jobId);
    if (!existingJob) {
      console.log('❌ Job not found');
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    if (existingJob.creator_id !== payload.userId) {
      console.log('❌ Access denied - user did not create this job');
      return NextResponse.json(
        { success: false, error: 'Access denied. You can only edit jobs you created.' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    console.log('Job update data received:', { title: body.title, status: body.status });

    // Validate request data
    const validationResult = updateJobSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      console.log('❌ Validation failed:', errors);

      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          message: 'Please check the form data and try again.',
          details: errors
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;
    console.log('✅ Validation passed');

    // Update the job
    const updatedJob = await updateJob(jobId, updateData, payload.userId);

    if (!updatedJob) {
      console.log('❌ Failed to update job');
      return NextResponse.json(
        { success: false, error: 'Failed to update job' },
        { status: 500 }
      );
    }

    console.log('✅ Job updated successfully:', updatedJob.id);

    return NextResponse.json({
      success: true,
      data: updatedJob,
      message: 'Job updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating job:', error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid data reference',
            message: 'One or more referenced entities do not exist.'
          },
          { status: 400 }
        );
      }

      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Duplicate entry',
            message: 'A job with similar details already exists.'
          },
          { status: 409 }
        );
      }

      if (error.message.includes('Invalid value for argument')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid enum value',
            message: 'One or more field values do not match expected options.'
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while updating the job.',
        ...(process.env.NODE_ENV === 'development' && {
          debug: error instanceof Error ? error.message : 'Unknown error'
        })
      },
      { status: 500 }
    );
  }
}