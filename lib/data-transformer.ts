// lib/data-transformer.ts
import { ExtractedData } from './cv-extraction';

export interface UnifiedProfileData {
  // Basic Info
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  personal_website?: string;
  bio?: string;
  about?: string;
  title?: string;
  
  // Professional
  years_of_experience?: number;
  experience_level?: string;
  current_position?: string;
  industry?: string;
  
  // Arrays - matching your form field names
  work_experience: WorkExperienceData[];
  education: EducationData[];
  certificates: CertificateData[];
  projects: ProjectData[];
  awards: AwardData[];
  volunteering: VolunteeringData[];
  skills: string[];
  
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
}

export interface EducationData {
  degree: string;
  institution: string;
  field_of_study?: string;
  start_date: string;
  end_date?: string;
  gpa?: string;
  description?: string;
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

export interface VolunteeringData {
  role: string;
  institution: string;
  cause?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  media_url?: string;
}

export interface CVDocument {
  id?: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  file_url?: string;
  file_data?: string;
  uploaded_at: string;
  is_primary: boolean;
}

export class DataTransformer {
  static normalizeExtractedData(extracted: ExtractedData): UnifiedProfileData {
    console.log('🔄 Starting data normalization...');
    
    const normalized: UnifiedProfileData = {
      // Basic Info Mapping
      first_name: extracted.basic_info?.first_name || '',
      last_name: extracted.basic_info?.last_name || '',
      email: extracted.basic_info?.email || '',
      phone: extracted.basic_info?.phone || undefined,
      location: extracted.basic_info?.location || undefined,
      linkedin_url: extracted.basic_info?.linkedin_url || undefined,
      github_url: extracted.basic_info?.github_url || undefined,
      portfolio_url: extracted.basic_info?.portfolio_url || undefined,
      personal_website: extracted.basic_info?.personal_website || undefined,
      bio: extracted.basic_info?.bio || undefined,
      about: extracted.basic_info?.about || undefined,
      title: extracted.basic_info?.title || undefined,
      years_of_experience: extracted.basic_info?.years_of_experience || undefined,
      current_position: extracted.basic_info?.current_position || undefined,
      industry: extracted.basic_info?.industry || undefined,
      
      // Work Experiences - FIXED: Use 'work_experience' to match form field
      work_experience: (extracted.work_experiences || []).map(exp => ({
        title: exp.title || '',
        company: exp.company || '',
        employment_type: exp.employment_type || 'full_time',
        is_current: exp.is_current || false,
        start_date: exp.start_date || '',
        end_date: exp.end_date || undefined,
        location: exp.location || undefined,
        description: exp.description || undefined,
      })),
      
      // Education - FIXED: Use 'education' to match form field
      education: (extracted.educations || []).map(edu => ({
        degree: edu.degree_diploma || '',
        institution: edu.university_school || '',
        field_of_study: edu.field_of_study || undefined,
        start_date: edu.start_date || '',
        end_date: edu.end_date || undefined,
        gpa: edu.grade || undefined,
        description: undefined,
      })),
      
      // Certificates - handle both possible field names
      certificates: this.normalizeCertificates(extracted),
      
      // Projects
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
      
      // Awards
      awards: (extracted.awards || []).map(award => ({
        title: award.title || '',
        offered_by: award.offered_by || '',
        associated_with: award.associated_with || undefined,
        date: award.date || '',
        description: award.description || undefined,
        skill_ids: [],
      })),
      
      // Volunteering
      volunteering: (extracted.volunteering || []).map(vol => ({
        role: vol.role || '',
        institution: vol.organization || '',
        cause: vol.cause || undefined,
        start_date: vol.start_date || '',
        end_date: vol.end_date || undefined,
        is_current: vol.is_current || false,
        description: vol.description || undefined,
      })),
      
      // Skills
      skills: (extracted.skills || []).map(skill => 
        typeof skill === 'string' ? skill : skill.name || ''
      ).filter(Boolean),
      
      // CV Documents (will be added separately)
      cv_documents: [],
    };
    
    console.log('✅ Data normalization complete');
    return normalized;
  }
  
  private static normalizeCertificates(extracted: ExtractedData): CertificateData[] {
    const certificates: CertificateData[] = [];
    
    // Handle 'certificates' field
    if (extracted.certificates) {
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
    
    // Handle 'certifications' field (alternative naming)
    if (extracted.certifications) {
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
    
    return certificates.filter(cert => cert.name && cert.issuing_authority);
  }
  
  static validateProfileData(data: UnifiedProfileData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Required field validation
    if (!data.first_name?.trim()) errors.push('First name is required');
    if (!data.last_name?.trim()) errors.push('Last name is required');
    
    // Email validation (if provided)
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    }
    
    // Work experience validation - FIXED: Check if array exists
    if (data.work_experience && Array.isArray(data.work_experience)) {
      data.work_experience.forEach((exp, index) => {
        if (!exp.title?.trim()) errors.push(`Work experience ${index + 1}: Title is required`);
        if (!exp.company?.trim()) errors.push(`Work experience ${index + 1}: Company is required`);
      });
    }
    
    // Education validation - FIXED: Check if array exists
    if (data.education && Array.isArray(data.education)) {
      data.education.forEach((edu, index) => {
        if (!edu.degree?.trim()) errors.push(`Education ${index + 1}: Degree is required`);
        if (!edu.institution?.trim()) errors.push(`Education ${index + 1}: Institution is required`);
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
