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
  
  // Arrays - ALL NULLABLE as per your requirements
  work_experience?: WorkExperienceData[] | null;
  education?: EducationData[] | null;
  certificates?: CertificateData[] | null;
  projects?: ProjectData[] | null;
  awards?: AwardData[] | null;
  volunteering?: VolunteeringData[] | null;
  skills?: string[] | null;
  candidate_skills?: CandidateSkillData[] | null;
  accomplishments?: AccomplishmentData[] | null;
  
  // CV Documents
  cv_documents?: CVDocument[] | null;
}

export interface WorkExperienceData {
  title?: string;
  company?: string;
  employment_type?: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance' | 'volunteer';
  is_current?: boolean;
  start_date?: string;
  end_date?: string;
  location?: string;
  description?: string;
  job_source?: string;
  skill_ids?: string[];
  media_url?: string;
}

export interface EducationData {
  degree_diploma?: string;        // Made nullable
  university_school?: string;     // Made nullable
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  grade?: string;
  activities_societies?: string;
  skill_ids?: string[];
  media_url?: string;
}

export interface CertificateData {
  name?: string;
  issuing_authority?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  description?: string;
  media_url?: string;
}

export interface ProjectData {
  name?: string;
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
  title?: string;
  offered_by?: string;
  associated_with?: string;
  date?: string;
  description?: string;
  media_url?: string;
  skill_ids?: string[];
}

export interface VolunteeringData {
  role?: string;
  institution?: string;
  cause?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
  location?: string;
  media_url?: string;
}

export interface CandidateSkillData {
  skill_name?: string;
  skill_source?: string;
  proficiency?: number;
  proficiency_level?: string;
  years_of_experience?: number;
  
  // Enhanced source tracking
  source_title?: string;
  source_company?: string;
  source_institution?: string;
  source_authority?: string;
  source_type?: string;
}

export interface AccomplishmentData {
  title?: string;
  description?: string;
  work_experience_index?: number;
}

export interface CVDocument {
  id?: string;
  resume_url?: string;
  original_filename?: string;
  file_size?: number;
  file_type?: string;
  is_primary?: boolean;
  is_allow_fetch?: boolean;
  uploaded_at?: string;
}

