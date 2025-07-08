export interface AccomplishmentData {
  id?: string;
  title: string;
  description?: string;
  temp_work_experience_index?: number;
}

export interface WorkExperienceData {
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

export interface ExperienceUpdateData {
  work_experiences: WorkExperienceData[];
  accomplishments: AccomplishmentData[];
} 