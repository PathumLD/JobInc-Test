// app/api/jobs/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { createJobSchema } from '@/lib/validations/job';
import { createJob, getJobsByMisUser } from '@/lib/db/jobs';
import { CreateJobResponse } from '@/lib/types/jobs/job';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

/**
 * Create a new job (MIS users only)
 */
export async function POST(request: NextRequest): Promise<NextResponse<CreateJobResponse>> {
  try {
    console.log('=== CREATING NEW JOB ===');

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

    // Parse request body
    const body = await request.json();
    console.log('Job data received:', { title: body.title, customCompanyName: body.customCompanyName });

    // Validate request data
    const validationResult = createJobSchema.safeParse(body);
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

    const jobData = validationResult.data;
    console.log('✅ Validation passed');

    // Create the job (no company linking for MIS jobs)
    const job = await createJob(jobData, payload.userId);

    console.log('✅ Job created successfully:', job.id);

    return NextResponse.json(
      {
        success: true,
        data: job,
        message: 'Job created successfully'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ Error creating job:', error);

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
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while creating the job.',
        ...(process.env.NODE_ENV === 'development' && {
          debug: error instanceof Error ? error.message : 'Unknown error'
        })
      },
      { status: 500 }
    );
  }
}

/**
 * Get jobs (with filtering and pagination)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('=== FETCHING JOBS ===');

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('Fetching jobs for user:', payload.userId);

    let result;
    try {
      result = await getJobsByMisUser(payload.userId, page, limit);
      if (!result || typeof result !== 'object') {
        console.error('❌ getJobsByMisUser returned unexpected value:', result);
        throw new Error('Failed to fetch jobs: Unexpected result');
      }
    } catch (err) {
      console.error('❌ Error in getJobsByMisUser:', err);
      throw err;
    }

    console.log('✅ Jobs fetched successfully:', result.total, 'total jobs');

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Error value:', error);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching jobs.',
        ...(process.env.NODE_ENV === 'development' && {
          debug: error instanceof Error ? error.message : String(error)
        })
      },
      { status: 500 }
    );
  }
}