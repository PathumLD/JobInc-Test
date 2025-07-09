// lib/types/candidate/profile/profile-display.ts

// Complete profile data interface for display
export interface CompleteProfileData {
  candidate: CandidateDisplayData;
  work_experiences: WorkExperienceDisplayData[];
  education: EducationDisplayData[];
  skills: SkillDisplayData[];
  projects: ProjectDisplayData[];
  certificates: CertificateDisplayData[];
  awards: AwardDisplayData[];
  volunteering: VolunteeringDisplayData[];
  cv_documents: CVDocumentDisplayData[];
  languages: LanguageDisplayData[];
  profile_stats: ProfileStatsData;
}

// Candidate basic information for display
export interface CandidateDisplayData {
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
  phone1: string | null;
  phone2: string | null;
  personal_website: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  years_of_experience: number | null;
  experience_level: string | null;
  availability_status: string | null;
  availability_date: Date | null;
  resume_url: string | null;
  profile_image_url: string | null;
  profile_completion_percentage: number | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// Work experience data for display
export interface WorkExperienceDisplayData {
  id: string;
  title: string | null;
  company: string | null;
  employment_type: string | null;
  is_current: boolean | null;
  start_date: Date | null;
  end_date: Date | null;
  location: string | null;
  description: string | null;
  accomplishments: AccomplishmentDisplayData[];
}

// Accomplishment data nested in work experience
export interface AccomplishmentDisplayData {
  id: string;
  title: string | null;
  description: string | null;
}

// Education data for display
export interface EducationDisplayData {
  id: string;
  degree_diploma: string | null;
  university_school: string | null;
  field_of_study: string | null;
  start_date: Date | null;
  end_date: Date | null;
  grade: string | null;
  activities_societies: string | null;
}

// Skill data with enhanced information for display
export interface SkillDisplayData {
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
}

// Project data for display
export interface ProjectDisplayData {
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
}

// Certificate data for display
export interface CertificateDisplayData {
  id: string;
  name: string | null;
  issuing_authority: string | null;
  issue_date: Date | null;
  expiry_date: Date | null;
  credential_id: string | null;
  credential_url: string | null;
  description: string | null;
  media_url: string | null;
}

// Award data for display
export interface AwardDisplayData {
  id: string;
  title: string | null;
  offered_by: string | null;
  associated_with: string | null;
  date: Date | null;
  description: string | null;
  media_url: string | null;
  skill_ids: string[];
}

// Volunteering data for display
export interface VolunteeringDisplayData {
  id: string;
  role: string | null;
  institution: string | null;
  cause: string | null;
  start_date: Date | null;
  end_date: Date | null;
  is_current: boolean | null;
  description: string | null;
  media_url: string | null;
}

// CV/Resume document data for display
export interface CVDocumentDisplayData {
  id: string;
  resume_url: string | null;
  original_filename: string | null;
  file_size: number | null;
  file_type: string | null;
  is_primary: boolean | null;
  is_allow_fetch: boolean | null;
  uploaded_at: Date | null;
}

// Language data for display
export interface LanguageDisplayData {
  id: string;
  language: string | null;
  is_native: boolean | null;
  oral_proficiency: string | null;
  written_proficiency: string | null;
}

// Profile statistics and completion data
export interface ProfileStatsData {
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
}

// API Response wrapper
export interface ProfileDisplayResponse {
  success: boolean;
  data?: CompleteProfileData;
  error?: string;
  message?: string;
}

// Image upload response interface
export interface ImageUploadResponse {
  success: boolean;
  message: string;
  data?: {
    image_url: string;
    file_name: string;
    file_size: number;
    file_type: string;
    uploaded_at: string;
  };
  error?: string;
  details?: string;
}

// Enums for consistent data values
export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
  FREELANCE = 'freelance',
  VOLUNTEER = 'volunteer'
}

export enum ExperienceLevel {
  ENTRY = 'entry',
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
  PRINCIPAL = 'principal'
}

export enum AvailabilityStatus {
  AVAILABLE = 'available',
  OPEN_TO_OPPORTUNITIES = 'open_to_opportunities',
  NOT_LOOKING = 'not_looking'
}

export enum LanguageProficiency {
  NATIVE = 'native',
  FLUENT = 'fluent',
  PROFESSIONAL = 'professional',
  CONVERSATIONAL = 'conversational',
  BASIC = 'basic'
}

// Profile section identifiers for navigation and editing
export enum ProfileSection {
  BASIC_INFO = 'basic-info',
  ABOUT = 'about',
  EXPERIENCE = 'experience',
  EDUCATION = 'education',
  SKILLS = 'skills',
  PROJECTS = 'projects',
  CERTIFICATES = 'certificates',
  AWARDS = 'awards',
  VOLUNTEERING = 'volunteering',
  LANGUAGES = 'languages',
  CV_DOCUMENTS = 'cv-documents'
}

// Props interfaces for components
export interface SectionWrapperProps {
  title: string;
  editHref?: string;
  addHref?: string;
  children: React.ReactNode;
  showEditButton?: boolean;
  showAddButton?: boolean;
  isEmpty?: boolean;
  sectionId?: string;
}

export interface EmptySectionProps {
  title: string;
  description: string;
  addHref: string;
  buttonText: string;
  icon?: React.ComponentType<any>;
}

// Utility types for formatting
export interface DateRange {
  start: Date | null;
  end: Date | null;
  is_current?: boolean;
}

export interface FormattedDuration {
  years: number;
  months: number;
  formatted: string;
  isOngoing: boolean;
}

// Profile completeness configuration
export interface ProfileCompletenessConfig {
  sections: {
    [key in ProfileSection]: {
      weight: number;
      required: boolean;
      minimumItems?: number;
      minimumLength?: number;
    };
  };
}

// Default profile completeness configuration
export const DEFAULT_COMPLETENESS_CONFIG: ProfileCompletenessConfig = {
  sections: {
    [ProfileSection.BASIC_INFO]: { weight: 15, required: true },
    [ProfileSection.ABOUT]: { weight: 10, required: true, minimumLength: 50 },
    [ProfileSection.EXPERIENCE]: { weight: 20, required: true, minimumItems: 1 },
    [ProfileSection.EDUCATION]: { weight: 15, required: true, minimumItems: 1 },
    [ProfileSection.SKILLS]: { weight: 15, required: true, minimumItems: 3 },
    [ProfileSection.PROJECTS]: { weight: 10, required: false, minimumItems: 1 },
    [ProfileSection.CERTIFICATES]: { weight: 5, required: false },
    [ProfileSection.AWARDS]: { weight: 3, required: false },
    [ProfileSection.VOLUNTEERING]: { weight: 2, required: false },
    [ProfileSection.LANGUAGES]: { weight: 2, required: false },
    [ProfileSection.CV_DOCUMENTS]: { weight: 3, required: false, minimumItems: 1 }
  }
};