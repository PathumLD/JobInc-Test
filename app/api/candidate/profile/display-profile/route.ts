// app/api/candidate/profile/display-profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateToken } from '@/lib/auth';

// Enhanced interface for complete profile display
interface CompleteProfileData {
  candidate: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    additional_name: string | null;
    title: string | null;
    current_position: string | null;
    industry: string | null;
    bio: string | null;
    about: string | null;
    location: string | null;
    phone: string | null;
    phone_type: string | null;
    personal_website: string | null;
    github_url: string | null;
    linkedin_url: string | null;
    portfolio_url: string | null;
    years_of_experience: number | null;
    experience_level: string | null;
    availability_status: string | null;
    availability_date: Date | null;
    resume_url: string | null;
    profile_completion_percentage: number | null;
    created_at: Date | null;
    updated_at: Date | null;
  };
  work_experiences: Array<{
    id: string;
    title: string | null;
    company: string | null;
    employment_type: string | null;
    is_current: boolean | null;
    start_date: Date | null;
    end_date: Date | null;
    location: string | null;
    description: string | null;
    accomplishments: Array<{
      id: string;
      title: string | null;
      description: string | null;
    }>;
  }>;
  education: Array<{
    id: string;
    degree_diploma: string | null;
    university_school: string | null;
    field_of_study: string | null;
    start_date: Date | null;
    end_date: Date | null;
    grade: string | null;
    activities_societies: string | null;
  }>;
  skills: Array<{
    id: string;
    skill_name: string;
    category: string | null;
    proficiency: number | null;
    years_of_experience: number | null;
    skill_source: string | null;
    source_title: string | null;
    source_company: string | null;
    source_institution: string | null;
    source_authority: string | null;
    source_type: string | null;
  }>;
  projects: Array<{
    id: string;
    name: string | null;
    description: string | null;
    start_date: Date | null;
    end_date: Date | null;
    is_current: boolean | null;
    role: string | null;
    responsibilities: string[];
    technologies: string[];
    tools: string[];
    methodologies: string[];
    url: string | null;
    repository_url: string | null;
    media_urls: string[];
    skills_gained: string[];
    can_share_details: boolean | null;
    is_confidential: boolean | null;
  }>;
  certificates: Array<{
    id: string;
    name: string | null;
    issuing_authority: string | null;
    issue_date: Date | null;
    expiry_date: Date | null;
    credential_id: string | null;
    credential_url: string | null;
    description: string | null;
    media_url: string | null;
  }>;
  awards: Array<{
    id: string;
    title: string | null;
    offered_by: string | null;
    associated_with: string | null;
    date: Date | null;
    description: string | null;
    media_url: string | null;
    skill_ids: string[];
  }>;
  volunteering: Array<{
    id: string;
    role: string | null;
    institution: string | null;
    cause: string | null;
    start_date: Date | null;
    end_date: Date | null;
    is_current: boolean | null;
    description: string | null;
    media_url: string | null;
  }>;
  cv_documents: Array<{
    id: string;
    resume_url: string | null;
    original_filename: string | null;
    file_size: number | null;
    file_type: string | null;
    is_primary: boolean | null;
    is_allow_fetch: boolean | null;
    uploaded_at: Date | null;
  }>;
  languages: Array<{
    id: string;
    language: string | null;
    is_native: boolean | null;
    oral_proficiency: string | null;
    written_proficiency: string | null;
  }>;
  profile_stats: {
    completion_percentage: number;
    total_experience_years: number;
    skills_count: number;
    projects_count: number;
    certificates_count: number;
    awards_count: number;
    education_count: number;
    work_experience_count: number;
    volunteering_count: number;
    languages_count: number;
    missing_sections: string[];
    last_updated: Date | null;
  };
}

// Helper function to calculate profile completion percentage
function calculateProfileCompletion(data: any): number {
  let totalSections = 10; // Total possible sections
  let completedSections = 0;
  
  // Check each section for completeness
  if (data.candidate.first_name && data.candidate.last_name && data.candidate.title) {
    completedSections += 1; // Basic info
  }
  
  if (data.candidate.about && data.candidate.about.length > 50) {
    completedSections += 1; // About section
  }
  
  if (data.work_experiences && data.work_experiences.length > 0) {
    completedSections += 1; // Work experience
  }
  
  if (data.education && data.education.length > 0) {
    completedSections += 1; // Education
  }
  
  if (data.skills && data.skills.length >= 3) {
    completedSections += 1; // Skills (minimum 3)
  }
  
  if (data.projects && data.projects.length > 0) {
    completedSections += 1; // Projects
  }
  
  if (data.certificates && data.certificates.length > 0) {
    completedSections += 1; // Certificates
  }
  
  if (data.awards && data.awards.length > 0) {
    completedSections += 1; // Awards
  }
  
  if (data.volunteering && data.volunteering.length > 0) {
    completedSections += 1; // Volunteering
  }
  
  if (data.cv_documents && data.cv_documents.length > 0) {
    completedSections += 1; // CV Documents
  }
  
  return Math.round((completedSections / totalSections) * 100);
}

