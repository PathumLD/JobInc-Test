// app/api/candidate/profile/edit/basic-info/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { validateToken } from '@/lib/auth';
import { BasicInfoFormData } from '@/lib/types/candidate/profile/edit-profile';

// Define the expected JWT payload type
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

// Helper function to validate enum values
function validateEnumValue(value: string | undefined, validValues: string[]): boolean {
  if (!value) return true; // Allow undefined/null values
  return validValues.includes(value);
}

// Helper function to validate and sanitize data
function validateAndSanitizeData(data: BasicInfoFormData): { 
  isValid: boolean; 
  errors: string[]; 
  sanitizedData: any;
} {
  const errors: string[] = [];
  const sanitizedData: any = {};

  // Personal Information validation
  if (data.first_name !== undefined) {
    if (!data.first_name?.trim()) {
      errors.push('First name is required');
    } else if (data.first_name.length > 100) {
      errors.push('First name must be less than 100 characters');
    } else {
      sanitizedData.first_name = data.first_name.trim();
    }
  }

  if (data.last_name !== undefined) {
    if (!data.last_name?.trim()) {
      errors.push('Last name is required');
    } else if (data.last_name.length > 100) {
      errors.push('Last name must be less than 100 characters');
    } else {
      sanitizedData.last_name = data.last_name.trim();
    }
  }

  if (data.additional_name !== undefined) {
    sanitizedData.additional_name = data.additional_name?.trim() || null;
  }

  if (data.gender !== undefined) {
    const validGenders = ['male', 'female', 'other', 'prefer_not_to_say'];
    if (!validateEnumValue(data.gender, validGenders)) {
      errors.push('Invalid gender value');
    } else {
      sanitizedData.gender = data.gender || null;
    }
  }

  if (data.date_of_birth !== undefined) {
    if (data.date_of_birth) {
      const birthDate = new Date(data.date_of_birth);
      if (isNaN(birthDate.getTime())) {
        errors.push('Invalid date of birth');
      } else if (birthDate > new Date()) {
        errors.push('Date of birth cannot be in the future');
      } else {
        sanitizedData.date_of_birth = birthDate;
      }
    } else {
      sanitizedData.date_of_birth = null;
    }
  }

  if (data.pronouns !== undefined) {
    sanitizedData.pronouns = data.pronouns?.trim() || null;
  }

  // Professional Information
  if (data.title !== undefined) {
    sanitizedData.title = data.title?.trim() || null;
  }

  if (data.current_position !== undefined) {
    sanitizedData.current_position = data.current_position?.trim() || null;
  }

  if (data.industry !== undefined) {
    sanitizedData.industry = data.industry?.trim() || null;
  }

  if (data.bio !== undefined) {
    sanitizedData.bio = data.bio?.trim() || null;
  }

  if (data.professional_summary !== undefined) {
    sanitizedData.professional_summary = data.professional_summary?.trim() || null;
  }

  // Location Information
  if (data.country !== undefined) {
    sanitizedData.country = data.country?.trim() || null;
  }

  if (data.city !== undefined) {
    sanitizedData.city = data.city?.trim() || null;
  }

  if (data.location !== undefined) {
    sanitizedData.location = data.location?.trim() || null;
  }

  if (data.address !== undefined) {
    sanitizedData.address = data.address?.trim() || null;
  }

  // Contact Information with URL validation
  if (data.phone1 !== undefined) {
    sanitizedData.phone1 = data.phone1?.trim() || null;
  }

  if (data.phone2 !== undefined) {
    sanitizedData.phone2 = data.phone2?.trim() || null;
  }

  // URL validations
  const urlFields = ['personal_website', 'portfolio_url', 'github_url', 'linkedin_url'];
  urlFields.forEach(field => {
    if (data[field as keyof BasicInfoFormData] !== undefined) {
      const url = data[field as keyof BasicInfoFormData] as string;
      if (url && url.trim()) {
        try {
          new URL(url.trim());
          sanitizedData[field] = url.trim();
        } catch {
          errors.push(`Invalid ${field.replace('_', ' ')} URL`);
        }
      } else {
        sanitizedData[field] = null;
      }
    }
  });

  // Experience & Availability
  if (data.experience_level !== undefined) {
    const validLevels = ['entry', 'junior', 'mid', 'senior', 'lead', 'principal'];
    if (!validateEnumValue(data.experience_level, validLevels)) {
      errors.push('Invalid experience level');
    } else {
      sanitizedData.experience_level = data.experience_level || null;
    }
  }

  if (data.years_of_experience !== undefined) {
    if (data.years_of_experience < 0 || data.years_of_experience > 50) {
      errors.push('Years of experience must be between 0 and 50');
    } else {
      sanitizedData.years_of_experience = data.years_of_experience;
    }
  }

  if (data.availability_status !== undefined) {
    const validStatuses = ['available', 'open_to_opportunities', 'not_looking'];
    if (!validateEnumValue(data.availability_status, validStatuses)) {
      errors.push('Invalid availability status');
    } else {
      sanitizedData.availability_status = data.availability_status || null;
    }
  }

  if (data.availability_date !== undefined) {
    if (data.availability_date) {
      const availDate = new Date(data.availability_date);
      if (isNaN(availDate.getTime())) {
        errors.push('Invalid availability date');
      } else {
        sanitizedData.availability_date = availDate;
      }
    } else {
      sanitizedData.availability_date = null;
    }
  }

  // Work Preferences
  if (data.remote_preference !== undefined) {
    const validPreferences = ['remote_only', 'hybrid', 'onsite', 'flexible'];
    if (!validateEnumValue(data.remote_preference, validPreferences)) {
      errors.push('Invalid remote preference');
    } else {
      sanitizedData.remote_preference = data.remote_preference || null;
    }
  }

  if (data.work_availability !== undefined) {
    const validAvailability = ['full_time', 'part_time', 'contract', 'freelance', 'internship', 'volunteer'];
    if (!validateEnumValue(data.work_availability, validAvailability)) {
      errors.push('Invalid work availability');
    } else {
      sanitizedData.work_availability = data.work_availability || null;
    }
  }

  if (data.notice_period !== undefined) {
    if (data.notice_period < 0 || data.notice_period > 365) {
      errors.push('Notice period must be between 0 and 365 days');
    } else {
      sanitizedData.notice_period = data.notice_period;
    }
  }

  // Boolean fields
  const booleanFields = [
    'open_to_relocation', 'willing_to_travel', 'visa_assistance_needed', 
    'security_clearance', 'interview_ready', 'pre_qualified'
  ];
  booleanFields.forEach(field => {
    if (data[field as keyof BasicInfoFormData] !== undefined) {
      sanitizedData[field] = Boolean(data[field as keyof BasicInfoFormData]);
    }
  });

  // Salary & Compensation
  if (data.expected_salary_min !== undefined) {
    if (data.expected_salary_min < 0) {
      errors.push('Minimum salary cannot be negative');
    } else {
      sanitizedData.expected_salary_min = data.expected_salary_min;
    }
  }

  if (data.expected_salary_max !== undefined) {
    if (data.expected_salary_max < 0) {
      errors.push('Maximum salary cannot be negative');
    } else {
      sanitizedData.expected_salary_max = data.expected_salary_max;
    }
  }

  // Validate salary range
  if (sanitizedData.expected_salary_min && sanitizedData.expected_salary_max) {
    if (sanitizedData.expected_salary_min > sanitizedData.expected_salary_max) {
      errors.push('Minimum salary cannot be greater than maximum salary');
    }
  }

  if (data.currency !== undefined) {
    sanitizedData.currency = data.currency?.trim() || 'USD';
  }

  if (data.salary_visibility !== undefined) {
    const validVisibility = ['confidential', 'range_only', 'exact', 'negotiable'];
    if (!validateEnumValue(data.salary_visibility, validVisibility)) {
      errors.push('Invalid salary visibility');
    } else {
      sanitizedData.salary_visibility = data.salary_visibility || null;
    }
  }

  // Legal & Documentation
  if (data.nic !== undefined) {
    sanitizedData.nic = data.nic?.trim() || null;
  }

  if (data.passport !== undefined) {
    sanitizedData.passport = data.passport?.trim() || null;
  }

  if (data.work_authorization !== undefined) {
    const validAuth = ['citizen', 'permanent_resident', 'work_visa', 'requires_sponsorship', 'other'];
    if (!validateEnumValue(data.work_authorization, validAuth)) {
      errors.push('Invalid work authorization');
    } else {
      sanitizedData.work_authorization = data.work_authorization || null;
    }
  }

  // Diversity & Inclusion
  if (data.disability_status !== undefined) {
    sanitizedData.disability_status = data.disability_status?.trim() || null;
  }

  if (data.veteran_status !== undefined) {
    sanitizedData.veteran_status = data.veteran_status?.trim() || null;
  }

  // AI & Skills Scores (0-100 range)
  const scoreFields = [
    'ai_collaboration_score', 'prompting_skill_score', 
    'workflow_automation_score', 'overall_ai_readiness_score'
  ];
  scoreFields.forEach(field => {
    if (data[field as keyof BasicInfoFormData] !== undefined) {
      const score = data[field as keyof BasicInfoFormData] as number;
      if (score < 0 || score > 100) {
        errors.push(`${field.replace('_', ' ')} must be between 0 and 100`);
      } else {
        sanitizedData[field] = score;
      }
    }
  });

  // Handle profile image URL (if present) - ✅ Now stays in candidate table
  if (data.profile_image_url !== undefined) {
    sanitizedData.profile_image_url = data.profile_image_url?.trim() || null;
  }

  // Add updated timestamp
  sanitizedData.updated_at = new Date();

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}

