// Enhanced interface for complete profile display
export interface CompleteProfileData {
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
    profile_image_url: string | null; // ✅ Now from candidate table
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