// app/api/candidate/profile/edit/experience/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

interface AccomplishmentData {
  id?: string;
  title: string;
  description?: string;
}

interface WorkExperienceData {
  id?: string;
  title: string;
  company: string;
  employment_type: string;
  is_current: boolean;
  start_date: string | null;
  end_date: string | null;
  location?: string;
  description?: string;
  job_source?: string;
  skill_ids: string[];
  media_url?: string;
  accomplishments: AccomplishmentData[];
}

// Helper function to validate employment type
function validateEmploymentType(type: string): boolean {
  const validTypes = ['full_time', 'part_time', 'contract', 'internship', 'freelance', 'volunteer'];
  return validTypes.includes(type);
}

// Helper function to validate work experience data
function validateWorkExperience(experience: WorkExperienceData): { 
  isValid: boolean; 
  errors: string[]; 
  sanitizedData: any;
} {
  const errors: string[] = [];
  const sanitizedData: any = {};

  // Required fields
  if (!experience.title?.trim()) {
    errors.push('Job title is required');
  } else {
    sanitizedData.title = experience.title.trim();
  }

  if (!experience.company?.trim()) {
    errors.push('Company name is required');
  } else {
    sanitizedData.company = experience.company.trim();
  }

  if (!experience.start_date) {
    errors.push('Start date is required');
  } else {
    const startDate = new Date(experience.start_date);
    if (isNaN(startDate.getTime())) {
      errors.push('Invalid start date');
    } else {
      sanitizedData.start_date = startDate;
    }
  }

  // Employment type validation
  if (!validateEmploymentType(experience.employment_type)) {
    errors.push('Invalid employment type');
  } else {
    sanitizedData.employment_type = experience.employment_type;
  }

  // End date validation
  if (experience.end_date && !experience.is_current) {
    const endDate = new Date(experience.end_date);
    if (isNaN(endDate.getTime())) {
      errors.push('Invalid end date');
    } else if (sanitizedData.start_date && endDate < sanitizedData.start_date) {
      errors.push('End date cannot be before start date');
    } else {
      sanitizedData.end_date = endDate;
    }
  } else if (experience.is_current) {
    sanitizedData.end_date = null;
  } else {
    sanitizedData.end_date = experience.end_date ? new Date(experience.end_date) : null;
  }

  // Optional fields
  sanitizedData.is_current = Boolean(experience.is_current);
  sanitizedData.location = experience.location?.trim() || null;
  sanitizedData.description = experience.description?.trim() || null;
  sanitizedData.job_source = experience.job_source?.trim() || null;
  sanitizedData.media_url = experience.media_url?.trim() || null;
  sanitizedData.skill_ids = Array.isArray(experience.skill_ids) ? experience.skill_ids : [];

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}

// Helper function to validate accomplishments
function validateAccomplishments(accomplishments: AccomplishmentData[]): {
  isValid: boolean;
  errors: string[];
  sanitizedData: any[];
} {
  const errors: string[] = [];
  const sanitizedData: any[] = [];

  accomplishments.forEach((acc, index) => {
    if (!acc.title?.trim()) {
      errors.push(`Accomplishment ${index + 1}: Title is required`);
    } else {
      sanitizedData.push({
        id: acc.id,
        title: acc.title.trim(),
        description: acc.description?.trim() || null
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}

// GET - Fetch single experience
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  console.log('=== Single Experience Fetch API Called ===');
  
  try {
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
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const experienceId = params.id;

    // Fetch work experience with accomplishments
    const workExperience = await prisma.workExperience.findFirst({
      where: { 
        id: experienceId,
        candidate_id: payload.userId
      },
      include: {
        accomplishments: {
          orderBy: { created_at: 'asc' }
        }
      }
    });

    if (!workExperience) {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: workExperience
    });

  } catch (error: any) {
    console.error('Error fetching experience:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experience' },
      { status: 500 }
    );
  }
}

// PUT - Update single experience
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  console.log('=== Single Experience Update API Called ===');
  
  try {
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
      console.log('Token validation failed');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (payload.role !== 'candidate') {
      return NextResponse.json(
        { error: 'Access denied. Only candidates can update experience.' },
        { status: 403 }
      );
    }

    const experienceId = params.id;
    const requestData: WorkExperienceData = await request.json();

    console.log('Experience update request for ID:', experienceId);

    // Validate work experience data
    const { isValid: expValid, errors: expErrors, sanitizedData: expData } = validateWorkExperience(requestData);
    
    // Validate accomplishments
    const { isValid: accValid, errors: accErrors, sanitizedData: accData } = validateAccomplishments(requestData.accomplishments || []);

    const allErrors = [...expErrors, ...accErrors];
    if (allErrors.length > 0) {
      console.log('Validation failed:', allErrors);
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: allErrors 
        },
        { status: 400 }
      );
    }

    // Check if experience exists and belongs to user
    const existingExperience = await prisma.workExperience.findFirst({
      where: { 
        id: experienceId,
        candidate_id: payload.userId
      }
    });

    if (!existingExperience) {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      );
    }

    console.log('Data validation passed');

    // Update experience and accomplishments in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update work experience
      const updatedExperience = await tx.workExperience.update({
        where: { id: experienceId },
        data: {
          ...expData,
          updated_at: new Date(),
        }
      });

      // Delete existing accomplishments for this experience
      await tx.accomplishment.deleteMany({
        where: { work_experience_id: experienceId }
      });

      // Create new accomplishments
      const createdAccomplishments = [];
      for (const accItem of accData) {
        const { id, ...createData } = accItem;
        const createdAcc = await tx.accomplishment.create({
          data: {
            candidate_id: payload.userId,
            work_experience_id: experienceId,
            ...createData,
            created_at: new Date(),
            updated_at: new Date(),
          }
        });
        createdAccomplishments.push(createdAcc);
      }

      // Update candidate's updated_at timestamp
      await tx.candidate.update({
        where: { user_id: payload.userId },
        data: { updated_at: new Date() }
      });

      return { 
        experience: updatedExperience, 
        accomplishments: createdAccomplishments 
      };
    });

    console.log('Experience updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Experience updated successfully',
      data: {
        id: result.experience.id,
        accomplishments_count: result.accomplishments.length,
        updated_at: result.experience.updated_at
      }
    });

  } catch (error: any) {
    console.error('Experience update error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update experience',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete single experience
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  console.log('=== Single Experience Delete API Called ===');
  
  try {
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
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (payload.role !== 'candidate') {
      return NextResponse.json(
        { error: 'Access denied. Only candidates can delete experience.' },
        { status: 403 }
      );
    }

    const experienceId = params.id;

    // Check if experience exists and belongs to user
    const existingExperience = await prisma.workExperience.findFirst({
      where: { 
        id: experienceId,
        candidate_id: payload.userId
      }
    });

    if (!existingExperience) {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      );
    }

    console.log('Deleting experience ID:', experienceId);

    // Delete experience and related accomplishments in transaction
    await prisma.$transaction(async (tx) => {
      // Delete accomplishments first (due to foreign key constraint)
      await tx.accomplishment.deleteMany({
        where: { work_experience_id: experienceId }
      });

      // Delete work experience
      await tx.workExperience.delete({
        where: { id: experienceId }
      });

      // Update candidate's updated_at timestamp
      await tx.candidate.update({
        where: { user_id: payload.userId },
        data: { updated_at: new Date() }
      });
    });

    console.log('Experience deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Experience deleted successfully'
    });

  } catch (error: any) {
    console.error('Experience delete error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to delete experience',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}