export class DataTransformer {
  static normalizeExtractedData(extracted: ExtractedData): UnifiedProfileData {
    console.log('🔄 Starting enhanced data normalization...');
    console.log('📊 Extracted data structure:', {
      hasBasicInfo: !!extracted.basic_info,
      workExperiences: extracted.work_experiences?.length || 0,
      educations: extracted.educations?.length || 0,
      certificates: extracted.certificates?.length || 0,
      projects: extracted.projects?.length || 0,
      awards: extracted.awards?.length || 0,
      volunteering: extracted.volunteering?.length || 0,
      skills: extracted.skills?.length || 0,
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
      
      // Work Experiences - nullable array
      work_experience: extracted.work_experiences && extracted.work_experiences.length > 0 
        ? extracted.work_experiences.map(exp => ({
            title: exp.title || undefined,
            company: exp.company || undefined,
            employment_type: exp.employment_type || undefined,
            is_current: exp.is_current || false,
            start_date: exp.start_date || undefined,
            end_date: exp.end_date || undefined,
            location: exp.location || undefined,
            description: exp.description || undefined,
            job_source: undefined,
            skill_ids: [],
            media_url: undefined,
          }))
        : null,
      
      // Education - nullable array
      education: extracted.educations && extracted.educations.length > 0 
        ? extracted.educations.map(edu => ({
            degree_diploma: edu.degree_diploma || undefined,
            university_school: edu.university_school || undefined,
            field_of_study: edu.field_of_study || undefined,
            start_date: edu.start_date || undefined,
            end_date: edu.end_date || undefined,
            grade: edu.grade || undefined,
            activities_societies: undefined,
            skill_ids: [],
            media_url: undefined,
          }))
        : null,
      
      // Certificates - nullable array
      certificates: extracted.certificates && extracted.certificates.length > 0 
        ? extracted.certificates.map(cert => ({
            name: cert.name || undefined,
            issuing_authority: cert.issuing_authority || undefined,
            issue_date: cert.issue_date || undefined,
            expiry_date: cert.expiry_date || undefined,
            credential_id: cert.credential_id || undefined,
            credential_url: cert.credential_url || undefined,
            description: cert.description || undefined,
            media_url: cert.media_url || undefined,
          }))
        : null,
      
      // Projects - nullable array
      projects: extracted.projects && extracted.projects.length > 0 
        ? extracted.projects.map(proj => ({
            name: proj.name || undefined,
            description: proj.description || undefined,
            start_date: proj.start_date || undefined,
            end_date: proj.end_date || undefined,
            is_current: proj.is_current || false,
            role: proj.role || undefined,
            responsibilities: proj.responsibilities || [],
            technologies: proj.technologies || [],
            tools: proj.tools || [],
            methodologies: proj.methodologies || [],
            is_confidential: proj.is_confidential || false,
            can_share_details: proj.can_share_details || true,
            url: proj.url || undefined,
            repository_url: proj.repository_url || undefined,
            media_urls: proj.media_urls || [],
            skills_gained: proj.skills_gained || [],
          }))
        : null,
      
      // Awards - nullable array
      awards: extracted.awards && extracted.awards.length > 0 
        ? extracted.awards.map(award => ({
            title: award.title || undefined,
            offered_by: award.offered_by || undefined,
            associated_with: award.associated_with || undefined,
            date: award.date || undefined,
            description: award.description || undefined,
            media_url: award.media_url || undefined,
            skill_ids: award.skill_ids || [],
          }))
        : null,
      
      // Volunteering - nullable array
      volunteering: extracted.volunteering && extracted.volunteering.length > 0 
        ? extracted.volunteering.map(vol => ({
            role: vol.role || undefined,
            institution: vol.institution || undefined,
            cause: vol.cause || undefined,
            start_date: vol.start_date || undefined,
            end_date: vol.end_date || undefined,
            is_current: vol.is_current || false,
            description: vol.description || undefined,
            location: vol.location || undefined,
            media_url: vol.media_url || undefined,
          }))
        : null,
      
      // Accomplishments - nullable array
      accomplishments: extracted.accomplishments && extracted.accomplishments.length > 0 
        ? extracted.accomplishments.map(acc => ({
            title: acc.title || undefined,
            description: acc.description || undefined,
            work_experience_index: acc.work_experience_index,
          }))
        : null,
      
      // CV Documents - nullable array
      cv_documents: null,
    };
    
    // Enhanced skill processing - only if there are skills to process
    const allSkills: CandidateSkillData[] = [];
    
    // Process skills from different sources only if data exists
    if (extracted.work_experiences?.length) {
      extracted.work_experiences.forEach((exp, expIndex) => {
        const expSkills = this.extractSkillsFromExperience(exp);
        expSkills.forEach(skillName => {
          allSkills.push({
            skill_name: skillName,
            skill_source: 'work_experience',
            proficiency: 70,
            years_of_experience: this.calculateExperienceDuration(exp.start_date, exp.end_date),
            source_title: exp.title,
            source_company: exp.company,
            source_type: 'work_experience'
          });
        });
      });
    }
    
    if (extracted.educations?.length) {
      extracted.educations.forEach((edu, eduIndex) => {
        const eduSkills = this.extractSkillsFromEducation(edu);
        eduSkills.forEach(skillName => {
          allSkills.push({
            skill_name: skillName,
            skill_source: 'education',
            proficiency: 60,
            years_of_experience: this.calculateEducationDuration(edu.start_date, edu.end_date),
            source_title: edu.degree_diploma,
            source_institution: edu.university_school,
            source_type: 'education'
          });
        });
      });
    }
    
    if (extracted.projects?.length) {
      extracted.projects.forEach((proj, projIndex) => {
        const projSkills = [
          ...(proj.technologies || []),
          ...(proj.tools || []),
          ...(proj.skills_gained || []),
          ...this.extractSkillsFromText(proj.description || '')
        ];
        projSkills.forEach(skillName => {
          allSkills.push({
            skill_name: skillName,
            skill_source: 'project',
            proficiency: 65,
            years_of_experience: this.calculateProjectDuration(proj.start_date, proj.end_date),
            source_title: proj.name,
            source_type: 'project'
          });
        });
      });
    }
    
    if (extracted.certificates?.length) {
      extracted.certificates.forEach((cert, certIndex) => {
        const certSkills = [
          ...this.extractSkillsFromText(cert.name || ''),
          ...this.extractSkillsFromText(cert.description || '')
        ];
        certSkills.forEach(skillName => {
          allSkills.push({
            skill_name: skillName,
            skill_source: 'certificate',
            proficiency: 75,
            years_of_experience: this.calculateCertificateAge(cert.issue_date),
            source_title: cert.name,
            source_authority: cert.issuing_authority,
            source_type: 'certificate'
          });
        });
      });
    }
    
    if (extracted.awards?.length) {
      extracted.awards.forEach((award, awardIndex) => {
        const awardSkills = [
          ...this.extractSkillsFromText(award.title || ''),
          ...this.extractSkillsFromText(award.description || '')
        ];
        awardSkills.forEach(skillName => {
          allSkills.push({
            skill_name: skillName,
            skill_source: 'award',
            proficiency: 80,
            years_of_experience: 0,
            source_title: award.title,
            source_authority: award.offered_by,
            source_type: 'award'
          });
        });
      });
    }
    
    if (extracted.skills?.length) {
      extracted.skills.forEach(skill => {
        allSkills.push({
          skill_name: typeof skill === 'string' ? skill : skill.name || '',
          skill_source: 'cv_skills_section',
          proficiency: typeof skill === 'object' && skill.proficiency ? skill.proficiency : 60,
          years_of_experience: 0,
          source_title: 'Skills Section',
          source_type: 'direct'
        });
      });
    }
    
    // Filter valid skills
    const validSkills = allSkills.filter(skill => 
      skill.skill_name && 
      skill.skill_name.trim().length > 1 && 
      skill.skill_name.length <= 100
    );
    
    if (validSkills.length > 0) {
      // Remove duplicate skills (keep the one with highest proficiency)
      const skillMap = new Map<string, CandidateSkillData>();
      validSkills.forEach(skill => {
        const existing = skillMap.get(skill.skill_name!.toLowerCase());
        if (!existing || (skill.proficiency && existing.proficiency && skill.proficiency > existing.proficiency)) {
          skillMap.set(skill.skill_name!.toLowerCase(), skill);
        }
      });
      
      normalized.candidate_skills = Array.from(skillMap.values());
      normalized.skills = normalized.candidate_skills.map(skill => skill.skill_name!);
    } else {
      normalized.candidate_skills = null;
      normalized.skills = null;
    }
    
    console.log('✅ Enhanced skills normalization complete:', {
      totalSkills: normalized.candidate_skills?.length || 0,
      bySource: normalized.candidate_skills ? this.groupSkillsBySource(normalized.candidate_skills) : {},
      workExperiences: normalized.work_experience?.length || 0,
      educations: normalized.education?.length || 0,
      certificates: normalized.certificates?.length || 0,
      projects: normalized.projects?.length || 0,
      awards: normalized.awards?.length || 0,
      volunteering: normalized.volunteering?.length || 0,
      accomplishments: normalized.accomplishments?.length || 0,
    });
    
    return normalized;
  }
  
  // Helper methods for enhanced skill extraction
  private static extractSkillsFromExperience(exp: any): string[] {
    const skills: string[] = [];
    
    // Extract from job title
    skills.push(...this.extractSkillsFromText(exp.title || ''));
    
    // Extract from description
    skills.push(...this.extractSkillsFromText(exp.description || ''));
    
    // Extract from company (sometimes company names indicate skills)
    skills.push(...this.extractSkillsFromText(exp.company || ''));
    
    return [...new Set(skills)]; // Remove duplicates
  }

  private static extractSkillsFromEducation(edu: any): string[] {
    const skills: string[] = [];
    
    // Extract from field of study
    skills.push(...this.extractSkillsFromText(edu.field_of_study || ''));
    
    // Extract from degree name
    skills.push(...this.extractSkillsFromText(edu.degree_diploma || ''));
    
    return [...new Set(skills)];
  }

  private static extractSkillsFromText(text: string): string[] {
    if (!text) return [];
    
    const commonSkills = [
      // Programming Languages
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'C', 'Perl', 'Objective-C',
      
      // Frontend Technologies
      'React', 'Vue.js', 'Vue', 'Angular', 'HTML', 'CSS', 'Sass', 'SCSS', 'Less', 'Bootstrap', 'Tailwind CSS', 'Tailwind', 'jQuery', 'Next.js', 'Nuxt.js', 'Svelte', 'Ember.js',
      
      // Backend Technologies
      'Node.js', 'Express.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Spring', 'Laravel', 'Ruby on Rails', 'Rails', 'ASP.NET', '.NET Core', 'NestJS',
      
      // Databases
      'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'Firebase', 'Firestore', 'DynamoDB', 'Cassandra', 'Neo4j', 'MariaDB', 'CouchDB',
      
      // Cloud & DevOps
      'AWS', 'Azure', 'Google Cloud', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab', 'CI/CD', 'Terraform', 'Ansible', 'Chef', 'Puppet', 'Vagrant',
      
      // Data & Analytics
      'SQL', 'Excel', 'Tableau', 'Power BI', 'Pandas', 'NumPy', 'Machine Learning', 'Data Analysis', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Apache Spark', 'Hadoop',
      
      // Mobile Development
      'React Native', 'Flutter', 'iOS', 'Android', 'Xamarin', 'Ionic', 'Cordova', 'PhoneGap',
      
      // Testing
      'Jest', 'Cypress', 'Selenium', 'JUnit', 'TestNG', 'Mocha', 'Jasmine', 'Playwright', 'Puppeteer',
      
      // Project Management & Methodologies
      'Agile', 'Scrum', 'Kanban', 'JIRA', 'Trello', 'Asana', 'Waterfall', 'Lean', 'Six Sigma', 'PMP',
      
      // Design & UX
      'Photoshop', 'Illustrator', 'Figma', 'Sketch', 'UI/UX Design', 'UI Design', 'UX Design', 'Graphic Design', 'Adobe Creative Suite', 'InDesign',
      
      // Soft Skills
      'Leadership', 'Communication', 'Project Management', 'Problem Solving', 'Teamwork', 'Time Management', 'Critical Thinking', 'Analytical Thinking', 'Creativity',
      
      // Business & Finance
      'Microsoft Office', 'Excel', 'PowerPoint', 'Word', 'QuickBooks', 'SAP', 'Salesforce', 'Financial Analysis', 'Accounting', 'Budgeting', 'Forecasting'
    ];
    
    const foundSkills: string[] = [];
    const lowerText = text.toLowerCase();
    
    commonSkills.forEach(skill => {
      // Use word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lowerText)) {
        foundSkills.push(skill);
      }
    });
    
    return [...new Set(foundSkills)]; // Remove duplicates
  }

