// app/api/candidate/profile/edit/experience/add/route.ts
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
  title: string;
  description?: string;
}

interface WorkExperienceData {
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

// POST - Add new experience
export async function POST(request: NextRequest) {
  console.log('=== Add Experience API Called ===');
  
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
        { error: 'Access denied. Only candidates can add experience.' },
        { status: 403 }
      );
    }

    const requestData: WorkExperienceData = await request.json();

    console.log('Add experience request received');

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

    // Check if candidate exists
    const existingCandidate = await prisma.candidate.findUnique({
      where: { user_id: payload.userId }
    });

    if (!existingCandidate) {
      console.log('Candidate profile not found');
      return NextResponse.json(
        { error: 'Candidate profile not found' },
        { status: 404 }
      );
    }

    console.log('Data validation passed');

    // Create experience and accomplishments in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create work experience
      const createdExperience = await tx.workExperience.create({
        data: {
          candidate_id: payload.userId,
          ...expData,
          created_at: new Date(),
          updated_at: new Date(),
        }
      });

      // Create accomplishments
      const createdAccomplishments = [];
      for (const accItem of accData) {
        const createdAcc = await tx.accomplishment.create({
          data: {
            candidate_id: payload.userId,
            work_experience_id: createdExperience.id,
            ...accItem,
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
        experience: createdExperience, 
        accomplishments: createdAccomplishments 
      };
    });

    console.log('Experience created successfully');

    return NextResponse.json({
      success: true,
      message: 'Experience added successfully',
      data: {
        id: result.experience.id,
        accomplishments_count: result.accomplishments.length,
        created_at: result.experience.created_at
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Add experience error:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Duplicate entry detected' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to add experience',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}