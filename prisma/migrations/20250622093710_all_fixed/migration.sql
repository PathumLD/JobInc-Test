-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('candidate', 'employer', 'admin', 'mis', 'recruitment_agency');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');

-- CreateEnum
CREATE TYPE "RemotePreference" AS ENUM ('remote_only', 'hybrid', 'onsite', 'flexible');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('entry', 'junior', 'mid', 'senior', 'lead', 'principal');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('available', 'open_to_opportunities', 'not_looking');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- CreateEnum
CREATE TYPE "PhoneType" AS ENUM ('mobile', 'home', 'work', 'other');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'freelance', 'volunteer');

-- CreateEnum
CREATE TYPE "LanguageProficiency" AS ENUM ('native', 'fluent', 'professional', 'conversational', 'basic');

-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('startup', 'one_to_ten', 'eleven_to_fifty', 'fifty_one_to_two_hundred', 'two_hundred_one_to_five_hundred', 'five_hundred_one_to_one_thousand', 'one_thousand_plus');

-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('startup', 'corporation', 'agency', 'non_profit', 'government');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'freelance');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('draft', 'published', 'paused', 'closed', 'archived');

-- CreateEnum
CREATE TYPE "SalaryType" AS ENUM ('annual', 'monthly', 'weekly', 'daily', 'hourly');

-- CreateEnum
CREATE TYPE "CreatorType" AS ENUM ('employer', 'mis_user');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('read_only', 'analyst', 'admin', 'super_admin');

-- CreateEnum
CREATE TYPE "RequiredLevel" AS ENUM ('nice_to_have', 'preferred', 'required', 'must_have');

-- CreateEnum
CREATE TYPE "ProficiencyLevel" AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'screening', 'ai_assessment', 'interview', 'technical_test', 'final_review', 'offered', 'accepted', 'rejected', 'withdrawn');

-- CreateEnum
CREATE TYPE "EmployerRole" AS ENUM ('recruiter', 'hiring_manager', 'hr_admin', 'company_admin');

-- CreateEnum
CREATE TYPE "AgencyRole" AS ENUM ('recruiter', 'account_manager', 'agency_admin');

-- CreateEnum
CREATE TYPE "RemoteType" AS ENUM ('remote', 'hybrid', 'onsite');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('phone_screening', 'video_call', 'ai_video', 'technical', 'behavioral', 'final');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');