// Helper function to calculate total years of experience
function calculateTotalExperience(workExperiences: any[]): number {
  if (!workExperiences || workExperiences.length === 0) return 0;
  
  let totalMonths = 0;
  
  for (const exp of workExperiences) {
    if (exp.start_date) {
      const startDate = new Date(exp.start_date);
      const endDate = exp.end_date ? new Date(exp.end_date) : new Date();
      
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                     (endDate.getMonth() - startDate.getMonth());
      totalMonths += Math.max(0, months);
    }
  }
  
  return Math.round((totalMonths / 12) * 10) / 10; // Round to 1 decimal place
}

// Helper function to identify missing sections
function identifyMissingSections(data: any): string[] {
  const missing: string[] = [];
  
  if (!data.candidate.about || data.candidate.about.length < 50) {
    missing.push('About');
  }
  
  if (!data.work_experiences || data.work_experiences.length === 0) {
    missing.push('Work Experience');
  }
  
  if (!data.education || data.education.length === 0) {
    missing.push('Education');
  }
  
  if (!data.skills || data.skills.length < 3) {
    missing.push('Skills');
  }
  
  if (!data.cv_documents || data.cv_documents.length === 0) {
    missing.push('Resume/CV');
  }
  
  return missing;
}

export async function GET(request: NextRequest) {
  console.log('=== Enhanced Display Profile API Called ===');
  
  try {
    // Validate token and get userId
    const userId = await validateToken(request);
    
    if (!userId) {
      console.log('Token validation failed - no userId returned');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('Token validated successfully, userId:', userId);

    // Comprehensive profile data query with all relationships
    let profileData;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        console.log(`Database query attempt ${retryCount + 1}`);
        
        profileData = await prisma.candidate.findUnique({
          where: { user_id: userId },
          include: {
            // Work experiences with accomplishments
            work_experiences: {
              include: {
                accomplishments: {
                  select: {
                    id: true,
                    title: true,
                    description: true,
                  }
                }
              },
              orderBy: [
                { is_current: 'desc' },
                { start_date: 'desc' }
              ]
            },
            
            // Education records
            educations: {
              orderBy: [
                { end_date: 'desc' },
                { start_date: 'desc' }
              ]
            },
            
            // Skills with detailed information
            skills: {
              include: {
                skill: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                    description: true,
                  }
                }
              },
              orderBy: [
                { proficiency: 'desc' },
                { years_of_experience: 'desc' }
              ]
            },
            
            // Projects
            projects: {
              orderBy: [
                { is_current: 'desc' },
                { start_date: 'desc' }
              ]
            },
            
            // Certificates
            certificates: {
              orderBy: [
                { issue_date: 'desc' }
              ]
            },
            
            // Awards
            awards: {
              orderBy: [
                { date: 'desc' }
              ]
            },
            
            // Volunteering
            volunteering: {
              orderBy: [
                { is_current: 'desc' },
                { start_date: 'desc' }
              ]
            },
            
            // CV Documents/Resumes
            resumes: {
              orderBy: [
                { is_primary: 'desc' },
                { uploaded_at: 'desc' }
              ]
            },
            
            // Languages
            languages: {
              orderBy: [
                { is_native: 'desc' },
                { language: 'asc' }
              ]
            }
          }
        });
        
        console.log('Database query successful:', profileData ? 'Profile found' : 'No profile found');
        break; // Success, exit retry loop
        
      } catch (dbError: any) {
        console.error(`Database query error (attempt ${retryCount + 1}):`, dbError);
        
        if (dbError.message.includes('prepared statement') && retryCount < maxRetries) {
          console.log('Prepared statement error detected, retrying with fresh connection...');
          
          // Disconnect and reconnect
          await prisma.$disconnect();
          await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
          
          retryCount++;
          continue;
        } else {
          // If it's not a prepared statement error or we've exceeded retries, throw the error
          throw dbError;
        }
      }
    }

    // If no profile found, return appropriate response
    if (!profileData) {
      console.log('No candidate profile found for userId:', userId);
      return NextResponse.json({
        success: false,
        error: 'Profile not found',
        message: 'No candidate profile exists for this user.'
      }, { status: 404 });
    }

    // Transform the data for the response - STEP 1: Build basic data first
    const basicTransformedData = {
      candidate: {
        user_id: profileData.user_id,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        additional_name: profileData.additional_name,
        title: profileData.title,
        current_position: profileData.current_position,
        industry: profileData.industry,
        bio: profileData.bio,
        about: profileData.about,
        location: profileData.location,
        phone: profileData.phone,
        phone_type: profileData.phone_type,
        personal_website: profileData.personal_website,
        github_url: profileData.github_url,
        linkedin_url: profileData.linkedin_url,
        portfolio_url: profileData.portfolio_url,
        years_of_experience: profileData.years_of_experience,
        experience_level: profileData.experience_level,
        availability_status: profileData.availability_status,
        availability_date: profileData.availability_date,
        resume_url: profileData.resume_url,
        profile_completion_percentage: profileData.profile_completion_percentage,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at,
      },
      
      work_experiences: profileData.work_experiences.map(exp => ({
        id: exp.id,
        title: exp.title,
        company: exp.company,
        employment_type: exp.employment_type,
        is_current: exp.is_current,
        start_date: exp.start_date,
        end_date: exp.end_date,
        location: exp.location,
        description: exp.description,
        accomplishments: exp.accomplishments.map(acc => ({
          id: acc.id,
          title: acc.title,
          description: acc.description,
        }))
      })),
      
      education: profileData.educations.map(edu => ({
        id: edu.id,
        degree_diploma: edu.degree_diploma,
        university_school: edu.university_school,
        field_of_study: edu.field_of_study,
        start_date: edu.start_date,
        end_date: edu.end_date,
        grade: edu.grade,
        activities_societies: edu.activities_societies,
      })),
      
      skills: profileData.skills.map(candidateSkill => ({
        id: candidateSkill.id,
        skill_name: candidateSkill.skill.name,
        category: candidateSkill.skill.category,
        proficiency: candidateSkill.proficiency,
        years_of_experience: candidateSkill.years_of_experience,
        skill_source: candidateSkill.skill_source,
        source_title: candidateSkill.source_title,
        source_company: candidateSkill.source_company,
        source_institution: candidateSkill.source_institution,
        source_authority: candidateSkill.source_authority,
        source_type: candidateSkill.source_type,
      })),
      
      projects: profileData.projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        start_date: project.start_date,
        end_date: project.end_date,
        is_current: project.is_current,
        role: project.role,
        responsibilities: project.responsibilities || [],
        technologies: project.technologies || [],
        tools: project.tools || [],
        methodologies: project.methodologies || [],
        url: project.url,
        repository_url: project.repository_url,
        media_urls: project.media_urls || [],
        skills_gained: project.skills_gained || [],
        can_share_details: project.can_share_details,
        is_confidential: project.is_confidential,
      })),
      
      certificates: profileData.certificates.map(cert => ({
        id: cert.id,
        name: cert.name,
        issuing_authority: cert.issuing_authority,
        issue_date: cert.issue_date,
        expiry_date: cert.expiry_date,
        credential_id: cert.credential_id,
        credential_url: cert.credential_url,
        description: cert.description,
        media_url: cert.media_url,
      })),
      
      awards: profileData.awards.map(award => ({
        id: award.id,
        title: award.title,
        offered_by: award.offered_by,
        associated_with: award.associated_with,
        date: award.date,
        description: award.description,
        media_url: award.media_url,
        skill_ids: award.skill_ids || [],
      })),
      
      volunteering: profileData.volunteering.map(vol => ({
        id: vol.id,
        role: vol.role,
        institution: vol.institution,
        cause: vol.cause,
        start_date: vol.start_date,
        end_date: vol.end_date,
        is_current: vol.is_current,
        description: vol.description,
        media_url: vol.media_url,
      })),
      
      cv_documents: profileData.resumes.map(resume => ({
        id: resume.id,
        resume_url: resume.resume_url,
        original_filename: resume.original_filename,
        file_size: resume.file_size,
        file_type: resume.file_type,
        is_primary: resume.is_primary,
        is_allow_fetch: resume.is_allow_fetch,
        uploaded_at: resume.uploaded_at,
      })),
      
      languages: profileData.languages.map(lang => ({
        id: lang.id,
        language: lang.language,
        is_native: lang.is_native,
        oral_proficiency: lang.oral_proficiency,
        written_proficiency: lang.written_proficiency,
      }))
    };

    // STEP 2: Calculate profile stats using the basic data
    const profileStats = {
      completion_percentage: calculateProfileCompletion(basicTransformedData),
      total_experience_years: calculateTotalExperience(basicTransformedData.work_experiences),
      skills_count: basicTransformedData.skills.length,
      projects_count: basicTransformedData.projects.length,
      certificates_count: basicTransformedData.certificates.length,
      awards_count: basicTransformedData.awards.length,
      education_count: basicTransformedData.education.length,
      work_experience_count: basicTransformedData.work_experiences.length,
      volunteering_count: basicTransformedData.volunteering.length,
      languages_count: basicTransformedData.languages.length,
      missing_sections: identifyMissingSections(basicTransformedData),
      last_updated: profileData.updated_at,
    };

    // STEP 3: Create the final transformed data with profile stats
    const transformedData: CompleteProfileData = {
      ...basicTransformedData,
      profile_stats: profileStats
    };

    console.log('Profile data transformation completed successfully');
    console.log('Profile stats:', transformedData.profile_stats);

    return NextResponse.json({
      success: true,
      data: transformedData,
    });

  } catch (error: any) {
    console.error('API Error:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Database constraint violation' },
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
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}