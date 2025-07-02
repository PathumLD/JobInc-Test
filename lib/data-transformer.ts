// lib/data-transformer.ts
import { ExtractedData } from './cv-extraction';

export interface UnifiedProfileData {
  // Basic Info - matching Candidate model exactly
  first_name: string;
  last_name: string;
  additional_name?: string;
  phone?: string;
  phone_type?: 'mobile' | 'home' | 'work' | 'other';
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  personal_website?: string;
  bio?: string;
  about?: string;
  title?: string;
  
  // Professional fields from Candidate model
  years_of_experience?: number;
  experience_level?: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
  current_position?: string;
  industry?: string;
  
  // Arrays - matching your database schema exactly
  work_experience: WorkExperienceData[];
  education: EducationData[];
  certificates: CertificateData[];
  projects: ProjectData[];
  awards: AwardData[];
  volunteering: VolunteeringData[];
  skills: string[];
  candidate_skills: CandidateSkillData[];
  accomplishments: AccomplishmentData[];
  
  // CV Documents
  cv_documents?: CVDocument[];
}

export interface WorkExperienceData {
  title: string;
  company: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance' | 'volunteer';
  is_current: boolean;
  start_date: string;
  end_date?: string;
  location?: string;
  description?: string;
  job_source?: string;
  skill_ids?: string[];
  media_url?: string;
}

// Fixed interface to match database schema exactly
export interface EducationData {
  degree_diploma: string;        // matches schema field
  university_school: string;     // matches schema field
  field_of_study?: string;       // matches schema field
  start_date: string;
  end_date?: string;
  grade?: string;                // matches schema field (not gpa)
  activities_societies?: string; // matches schema field
  skill_ids?: string[];
  media_url?: string;
}

export interface CertificateData {
  name: string;
  issuing_authority: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  description?: string;
  media_url?: string;
}

export interface ProjectData {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  role?: string;
  technologies?: string[];
  tools?: string[];
  methodologies?: string[];
  responsibilities?: string[];
  url?: string;
  repository_url?: string;
  media_urls?: string[];
  skills_gained?: string[];
  can_share_details?: boolean;
  is_confidential?: boolean;
}

export interface AwardData {
  title: string;
  offered_by: string;
  associated_with?: string;
  date: string;
  description?: string;
  media_url?: string;
  skill_ids?: string[];
}

// Fixed to match database schema - using 'institution' not 'organization'
export interface VolunteeringData {
  role: string;
  institution: string;           // matches schema field exactly
  cause?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  location?: string;
  media_url?: string;
}

export interface CandidateSkillData {
  skill_name: string;
  skill_source: string;
  proficiency: number;
}

export interface AccomplishmentData {
  title: string;
  description: string;
  work_experience_index?: number;
}

// Single, consistent CVDocument interface
export interface CVDocument {
  id?: string;
  resume_url: string;
  original_filename: string;
  file_size?: number;
  file_type?: string;
  is_primary?: boolean;
  is_allow_fetch?: boolean;
  uploaded_at: string;
}