export async function PUT(request: NextRequest) {
  console.log('=== Basic Info Update API Called ===');
  
  try {
    // 1. Validate token and get userId
    const userId = await validateToken(request);
    
    if (!userId) {
      console.log(' Token validation failed');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log(' Token validated for userId:', userId);

    // 2. Parse request body
    const requestData: BasicInfoFormData = await request.json();
    console.log(' Update request received for fields:', Object.keys(requestData));

    // 3. Validate and sanitize the data
    const { isValid, errors, sanitizedData } = validateAndSanitizeData(requestData);
    
    if (!isValid) {
      console.log(' Validation failed:', errors);
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: errors 
        },
        { status: 400 }
      );
    }

    console.log(' Data validation passed');

    // 4. Check if candidate exists
    const existingCandidate = await prisma.candidate.findUnique({
      where: { user_id: userId }
    });

    if (!existingCandidate) {
      console.log(' Candidate profile not found');
      return NextResponse.json(
        { error: 'Candidate profile not found' },
        { status: 404 }
      );
    }

    // 5. Update the candidate record (including profile_image_url if provided)
    console.log(' Updating candidate basic info...');
    
    const updatedCandidate = await prisma.candidate.update({
      where: { user_id: userId },
      data: sanitizedData
    });

    console.log(' Basic info updated successfully');

    // 6. Calculate and update profile completion percentage
    const completionData = {
      basic_info: !!(updatedCandidate.first_name && updatedCandidate.last_name && updatedCandidate.title),
      contact_info: !!(updatedCandidate.phone1 || updatedCandidate.linkedin_url),
      location_info: !!updatedCandidate.location,
      professional_info: !!(updatedCandidate.bio || updatedCandidate.professional_summary),
      experience_info: !!(updatedCandidate.years_of_experience && updatedCandidate.experience_level),
    };

    const completedSections = Object.values(completionData).filter(Boolean).length;
    const totalSections = Object.keys(completionData).length;
    const newCompletionPercentage = Math.round((completedSections / totalSections) * 100);

    // Update completion percentage if it changed
    if (newCompletionPercentage !== updatedCandidate.profile_completion_percentage) {
      await prisma.candidate.update({
        where: { user_id: userId },
        data: { profile_completion_percentage: newCompletionPercentage }
      });
      console.log(` Profile completion updated to ${newCompletionPercentage}%`);
    }

    // 7. Prepare response data
    const responseData = {
      user_id: updatedCandidate.user_id,
      first_name: updatedCandidate.first_name,
      last_name: updatedCandidate.last_name,
      title: updatedCandidate.title,
      profile_completion_percentage: newCompletionPercentage,
      updated_at: updatedCandidate.updated_at,
      updated_fields: Object.keys(sanitizedData)
    };

    return NextResponse.json({
      success: true,
      message: 'Basic information updated successfully',
      data: responseData
    });

  } catch (error: any) {
    console.error(' Basic info update error:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Duplicate value for unique field' },
        { status: 400 }
      );
    } else if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Candidate profile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update basic information',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// GET method to fetch current basic info