-- CreateEnum
CREATE TYPE "Recommendation" AS ENUM ('strong_hire', 'hire', 'maybe', 'no_hire', 'strong_no_hire');

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255),
    "profile_image_url" TEXT,
    "role" "UserType",
    "status" "UserStatus" NOT NULL DEFAULT 'pending_verification',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verification_token" VARCHAR(255),
    "password_reset_token" VARCHAR(255),
    "password_reset_expires_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "user_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "additional_name" VARCHAR(100),
    "gender" "Gender",
    "date_of_birth" DATE,
    "title" VARCHAR(200) NOT NULL,
    "current_position" VARCHAR(200),
    "industry" VARCHAR(100),
    "bio" TEXT NOT NULL,
    "about" TEXT,
    "country" VARCHAR(100),
    "city" VARCHAR(100),
    "location" VARCHAR(200) NOT NULL,
    "address" TEXT,
    "phone" VARCHAR(20),
    "phone_type" "PhoneType",
    "personal_website" TEXT,
    "nic" VARCHAR(50),
    "passport" VARCHAR(50),
    "remote_preference" "RemotePreference" NOT NULL DEFAULT 'flexible',
    "experience_level" "ExperienceLevel" NOT NULL DEFAULT 'entry',
    "years_of_experience" INTEGER DEFAULT 0,
    "expected_salary_min" DOUBLE PRECISION DEFAULT 0,
    "expected_salary_max" DOUBLE PRECISION DEFAULT 0,
    "currency" VARCHAR(4) NOT NULL DEFAULT 'USD',
    "availability_status" "AvailabilityStatus" NOT NULL DEFAULT 'available',
    "availability_date" DATE,
    "resume_url" TEXT,
    "portfolio_url" TEXT,
    "github_url" TEXT,
    "linkedin_url" TEXT,
    "ai_collaboration_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "prompting_skill_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "workflow_automation_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "overall_ai_readiness_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "interview_ready" BOOLEAN NOT NULL DEFAULT false,
    "pre_qualified" BOOLEAN NOT NULL DEFAULT false,
    "profile_completion_percentage" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "work_experiences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "employment_type" "EmploymentType" NOT NULL DEFAULT 'full_time',
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "company" VARCHAR(200) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "location" VARCHAR(200),
    "description" TEXT,
    "job_source" VARCHAR(100),
    "skill_ids" UUID[],
    "media_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accomplishments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "work_experience_id" UUID,
    "resume_id" UUID,
    "title" VARCHAR(300) NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accomplishments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "educations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "degree_diploma" VARCHAR(200) NOT NULL,
    "university_school" VARCHAR(300) NOT NULL,
    "field_of_study" VARCHAR(200),
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "grade" VARCHAR(50),
    "activities_societies" TEXT,
    "skill_ids" UUID[],
    "media_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50),
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_skills" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "skill_source" VARCHAR(100),
    "proficiency" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "language" VARCHAR(100) NOT NULL,
    "is_first_language" BOOLEAN NOT NULL DEFAULT false,
    "oral_proficiency" "LanguageProficiency",
    "written_proficiency" "LanguageProficiency",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "awards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "associated_with" VARCHAR(200),
    "offered_by" VARCHAR(200) NOT NULL,
    "date" DATE NOT NULL,
    "description" TEXT,
    "media_url" TEXT,
    "skill_ids" UUID[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "awards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteering" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "role" VARCHAR(200) NOT NULL,
    "institution" VARCHAR(200) NOT NULL,
    "cause" VARCHAR(200),
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "media_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "is_allow_fetch" BOOLEAN NOT NULL DEFAULT true,
    "resume_url" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "website_url" TEXT,
    "logo_url" TEXT,
    "industry" VARCHAR(100),
    "company_size" "CompanySize" NOT NULL,
    "headquarters_location" VARCHAR(200),
    "founded_year" INTEGER,
    "company_type" "CompanyType" NOT NULL DEFAULT 'corporation',
    "remote_friendly" BOOLEAN NOT NULL DEFAULT false,
    "benefits" TEXT,
    "culture_description" TEXT,
    "social_media_links" JSONB,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'pending',
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mis_users" (
    "user_id" UUID NOT NULL,
    "access_level" "AccessLevel" NOT NULL,
    "department" VARCHAR(100),
    "reporting_to" UUID,
    "data_access_scopes" JSONB,
    "job_posting_permissions" BOOLEAN NOT NULL DEFAULT false,
    "can_post_for_all_companies" BOOLEAN NOT NULL DEFAULT false,
    "max_active_jobs" INTEGER NOT NULL DEFAULT 5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mis_users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "mis_company_access" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "mis_user_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "can_create_jobs" BOOLEAN NOT NULL DEFAULT true,
    "can_manage_jobs" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mis_company_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "creator_id" UUID NOT NULL,
    "creator_type" "CreatorType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(250) NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "responsibilities" TEXT,
    "benefits" TEXT,
    "job_type" "JobType" NOT NULL,
    "experience_level" "ExperienceLevel" NOT NULL,
    "location" VARCHAR(200),
    "remote_type" "RemoteType" NOT NULL,
    "salary_min" DOUBLE PRECISION,
    "salary_max" DOUBLE PRECISION,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "salary_type" "SalaryType" NOT NULL DEFAULT 'annual',
    "equity_offered" BOOLEAN NOT NULL DEFAULT false,
    "ai_skills_required" BOOLEAN NOT NULL DEFAULT false,
    "ai_collaboration_weight" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "prompting_skills_weight" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "automation_skills_weight" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "application_deadline" TIMESTAMP(3),
    "status" "JobStatus" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "priority_level" INTEGER NOT NULL DEFAULT 1,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "applications_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_skills" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "job_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "required_level" "RequiredLevel" NOT NULL,
    "proficiency_level" "ProficiencyLevel" NOT NULL,
    "years_required" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "job_id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'pending',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cover_letter" TEXT,
    "ai_match_score" DOUBLE PRECISION,
    "skill_match_percentage" DOUBLE PRECISION,
    "experience_match_score" DOUBLE PRECISION,
    "ai_readiness_match" DOUBLE PRECISION,
    "overall_fit_score" DOUBLE PRECISION,
    "recruiter_notes" TEXT,
    "candidate_notes" TEXT,
    "interview_scheduled_at" TIMESTAMP(3),
    "interview_completed_at" TIMESTAMP(3),
    "offer_extended_at" TIMESTAMP(3),
    "offer_accepted_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "rejected_at" TIMESTAMP(3),
    "withdrawn_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_views" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "job_id" UUID NOT NULL,
    "user_id" UUID,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "referrer_url" TEXT,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "interviewer_id" UUID,
    "interview_type" "InterviewType" NOT NULL,
    "status" "InterviewStatus" NOT NULL DEFAULT 'scheduled',
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL DEFAULT 60,
    "meeting_link" TEXT,
    "meeting_id" VARCHAR(100),
    "ai_conducted" BOOLEAN NOT NULL DEFAULT false,
    "ai_analysis" JSONB,
    "interview_notes" TEXT,
    "technical_assessment_data" JSONB,
    "behavioral_scores" JSONB,
    "communication_score" DOUBLE PRECISION,
    "technical_score" DOUBLE PRECISION,
    "cultural_fit_score" DOUBLE PRECISION,
    "overall_rating" DOUBLE PRECISION,
    "recommendation" "Recommendation",
    "feedback_for_candidate" TEXT,
    "recording_url" TEXT,
    "transcript" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employers" (
    "user_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "job_title" VARCHAR(200),
    "department" VARCHAR(100),
    "role" "EmployerRole" NOT NULL,
    "permissions" JSONB,
    "is_primary_contact" BOOLEAN NOT NULL DEFAULT false,
    "phone_extension" VARCHAR(10),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employers_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "recruitment_agencies" (
    "user_id" UUID NOT NULL,
    "agency_id" UUID NOT NULL,
    "role" "AgencyRole" NOT NULL,
    "specialization" VARCHAR(200),
    "clients" JSONB,
    "commission_rate" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruitment_agencies_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "candidates_experience_level_idx" ON "candidates"("experience_level");

-- CreateIndex
CREATE INDEX "candidates_availability_status_idx" ON "candidates"("availability_status");

-- CreateIndex
CREATE INDEX "candidates_overall_ai_readiness_score_idx" ON "candidates"("overall_ai_readiness_score");

-- CreateIndex
CREATE INDEX "candidates_country_city_idx" ON "candidates"("country", "city");

-- CreateIndex
CREATE INDEX "candidates_industry_idx" ON "candidates"("industry");

-- CreateIndex
CREATE INDEX "work_experiences_candidate_id_idx" ON "work_experiences"("candidate_id");

-- CreateIndex
CREATE INDEX "work_experiences_is_current_idx" ON "work_experiences"("is_current");

-- CreateIndex
CREATE INDEX "accomplishments_candidate_id_idx" ON "accomplishments"("candidate_id");

-- CreateIndex
CREATE INDEX "accomplishments_work_experience_id_idx" ON "accomplishments"("work_experience_id");

-- CreateIndex
CREATE INDEX "accomplishments_resume_id_idx" ON "accomplishments"("resume_id");

-- CreateIndex
CREATE INDEX "educations_candidate_id_idx" ON "educations"("candidate_id");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- CreateIndex
CREATE INDEX "skills_name_idx" ON "skills"("name");

-- CreateIndex
CREATE INDEX "candidate_skills_candidate_id_idx" ON "candidate_skills"("candidate_id");

-- CreateIndex
CREATE INDEX "candidate_skills_skill_id_idx" ON "candidate_skills"("skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_skills_candidate_id_skill_id_key" ON "candidate_skills"("candidate_id", "skill_id");

-- CreateIndex
CREATE INDEX "languages_candidate_id_idx" ON "languages"("candidate_id");

-- CreateIndex
CREATE INDEX "awards_candidate_id_idx" ON "awards"("candidate_id");

-- CreateIndex
CREATE INDEX "volunteering_candidate_id_idx" ON "volunteering"("candidate_id");

-- CreateIndex
CREATE INDEX "resumes_candidate_id_idx" ON "resumes"("candidate_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- CreateIndex
CREATE INDEX "companies_slug_idx" ON "companies"("slug");

-- CreateIndex
CREATE INDEX "companies_industry_idx" ON "companies"("industry");

-- CreateIndex
CREATE INDEX "companies_company_size_idx" ON "companies"("company_size");

-- CreateIndex
CREATE INDEX "companies_verification_status_idx" ON "companies"("verification_status");

-- CreateIndex
CREATE INDEX "mis_users_access_level_idx" ON "mis_users"("access_level");

-- CreateIndex
CREATE INDEX "mis_users_job_posting_permissions_idx" ON "mis_users"("job_posting_permissions");

-- CreateIndex
CREATE INDEX "mis_company_access_mis_user_id_idx" ON "mis_company_access"("mis_user_id");

-- CreateIndex
CREATE INDEX "mis_company_access_company_id_idx" ON "mis_company_access"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "mis_company_access_mis_user_id_company_id_key" ON "mis_company_access"("mis_user_id", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_slug_key" ON "jobs"("slug");

-- CreateIndex
CREATE INDEX "jobs_company_id_idx" ON "jobs"("company_id");

-- CreateIndex
CREATE INDEX "jobs_creator_id_creator_type_idx" ON "jobs"("creator_id", "creator_type");

-- CreateIndex
CREATE INDEX "jobs_status_idx" ON "jobs"("status");

-- CreateIndex
CREATE INDEX "jobs_experience_level_idx" ON "jobs"("experience_level");

-- CreateIndex
CREATE INDEX "jobs_remote_type_idx" ON "jobs"("remote_type");

-- CreateIndex
CREATE INDEX "jobs_published_at_idx" ON "jobs"("published_at");

-- CreateIndex
CREATE INDEX "job_skills_job_id_idx" ON "job_skills"("job_id");

-- CreateIndex
CREATE INDEX "job_skills_skill_id_idx" ON "job_skills"("skill_id");

-- CreateIndex
CREATE INDEX "job_skills_required_level_idx" ON "job_skills"("required_level");

-- CreateIndex
CREATE UNIQUE INDEX "job_skills_job_id_skill_id_key" ON "job_skills"("job_id", "skill_id");

-- CreateIndex
CREATE INDEX "applications_job_id_idx" ON "applications"("job_id");

-- CreateIndex
CREATE INDEX "applications_candidate_id_idx" ON "applications"("candidate_id");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE INDEX "applications_overall_fit_score_idx" ON "applications"("overall_fit_score");

-- CreateIndex
CREATE INDEX "applications_applied_at_idx" ON "applications"("applied_at");

-- CreateIndex
CREATE UNIQUE INDEX "applications_job_id_candidate_id_key" ON "applications"("job_id", "candidate_id");

-- CreateIndex
CREATE INDEX "job_views_job_id_idx" ON "job_views"("job_id");

-- CreateIndex
CREATE INDEX "job_views_user_id_idx" ON "job_views"("user_id");

-- CreateIndex
CREATE INDEX "job_views_viewed_at_idx" ON "job_views"("viewed_at");

-- CreateIndex
CREATE INDEX "interviews_application_id_idx" ON "interviews"("application_id");

-- CreateIndex
CREATE INDEX "interviews_interviewer_id_idx" ON "interviews"("interviewer_id");

-- CreateIndex
CREATE INDEX "interviews_status_idx" ON "interviews"("status");

-- CreateIndex
CREATE INDEX "interviews_scheduled_at_idx" ON "interviews"("scheduled_at");

-- CreateIndex
CREATE INDEX "interviews_interview_type_idx" ON "interviews"("interview_type");

-- CreateIndex
CREATE INDEX "employers_company_id_idx" ON "employers"("company_id");

-- CreateIndex
CREATE INDEX "employers_role_idx" ON "employers"("role");

-- CreateIndex
CREATE INDEX "recruitment_agencies_agency_id_idx" ON "recruitment_agencies"("agency_id");

-- CreateIndex
CREATE INDEX "recruitment_agencies_role_idx" ON "recruitment_agencies"("role");

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_experiences" ADD CONSTRAINT "work_experiences_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accomplishments" ADD CONSTRAINT "accomplishments_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accomplishments" ADD CONSTRAINT "accomplishments_work_experience_id_fkey" FOREIGN KEY ("work_experience_id") REFERENCES "work_experiences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accomplishments" ADD CONSTRAINT "accomplishments_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educations" ADD CONSTRAINT "educations_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "languages" ADD CONSTRAINT "languages_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "awards" ADD CONSTRAINT "awards_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteering" ADD CONSTRAINT "volunteering_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mis_users" ADD CONSTRAINT "mis_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mis_users" ADD CONSTRAINT "mis_users_reporting_to_fkey" FOREIGN KEY ("reporting_to") REFERENCES "mis_users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mis_company_access" ADD CONSTRAINT "mis_company_access_mis_user_id_fkey" FOREIGN KEY ("mis_user_id") REFERENCES "mis_users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mis_company_access" ADD CONSTRAINT "mis_company_access_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_creator_mis_fkey" FOREIGN KEY ("creator_id") REFERENCES "mis_users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_creator_employer_fkey" FOREIGN KEY ("creator_id") REFERENCES "employers"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_skills" ADD CONSTRAINT "job_skills_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_skills" ADD CONSTRAINT "job_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_views" ADD CONSTRAINT "job_views_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_views" ADD CONSTRAINT "job_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_interviewer_id_fkey" FOREIGN KEY ("interviewer_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employers" ADD CONSTRAINT "employers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employers" ADD CONSTRAINT "employers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_agencies" ADD CONSTRAINT "recruitment_agencies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruitment_agencies" ADD CONSTRAINT "recruitment_agencies_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