export class DataTransformer {
  static normalizeExtractedData(extracted: ExtractedData): UnifiedProfileData {
    console.log('🔄 Starting data normalization...');
    console.log('📊 Extracted data structure:', {
      hasBasicInfo: !!extracted.basic_info,
      workExperiences: extracted.work_experiences?.length || 0,
      educations: extracted.educations?.length || 0,
      certificates: extracted.certificates?.length || 0,
      certifications: extracted.certifications?.length || 0,
      accomplishments: extracted.accomplishments?.length || 0,
    });
    
    const normalized: UnifiedProfileData = {
      // Basic Info Mapping - exact field names from Candidate model
      first_name: extracted.basic_info?.first_name || '',
      last_name: extracted.basic_info?.last_name || '',
      additional_name: extracted.basic_info?.additional_name || undefined,
      phone: extracted.basic_info?.phone || undefined,
      phone_type: extracted.basic_info?.phone_type || undefined,
      location: extracted.basic_info?.location || undefined,
      linkedin_url: extracted.basic_info?.linkedin_url || undefined,
      github_url: extracted.basic_info?.github_url || undefined,
      portfolio_url: extracted.basic_info?.portfolio_url || undefined,
      personal_website: extracted.basic_info?.personal_website || undefined,
      bio: extracted.basic_info?.bio || undefined,
      about: extracted.basic_info?.about || extracted.basic_info?.bio || undefined,
      title: extracted.basic_info?.title || undefined,
      years_of_experience: extracted.basic_info?.years_of_experience || undefined,
      current_position: extracted.basic_info?.current_position || undefined,
      industry: extracted.basic_info?.industry || undefined,
      
      // Work Experiences - exact mapping to WorkExperience model
      work_experience: (extracted.work_experiences || []).map(exp => ({
        title: exp.title || '',
        company: exp.company || '',
        employment_type: exp.employment_type || 'full_time',
        is_current: exp.is_current || false,
        start_date: exp.start_date || '',
        end_date: exp.end_date || undefined,
        location: exp.location || undefined,
        description: exp.description || undefined,
        job_source: undefined,
        skill_ids: [],
        media_url: undefined,
      })),
      
      // Education - exact field mapping to Education model
      education: (extracted.educations || []).map(edu => ({
        degree_diploma: edu.degree_diploma || '',
        university_school: edu.university_school || '',
        field_of_study: edu.field_of_study || undefined,
        start_date: edu.start_date || '',
        end_date: edu.end_date || undefined,
        grade: edu.grade || undefined,
        activities_societies: undefined,
        skill_ids: [],
        media_url: undefined,
      })),
      
      // Certificates - handle both possible field names from AI
      certificates: this.normalizeCertificates(extracted),
      
      // Projects - exact mapping to Project model
      projects: (extracted.projects || []).map(proj => ({
        name: proj.name || '',
        description: proj.description || undefined,
        start_date: proj.start_date || undefined,
        end_date: proj.end_date || undefined,
        is_current: false,
        technologies: proj.technologies || [],
        url: proj.url || undefined,
        repository_url: undefined,
        tools: [],
        methodologies: [],
        responsibilities: [],
        media_urls: [],
        skills_gained: [],
        can_share_details: true,
        is_confidential: false,
      })),
      
      // Awards - exact mapping to Award model
      awards: (extracted.awards || []).map(award => ({
        title: award.title || '',
        offered_by: award.offered_by || '',
        associated_with: award.associated_with || undefined,
        date: award.date || new Date().toISOString().split('T')[0],
        description: award.description || undefined,
        media_url: undefined,
        skill_ids: [],
      })),
      
      // Volunteering - exact mapping to Volunteering model (using 'institution' field)
      volunteering: (extracted.volunteering || []).map(vol => ({
        role: vol.role || '',
        institution: vol.organization || '', // Map 'organization' to 'institution'
        cause: vol.cause || undefined,
        start_date: vol.start_date || new Date().toISOString().split('T')[0],
        end_date: vol.end_date || undefined,
        is_current: vol.is_current || false,
        description: vol.description || undefined,
        location: vol.location || undefined,
        media_url: undefined,
      })),
      
      // Skills - simple string array for backward compatibility
      skills: [],
      
      // Candidate Skills - with proficiency data, exact mapping to CandidateSkill model
      candidate_skills: (extracted.skills || []).map(skill => ({
        skill_name: typeof skill === 'string' ? skill : skill.name || '',
        skill_source: 'cv_extraction',
        proficiency: typeof skill === 'object' && skill.proficiency ? skill.proficiency : 50,
      })).filter(skill => skill.skill_name),

      // Accomplishments - exact mapping to Accomplishment model
      accomplishments: (extracted.accomplishments || []).map(acc => ({
        title: acc.title || '',
        description: acc.description || '',
        work_experience_index: undefined,
      })),
      
      // CV Documents (will be added separately)
      cv_documents: [],
    };
    
    // Populate simple skills array from candidate_skills
    normalized.skills = normalized.candidate_skills.map(skill => skill.skill_name);
    
    console.log('✅ Data normalization complete:', {
      workExperiences: normalized.work_experience.length,
      educations: normalized.education.length,
      certificates: normalized.certificates.length,
      projects: normalized.projects.length,
      awards: normalized.awards.length,
      volunteering: normalized.volunteering.length,
      candidateSkills: normalized.candidate_skills.length,
      accomplishments: normalized.accomplishments.length,
    });
    
    return normalized;
  }
  