export async function GET(request: NextRequest) {
  console.log('=== Basic Info Fetch API Called ===');
  
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

    const candidate = await prisma.candidate.findUnique({
      where: { user_id: payload.userId },
      select: {
        // Personal Information
        first_name: true,
        last_name: true,
        additional_name: true,
        gender: true,
        date_of_birth: true,
        pronouns: true,
        
        // Professional Information
        title: true,
        current_position: true,
        industry: true,
        bio: true,
        professional_summary: true,
        
        // Location Information
        country: true,
        city: true,
        location: true,
        address: true,
        
        // Contact Information
        phone1: true,
        phone2: true,
        personal_website: true,
        portfolio_url: true,
        github_url: true,
        linkedin_url: true,
        
        // Experience & Availability
        experience_level: true,
        years_of_experience: true,
        total_years_experience: true,
        availability_status: true,
        availability_date: true,
        
        // Work Preferences
        remote_preference: true,
        work_availability: true,
        notice_period: true,
        open_to_relocation: true,
        willing_to_travel: true,
        
        // Salary & Compensation
        expected_salary_min: true,
        expected_salary_max: true,
        currency: true,
        salary_visibility: true,
        
        // Legal & Documentation
        nic: true,
        passport: true,
        work_authorization: true,
        visa_assistance_needed: true,
        security_clearance: true,
        
        // Diversity & Inclusion
        disability_status: true,
        veteran_status: true,
        
        // AI & Skills Scores
        ai_collaboration_score: true,
        prompting_skill_score: true,
        workflow_automation_score: true,
        overall_ai_readiness_score: true,
        
        // Profile Status
        interview_ready: true,
        pre_qualified: true,
        profile_completion_percentage: true,
        
        // Profile Image - ✅ Now from candidate table
        profile_image_url: true,
        
        // Timestamps
        created_at: true,
        updated_at: true
      }
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: candidate
    });

  } catch (error: any) {
    console.error('Error fetching basic info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch basic information' },
      { status: 500 }
    );
  }
}