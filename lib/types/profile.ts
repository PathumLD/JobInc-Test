// lib/types/profile.ts
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
  
  // Arrays - normalized field names
  work_experiences: WorkExperienceData[];
  educations: EducationData[];
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