  private static calculateExperienceDuration(startDate: string | null, endDate: string | null): number {
    if (!startDate) return 0;
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    
    return Math.min(Math.round(diffYears * 10) / 10, 20); // Round to 1 decimal, cap at 20 years
  }

  private static calculateEducationDuration(startDate: string | null, endDate: string | null): number {
    return this.calculateExperienceDuration(startDate, endDate);
  }

  private static calculateProjectDuration(startDate: string | null, endDate: string | null): number {
    return this.calculateExperienceDuration(startDate, endDate);
  }

  private static calculateCertificateAge(issueDate: string | null): number {
    if (!issueDate) return 0;
    return this.calculateExperienceDuration(issueDate, null);
  }

  private static groupSkillsBySource(skills: CandidateSkillData[]): Record<string, number> {
    return skills.reduce((acc, skill) => {
      const source = skill.skill_source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
  
  static validateProfileData(data: UnifiedProfileData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Only validate required fields in basic info
    if (!data.first_name?.trim()) errors.push('First name is required');
    if (!data.last_name?.trim()) errors.push('Last name is required');
    
    // Optional validation for data integrity (only if arrays exist and are not null)
    if (data.work_experience && Array.isArray(data.work_experience)) {
      data.work_experience.forEach((exp, index) => {
        // Only validate if the fields exist - they're all optional now
        if (exp.start_date && exp.end_date && new Date(exp.start_date) > new Date(exp.end_date)) {
          errors.push(`Work experience ${index + 1}: End date cannot be before start date`);
        }
      });
    }
    
    if (data.education && Array.isArray(data.education)) {
      data.education.forEach((edu, index) => {
        if (edu.start_date && edu.end_date && new Date(edu.start_date) > new Date(edu.end_date)) {
          errors.push(`Education ${index + 1}: End date cannot be before start date`);
        }
      });
    }
    
    if (data.candidate_skills && Array.isArray(data.candidate_skills)) {
      data.candidate_skills.forEach((skill, index) => {
        if (skill.proficiency && (skill.proficiency < 0 || skill.proficiency > 100)) {
          errors.push(`Skill ${index + 1}: Proficiency must be between 0 and 100`);
        }
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