  private static normalizeCertificates(extracted: ExtractedData): CertificateData[] {
    const certificates: CertificateData[] = [];
    
    // Handle 'certificates' field
    if (extracted.certificates && Array.isArray(extracted.certificates)) {
      console.log('📜 Processing certificates array:', extracted.certificates.length);
      certificates.push(...extracted.certificates.map(cert => ({
        name: cert.name || '',
        issuing_authority: cert.issuing_authority || '',
        issue_date: cert.issue_date || undefined,
        expiry_date: cert.expiry_date || undefined,
        credential_id: cert.credential_id || undefined,
        credential_url: cert.credential_url || undefined,
        description: cert.description || undefined,
        media_url: cert.media_url || undefined,
      })));
    }
    
    // Handle 'certifications' field (alternative naming from some AI responses)
    if (extracted.certifications && Array.isArray(extracted.certifications)) {
      console.log('📜 Processing certifications array:', extracted.certifications.length);
      certificates.push(...extracted.certifications.map(cert => ({
        name: cert.name || cert.title || '',
        issuing_authority: cert.issuing_authority || cert.issuer || cert.organization || '',
        issue_date: cert.issue_date || cert.date || undefined,
        expiry_date: cert.expiry_date || undefined,
        credential_id: cert.credential_id || undefined,
        credential_url: cert.credential_url || undefined,
        description: cert.description || undefined,
        media_url: cert.media_url || undefined,
      })));
    }
    
    // Filter out empty certificates
    const validCertificates = certificates.filter(cert => cert.name && cert.issuing_authority);
    console.log('✅ Valid certificates:', validCertificates.length);
    
    return validCertificates;
  }
  
  static validateProfileData(data: UnifiedProfileData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Required field validation
    if (!data.first_name?.trim()) errors.push('First name is required');
    if (!data.last_name?.trim()) errors.push('Last name is required');
    
    // Work experience validation
    if (data.work_experience && Array.isArray(data.work_experience)) {
      data.work_experience.forEach((exp, index) => {
        if (!exp.title?.trim()) errors.push(`Work experience ${index + 1}: Title is required`);
        if (!exp.company?.trim()) errors.push(`Work experience ${index + 1}: Company is required`);
        if (!exp.start_date) errors.push(`Work experience ${index + 1}: Start date is required`);
      });
    }
    
    // Education validation - using correct field names
    if (data.education && Array.isArray(data.education)) {
      data.education.forEach((edu, index) => {
        if (!edu.degree_diploma?.trim()) errors.push(`Education ${index + 1}: Degree is required`);
        if (!edu.university_school?.trim()) errors.push(`Education ${index + 1}: Institution is required`);
      });
    }

    // Accomplishments validation
    if (data.accomplishments && Array.isArray(data.accomplishments)) {
      data.accomplishments.forEach((acc, index) => {
        if (!acc.title?.trim()) errors.push(`Accomplishment ${index + 1}: Title is required`);
        if (!acc.description?.trim()) errors.push(`Accomplishment ${index + 1}: Description is required`);
      });
    }
    
    // Volunteering validation - using correct field name
    if (data.volunteering && Array.isArray(data.volunteering)) {
      data.volunteering.forEach((vol, index) => {
        if (!vol.role?.trim()) errors.push(`Volunteering ${index + 1}: Role is required`);
        if (!vol.institution?.trim()) errors.push(`Volunteering ${index + 1}: Institution is required`);
      });
    }
    
    // Log validation results
    console.log('🔍 Validation results:', {
      isValid: errors.length === 0,
      errorCount: errors.length,
      errors: errors
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}