export interface BasicInfoFormData {
  // Personal Information
  first_name: string;
  last_name: string;
  additional_name: string;
  gender: string;
  date_of_birth: string;
  pronouns: string;
  profile_image_url: string;

  // Professional Information
  title: string;
  current_position: string;
  industry: string;
  bio: string;
  professional_summary: string;

  // Location Information
  country: string;
  city: string;
  location: string;
  address: string;

  // Contact Information
  phone1: string;
  phone2: string;
  personal_website: string;
  portfolio_url: string;
  github_url: string;
  linkedin_url: string;

  // Experience & Availability
  experience_level: string;
  years_of_experience: number;
  total_years_experience: number;
  availability_status: string;
  availability_date: string;

  // Work Preferences
  remote_preference: string;
  work_availability: string;
  notice_period: number;
  open_to_relocation: boolean;
  willing_to_travel: boolean;

  // Salary & Compensation
  expected_salary_min: number;
  expected_salary_max: number;
  currency: string;
  salary_visibility: string;

  // Legal & Documentation
  nic: string;
  passport: string;
  work_authorization: string;
  visa_assistance_needed: boolean;
  security_clearance: boolean;

  // Diversity & Inclusion
  disability_status: string;
  veteran_status: string;

  // AI & Skills Scores
  ai_collaboration_score: number;
  prompting_skill_score: number;
  workflow_automation_score: number;
  overall_ai_readiness_score: number;

  // Profile Status
  interview_ready: boolean;
  pre_qualified: boolean;
}