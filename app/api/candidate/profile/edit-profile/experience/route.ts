// app/api/candidate/profile/edit/experience/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { WorkExperienceData } from '@/lib/types/candidate/profile/profile';
import { AccomplishmentData, ExperienceUpdateData } from '@/lib/types/candidate/profile/edit-experience';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

// Helper function to validate employment type
function validateEmploymentType(type: string): boolean {
  const validTypes = ['full_time', 'part_time', 'contract', 'internship', 'freelance', 'volunteer'];
  return validTypes.includes(type);
}

// Helper function to validate and sanitize work experience data
function validateWorkExperience(experience: WorkExperienceData, index: number): { 
  isValid: boolean; 
  errors: string[]; 
  sanitizedData: any;
} {
  const errors: string[] = [];
  const sanitizedData: any = {};

  // Required fields
  if (!experience.title?.trim()) {
    errors.push(`Experience ${index + 1}: Job title is required`);
  } else {
    sanitizedData.title = experience.title.trim();
  }

  if (!experience.company?.trim()) {
    errors.push(`Experience ${index + 1}: Company name is required`);
  } else {
    sanitizedData.company = experience.company.trim();
  }

  if (!experience.start_date) {
    errors.push(`Experience ${index + 1}: Start date is required`);
  } else {
    const startDate = new Date(experience.start_date);
    if (isNaN(startDate.getTime())) {
      errors.push(`Experience ${index + 1}: Invalid start date`);
    } else {
      sanitizedData.start_date = startDate;
    }
  }

  // Employment type validation
  if (!validateEmploymentType(experience.employment_type)) {
    errors.push(`Experience ${index + 1}: Invalid employment type`);
  } else {
    sanitizedData.employment_type = experience.employment_type;
  }

  // End date validation
  if (experience.end_date && !experience.is_current) {
    const endDate = new Date(experience.end_date);
    if (isNaN(endDate.getTime())) {
      errors.push(`Experience ${index + 1}: Invalid end date`);
    } else if (sanitizedData.start_date && endDate < sanitizedData.start_date) {
      errors.push(`Experience ${index + 1}: End date cannot be before start date`);
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

  // Include ID if updating existing experience
  if (experience.id) {
    sanitizedData.id = experience.id;
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}

// Helper function to validate accomplishment data
function validateAccomplishment(accomplishment: AccomplishmentData, index: number): {
  isValid: boolean;
  errors: string[];
  sanitizedData: any;
} {
  const errors: string[] = [];
  const sanitizedData: any = {};

  // Required fields
  if (!accomplishment.title?.trim()) {
    errors.push(`Accomplishment ${index + 1}: Title is required`);
  } else {
    sanitizedData.title = accomplishment.title.trim();
  }

  // Optional fields
  sanitizedData.description = accomplishment.description?.trim() || null;
  sanitizedData.temp_work_experience_index = accomplishment.temp_work_experience_index;

  // Include ID if updating existing accomplishment
  if (accomplishment.id) {
    sanitizedData.id = accomplishment.id;
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}

export async function PUT(request: NextRequest) {
  console.log('=== Experience Update API Called ===');
  
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

    console.log('Token validated successfully, userId:', payload.userId);

    // 2. Parse request body
    const requestData: ExperienceUpdateData = await request.json();
    console.log('Experience update request received:', {
      work_experiences: requestData.work_experiences?.length || 0,
      accomplishments: requestData.accomplishments?.length || 0
    });

    // 3. Validate work experiences
    const validatedExperiences: any[] = [];
    const experienceErrors: string[] = [];

    if (requestData.work_experiences) {
      requestData.work_experiences.forEach((exp, index) => {
        const { isValid, errors, sanitizedData } = validateWorkExperience(exp, index);
        if (isValid) {
          validatedExperiences.push(sanitizedData);
        } else {
          experienceErrors.push(...errors);
        }
      });
    }

    // 4. Validate accomplishments
    const validatedAccomplishments: any[] = [];
    const accomplishmentErrors: string[] = [];

    if (requestData.accomplishments) {
      requestData.accomplishments.forEach((acc, index) => {
        const { isValid, errors, sanitizedData } = validateAccomplishment(acc, index);
        if (isValid) {
          validatedAccomplishments.push(sanitizedData);
        } else {
          accomplishmentErrors.push(...errors);
        }
      });
    }

    // 5. Check for validation errors
    const allErrors = [...experienceErrors, ...accomplishmentErrors];
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

    console.log('Data validation passed');

    // 6. Check if candidate exists
    const existingCandidate = await prisma.candidate.findUnique({
      where: { user_id: payload.userId },
      include: {
        work_experiences: {
          include: {
            accomplishments: true
          }
        }
      }
    });

    if (!existingCandidate) {
      console.log('Candidate profile not found');
      return NextResponse.json(
        { error: 'Candidate profile not found' },
        { status: 404 }
      );
    }

    // 7. Update work experiences and accomplishments in transaction
    console.log('Updating work experiences and accomplishments...');
    
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing work experiences and their accomplishments
      await tx.accomplishment.deleteMany({
        where: { candidate_id: payload.userId }
      });
      
      await tx.workExperience.deleteMany({
        where: { candidate_id: payload.userId }
      });

      // Create new work experiences
      const createdExperiences: any[] = [];
      const experienceIdMap = new Map(); // Map original index to new ID

      for (let i = 0; i < validatedExperiences.length; i++) {
        const expData = validatedExperiences[i];
        const { id, ...createData } = expData; // Remove ID for creation
        
        const createdExp = await tx.workExperience.create({
          data: {
            candidate_id: payload.userId,
            ...createData,
            created_at: new Date(),
            updated_at: new Date(),
          }
        });
        
        createdExperiences.push(createdExp);
        experienceIdMap.set(i, createdExp.id);
      }

      // Create accomplishments linked to work experiences
      const createdAccomplishments: any[] = [];
      
      for (const accData of validatedAccomplishments) {
        const { id, temp_work_experience_index, ...createData } = accData;
        
        // Determine work_experience_id from mapping
        let workExperienceId = null;
        if (temp_work_experience_index !== undefined && temp_work_experience_index !== null) {
          workExperienceId = experienceIdMap.get(temp_work_experience_index) || null;
        }

        const createdAcc = await tx.accomplishment.create({
          data: {
            candidate_id: payload.userId,
            work_experience_id: workExperienceId,
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
        experiences: createdExperiences, 
        accomplishments: createdAccomplishments 
      };
    });

    console.log('Experience data updated successfully');

    // 8. Prepare response data
    const responseData = {
      work_experiences_count: result.experiences.length,
      accomplishments_count: result.accomplishments.length,
      updated_at: new Date(),
    };

    return NextResponse.json({
      success: true,
      message: 'Work experience updated successfully',
      data: responseData
    });

  } catch (error: any) {
    console.error('Experience update error:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Duplicate entry detected' },
        { status: 400 }
      );
    } else if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update work experience',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// GET method to fetch current experience data
export async function GET(request: NextRequest) {
  console.log('=== Experience Fetch API Called ===');
  
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

    // Fetch work experiences with accomplishments
    const workExperiences = await prisma.workExperience.findMany({
      where: { candidate_id: payload.userId },
      include: {
        accomplishments: {
          orderBy: { created_at: 'asc' }
        }
      },
      orderBy: [
        { is_current: 'desc' },
        { start_date: 'desc' }
      ]
    });

    // Fetch standalone accomplishments (not linked to any work experience)
    const standaloneAccomplishments = await prisma.accomplishment.findMany({
      where: { 
        candidate_id: payload.userId,
        work_experience_id: null
      },
      orderBy: { created_at: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: {
        work_experiences: workExperiences,
        accomplishments: standaloneAccomplishments
      }
    });

  } catch (error: any) {
    console.error('Error fetching experience data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experience data' },
      { status: 500 }
    );
  }
}