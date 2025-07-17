// types/job.ts

export enum JobType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
  FREELANCE = 'freelance'
}

export enum JobStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  PAUSED = 'paused',
  CLOSED = 'closed',
  ARCHIVED = 'archived'
}

export enum ExperienceLevel {
  ENTRY = 'entry',
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
  PRINCIPAL = 'principal'
}

export enum RemoteType {
  REMOTE = 'remote',
  HYBRID = 'hybrid',
  ONSITE = 'onsite'
}

export enum SalaryType {
  ANNUAL = 'annual',
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
  DAILY = 'daily',
  HOURLY = 'hourly'
}

export enum CreatorType {
  EMPLOYER = 'employer',
  MIS_USER = 'mis_user'
}

export enum RequiredLevel {
  NICE_TO_HAVE = 'nice_to_have',
  PREFERRED = 'preferred',
  REQUIRED = 'required',
  MUST_HAVE = 'must_have'
}

export enum ProficiencyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export interface JobSkill {
  id: string;
  job_id: string;
  skill_id: string;
  required_level: RequiredLevel;
  proficiency_level: ProficiencyLevel;
  years_required?: number;
  weight: number;
  skill?: {
    id: string;
    name: string;
    category?: string;
  };
}

export interface Job {
  id: string;
  creator_id: string;
  creator_type: CreatorType;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  job_type: JobType;
  experience_level: ExperienceLevel;
  location?: string;
  remote_type: RemoteType;
  salary_min?: number;
  salary_max?: number;
  currency: string;
  salary_type: SalaryType;
  equity_offered: boolean;
  ai_skills_required: boolean;
  application_deadline?: string;
  status: JobStatus;
  published_at?: string;
  priority_level: number;
  views_count: number;
  applications_count: number;
  company_id?: string;
  customCompanyName?: string;
  customCompanyEmail?: string;
  customCompanyPhone?: string;
  customCompanyWebsite?: string;
  created_at: string;
  updated_at: string;
  company?: {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
    industry?: string;
  };
  skills?: JobSkill[];
}

export interface CreateJobRequest {
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  job_type: JobType;
  experience_level: ExperienceLevel;
  location?: string;
  remote_type: RemoteType;
  salary_min?: number;
  salary_max?: number;
  currency: string;
  salary_type: SalaryType;
  equity_offered: boolean;
  ai_skills_required: boolean;
  application_deadline?: string;
  status: JobStatus;
  priority_level: number;
  company_id?: string;
  customCompanyName?: string;
  customCompanyEmail?: string;
  customCompanyPhone?: string;
  customCompanyWebsite?: string;
  skills: {
    skill_name: string;
    required_level: RequiredLevel;
    proficiency_level: ProficiencyLevel;
    years_required?: number;
    weight?: number;
  }[];
}

export interface CreateJobResponse {
  success: boolean;
  data?: Job;
  error?: string;
  message?: string;
}

export interface JobFormData {
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  job_type: JobType;
  experience_level: ExperienceLevel;
  location: string;
  remote_type: RemoteType;
  salary_min: string;
  salary_max: string;
  currency: string;
  salary_type: SalaryType;
  equity_offered: boolean;
  ai_skills_required: boolean;
  application_deadline: string;
  status: JobStatus;
  priority_level: number;
  company_id: string;
  customCompanyName: string;
  customCompanyEmail: string;
  customCompanyPhone: string;
  customCompanyWebsite: string;
  skills: {
    skill_name: string;
    required_level: RequiredLevel;
    proficiency_level: ProficiencyLevel;
    years_required: string;
    weight: string;
  }[];
}

export interface UpdateJobResponse {
  success: boolean;
  data?: Job;
  error?: string;
  message?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}