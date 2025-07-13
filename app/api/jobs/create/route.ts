// app/api/jobs/create/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { createJobSchema } from '@/lib/validations/job';
import { createJob } from '@/lib/db/jobs';
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
    console.log('=== JOB CREATION DEBUG ===');
    console.log('Received job creation request at:', new Date().toISOString());

    // Get the token from Authorization header
    const authHeader = request.headers.get('authorization');
    console.log('Authorization header present:', !!authHeader);
    console.log('Authorization header starts with Bearer:', authHeader?.startsWith('Bearer '));
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(' No valid authorization header found');
      return NextResponse.json(
        { success: false, error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted, length:', token.length);
    console.log('Token preview:', token.substring(0, 50) + '...');

    // Verify and decode JWT
    let payload: JWTPayload;
    try {
      payload = jwtDecode<JWTPayload>(token);
      console.log(' JWT decoded successfully');
      console.log('User ID:', payload.userId);
      console.log('Email:', payload.email);
      console.log('Role:', payload.role);
      console.log('Token expires at:', new Date(payload.exp * 1000).toISOString());
    } catch (error) {
      console.log('❌ JWT decode failed:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if token is expired
    const now = Date.now();
    const tokenExpiry = payload.exp * 1000;
    const isExpired = tokenExpiry < now;
    
    console.log('Current time:', new Date(now).toISOString());
    console.log('Token expiry:', new Date(tokenExpiry).toISOString());
    console.log('Token expired:', isExpired);
    
    if (isExpired) {
      console.log(' Token expired');
      return NextResponse.json(
        { success: false, error: 'Token expired' },
        { status: 401 }
      );
    }

    // Check if user has MIS role
    console.log('Checking user role...');
    console.log('Expected role: "mis"');
    console.log('Actual role:', `"${payload.role}"`);
    console.log('Role type:', typeof payload.role);
    console.log('Role comparison result:', payload.role === 'mis');
    
    if (payload.role !== 'mis') {
      console.log(' User does not have MIS role');
      console.log('Available roles might be: candidate, employer, admin, mis, recruitment_agency');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Insufficient permissions. MIS role required.',
          debug: {
            userRole: payload.role,
            expectedRole: 'mis',
            userId: payload.userId
          }
        },
        { status: 403 }
      );
    }

    console.log('✅ Role validation passed');

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('✅ Request body parsed successfully');
      console.log('Job title:', body.title);
    } catch (error) {
      console.log('❌ Failed to parse request body:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate request data
    console.log('Validating job data...');
    const validationResult = createJobSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('❌ Validation failed:');
      validationResult.error.errors.forEach(err => {
        console.log(`  - ${err.path.join('.')}: ${err.message}`);
      });
      
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

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

    console.log('✅ Job data validation passed');
    const jobData = validationResult.data;

    // Create the job
    console.log('Creating job in database...');
    try {
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
    } catch (createError) {
      console.error('❌ Error in createJob function:', createError);
      throw createError;
    }

  } catch (error) {
    console.error('❌ Unexpected error in job creation:', error);

    if (error instanceof Error) {
      console.log('Error message:', error.message);
      console.log('Error stack:', error.stack);
      
      // Handle user-friendly error messages from createJob function
      if (error.message.includes('User account not found') ||
          error.message.includes('MIS user profile not found') ||
          error.message.includes('insufficient permissions') ||
          error.message.includes('Database constraint violation')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Permission error',
            message: error.message
          },
          { status: 403 }
        );
      }

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
        message: 'An unexpected error occurred while creating the job.'
      },
      { status: 500 }
    );
  }
}