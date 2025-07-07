// app/api/ai/process-cv/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

interface WorkExperience {
  title: string;
  company: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance' | 'volunteer';
  is_current: boolean;
  start_date: string;
  end_date: string | null;
  location: string | null;
  description: string | null;
}

interface Education {
  degree_diploma: string;
  university_school: string;
  field_of_study: string | null;
  start_date: string;
  end_date: string | null;
  grade: string | null;
}

interface Certificate {
  name: string;
  issuing_authority: string;
  issue_date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  description: string | null;
  media_url: string | null;
}

interface Project {
  name: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  technologies: string[];
  url: string | null;
  repository_url: string | null;
  is_current: boolean;
  role: string | null;
  responsibilities: string[];
  tools: string[];
  methodologies: string[];
  is_confidential: boolean;
  can_share_details: boolean;
  media_urls: string[];
  skills_gained: string[];
}

interface Award {
  title: string;
  offered_by: string;
  associated_with: string | null;
  date: string;
  description: string | null;
  media_url: string | null;
  skill_ids: string[];
}

interface Volunteering {
  role: string;
  institution: string;
  cause: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  media_url: string | null;
}

interface CandidateSkill {
  skill_name: string;
  skill_source: string;
  proficiency: number;
  years_of_experience?: number;
  source_title?: string;
  source_company?: string;
  source_institution?: string;
  source_authority?: string;
  source_type?: string;
}

interface Accomplishment {
  title: string;
  description: string;
  work_experience_id?: string | null;
}

interface ExtractedData {
  basic_info: {
    first_name: string;
    last_name: string;
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
  };
  work_experiences: WorkExperience[];
  educations: Education[];
  certificates: Certificate[];
  projects: Project[];
  skills: Array<{
    name: string;
    category: string | null;
    proficiency: number | null;
  }>;
  awards: Award[];
  volunteering: Volunteering[];
  accomplishments: Accomplishment[];
}

const getCVExtractionPrompt = () => `
Extract candidate profile data from this CV and return STRICT JSON matching the EXACT structure:

{
  "basic_info": {
    "first_name": "string",
    "last_name": "string", 
    "additional_name": "string|null",
    "title": "string|null",
    "current_position": "string|null",
    "industry": "string|null", 
    "bio": "string|null",
    "about": "string|null",
    "location": "string|null",
    "phone1": "string|null",
    "phone2": "string|null",
    "personal_website": "string|null",
    "github_url": "string|null",
    "linkedin_url": "string|null",
    "portfolio_url": "string|null",
    "years_of_experience": "number|null"
  },
  "work_experiences": [
    {
      "title": "string",
      "company": "string", 
      "employment_type": "enum(full_time|part_time|contract|internship|freelance|volunteer)",
      "is_current": "boolean",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD|null",
      "location": "string|null",
      "description": "string|null"
    }
  ],
  "educations": [
    {
      "degree_diploma": "string",
      "university_school": "string",
      "field_of_study": "string|null", 
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD|null",
      "grade": "string|null"
    }
  ],
  "certificates": [
    {
      "name": "string",
      "issuing_authority": "string",
      "issue_date": "YYYY-MM-DD|null",
      "expiry_date": "YYYY-MM-DD|null",
      "credential_id": "string|null",
      "credential_url": "string|null",
      "description": "string|null",
      "media_url": "string|null"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "start_date": "YYYY-MM-DD|null", 
      "end_date": "YYYY-MM-DD|null",
      "technologies": "string[]",
      "url": "string|null",
      "repository_url": "string|null",
      "is_current": "boolean",
      "role": "string|null",
      "responsibilities": "string[]",
      "tools": "string[]",
      "methodologies": "string[]",
      "is_confidential": "boolean",
      "can_share_details": "boolean",
      "media_urls": "string[]",
      "skills_gained": "string[]"
    }
  ],
  "skills": [
    {
      "name": "string",
      "category": "string|null",
      "proficiency": "number|null (0-100)"
    }
  ],
  "awards": [
    {
      "title": "string",
      "offered_by": "string",
      "associated_with": "string|null",
      "date": "YYYY-MM-DD",
      "description": "string|null",
      "media_url": "string|null",
      "skill_ids": "string[]"
    }
  ],
  "volunteering": [
    {
      "role": "string",
      "institution": "string",
      "cause": "string|null",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD|null",
      "is_current": "boolean",
      "description": "string|null",
      "media_url": "string|null"
    }
  ],
  "accomplishments": [
    {
      "title": "string",
      "description": "string",
      "work_experience_id": "string|null"
    }
  ]
}

RULES:
1. STRICTLY follow the schema field names and types
2. Convert all dates to YYYY-MM-DD format
3. For enums, ONLY use specified values
4. For null fields, return null or omit
5. Return empty arrays for missing sections
6. NEVER include fields not in the schema
7. For skills, extract from job descriptions, projects, and dedicated skills sections
8. Return ONLY the JSON object with NO additional text
9. Extract accomplishments from work experience descriptions and achievement sections
10. Map volunteering organizations to "institution" field
`;

// Enhanced skill extraction functions
function extractSkillsFromText(text: string): string[] {
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

function calculateDuration(startDate: string | null, endDate: string | null): number {
  if (!startDate) return 0;
  
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  
  return Math.min(Math.round(diffYears * 10) / 10, 20); // Round to 1 decimal, cap at 20 years
}

export async function POST(request: NextRequest) {
  try {
    console.log(' CV Processing API called');

    // 1. Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    let payload: JWTPayload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    } catch (error) {
      console.error(' Token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (payload.role !== 'candidate') {
      return NextResponse.json(
        { error: 'Access denied. Only candidates can process CVs.' },
        { status: 403 }
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 3. Validate file
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    console.log(' Processing CV:', file.name, 'Size:', file.size);

    try {
      // 4. Process CV with Gemini AI
      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      if (!geminiApiKey) {
        throw new Error('Gemini API key not configured');
      }

      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString('base64');
      
      const result = await model.generateContent([
        { text: getCVExtractionPrompt() },
        {
          inlineData: {
            mimeType: file.type,
            data: base64Data
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      console.log(' AI response received, length:', text.length);
      
      // Parse the JSON response
      let rawExtractedData: ExtractedData;
      try {
        // Clean up any markdown formatting
        const cleanedText = text
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        rawExtractedData = JSON.parse(cleanedText);
        console.log(' JSON parsed successfully');
      } catch (parseError) {
        console.error(' Failed to parse AI response:', text);
        throw new Error('Invalid AI response format');
      }

      console.log(' Data extracted successfully');

      // 5. ENHANCED: Transform to UnifiedProfileData format with proper skills tracking
      const normalizedData = {
        // Basic info mapping
        first_name: rawExtractedData.basic_info.first_name || '',
        last_name: rawExtractedData.basic_info.last_name || '',
        phone1: rawExtractedData.basic_info.phone1 || '',
        phone2: rawExtractedData.basic_info.phone2 || '',
        location: rawExtractedData.basic_info.location || '',
        linkedin_url: rawExtractedData.basic_info.linkedin_url || '',
        github_url: rawExtractedData.basic_info.github_url || '',
        portfolio_url: rawExtractedData.basic_info.portfolio_url || '',
        personal_website: rawExtractedData.basic_info.personal_website || '',
        bio: rawExtractedData.basic_info.bio || '',
        about: rawExtractedData.basic_info.about || rawExtractedData.basic_info.bio || '',
        title: rawExtractedData.basic_info.title || '',
        years_of_experience: rawExtractedData.basic_info.years_of_experience || calculateYearsOfExperience(rawExtractedData.work_experiences),
        current_position: rawExtractedData.basic_info.current_position || '',
        industry: rawExtractedData.basic_info.industry || '',
        
        // Work experiences - exact mapping to your database schema
        work_experience: rawExtractedData.work_experiences.map(exp => ({
          title: exp.title,
          company: exp.company,
          employment_type: exp.employment_type,
          is_current: exp.is_current,
          start_date: exp.start_date,
          end_date: exp.end_date,
          location: exp.location,
          description: exp.description,
          job_source: '',
          skill_ids: [],
          media_url: '',
        })),

        // Education - exact mapping to your database schema
        education: rawExtractedData.educations.map(edu => ({
          degree_diploma: edu.degree_diploma,
          university_school: edu.university_school,
          field_of_study: edu.field_of_study,
          start_date: edu.start_date,
          end_date: edu.end_date,
          grade: edu.grade,
          activities_societies: '',
          skill_ids: [],
          media_url: '',
        })),

        // Certificates - exact mapping to your database schema
        certificates: rawExtractedData.certificates.map(cert => ({
          name: cert.name,
          issuing_authority: cert.issuing_authority,
          issue_date: cert.issue_date,
          expiry_date: cert.expiry_date,
          credential_id: cert.credential_id,
          credential_url: cert.credential_url,
          description: cert.description,
          media_url: cert.media_url,
        })),

        // Projects - exact mapping to your database schema
        projects: rawExtractedData.projects.map(proj => ({
          name: proj.name,
          description: proj.description,
          start_date: proj.start_date,
          end_date: proj.end_date,
          is_current: proj.is_current,
          role: proj.role,
          responsibilities: proj.responsibilities,
          technologies: proj.technologies,
          tools: proj.tools,
          methodologies: proj.methodologies,
          is_confidential: proj.is_confidential,
          can_share_details: proj.can_share_details,
          url: proj.url,
          repository_url: proj.repository_url,
          media_urls: proj.media_urls,
          skills_gained: proj.skills_gained,
        })),

        // Awards - exact mapping to your database schema
        awards: rawExtractedData.awards.map(award => ({
          title: award.title,
          offered_by: award.offered_by,
          associated_with: award.associated_with,
          date: award.date,
          description: award.description,
          media_url: award.media_url,
          skill_ids: award.skill_ids,
        })),

        // Volunteering - exact mapping to your database schema
        volunteering: rawExtractedData.volunteering.map(vol => ({
          role: vol.role,
          institution: vol.institution,
          cause: vol.cause,
          start_date: vol.start_date,
          end_date: vol.end_date,
          is_current: vol.is_current,
          description: vol.description,
          media_url: vol.media_url,
        })),

        // Skills - simple array for backward compatibility (will be populated from candidate_skills)
        skills: [],

        // ENHANCED: Candidate skills with proper source tracking
        candidate_skills: [
          // Skills from work experiences
          ...rawExtractedData.work_experiences.flatMap((exp, expIndex) => {
            const expSkills = [
              ...extractSkillsFromText(exp.title || ''),
              ...extractSkillsFromText(exp.description || ''),
              ...extractSkillsFromText(exp.company || '')
            ];
            
            return expSkills.map(skillName => ({
              skill_name: skillName,
              skill_source: 'work_experience',
              proficiency: 70,
              years_of_experience: calculateDuration(exp.start_date, exp.end_date),
              source_title: exp.title,
              source_company: exp.company,
              source_type: 'work_experience'
            }));
          }),
          
          // Skills from education
          ...rawExtractedData.educations.flatMap((edu, eduIndex) => {
            const eduSkills = [
              ...extractSkillsFromText(edu.field_of_study || ''),
              ...extractSkillsFromText(edu.degree_diploma || '')
            ];
            
            return eduSkills.map(skillName => ({
              skill_name: skillName,
              skill_source: 'education',
              proficiency: 60,
              years_of_experience: calculateDuration(edu.start_date, edu.end_date),
              source_title: edu.degree_diploma,
              source_institution: edu.university_school,
              source_type: 'education'
            }));
          }),
          
          // Skills from projects
          ...rawExtractedData.projects.flatMap((proj, projIndex) => {
            const projSkills = [
              ...(proj.technologies || []),
              ...(proj.tools || []),
              ...(proj.skills_gained || []),
              ...extractSkillsFromText(proj.description || '')
            ];
            
            return projSkills.map(skillName => ({
              skill_name: skillName,
              skill_source: 'project',
              proficiency: 65,
              years_of_experience: calculateDuration(proj.start_date, proj.end_date),
              source_title: proj.name,
              source_type: 'project'
            }));
          }),
          
          // Skills from certificates
          ...rawExtractedData.certificates.flatMap((cert, certIndex) => {
            const certSkills = [
              ...extractSkillsFromText(cert.name || ''),
              ...extractSkillsFromText(cert.description || '')
            ];
            
            return certSkills.map(skillName => ({
              skill_name: skillName,
              skill_source: 'certificate',
              proficiency: 75,
              years_of_experience: calculateDuration(cert.issue_date, null),
              source_title: cert.name,
              source_authority: cert.issuing_authority,
              source_type: 'certificate'
            }));
          }),
          
          // Skills from awards
          ...rawExtractedData.awards.flatMap((award, awardIndex) => {
            const awardSkills = [
              ...extractSkillsFromText(award.title || ''),
              ...extractSkillsFromText(award.description || '')
            ];
            
            return awardSkills.map(skillName => ({
              skill_name: skillName,
              skill_source: 'award',
              proficiency: 80,
              years_of_experience: 0,
              source_title: award.title,
              source_authority: award.offered_by,
              source_type: 'award'
            }));
          }),
          
          // Direct skills from CV skills section
          ...rawExtractedData.skills.map(skill => ({
            skill_name: typeof skill === 'string' ? skill : skill.name || '',
            skill_source: 'cv_skills_section',
            proficiency: typeof skill === 'object' && skill.proficiency ? skill.proficiency : 60,
            years_of_experience: 0,
            source_title: 'Skills Section',
            source_type: 'direct'
          }))
        ].filter(skill => 
          skill.skill_name && 
          skill.skill_name.trim().length > 1 && 
          skill.skill_name.length <= 100
        ),

        // Accomplishments
        accomplishments: (rawExtractedData.accomplishments || [])
        .map(acc => ({
          title: acc.title || '',
          description: acc.description || '',
          work_experience_id: acc.work_experience_id || null, // Fixed field name
        }))
        .filter(acc => 
          acc.title && acc.title.trim().length > 0 && 
          acc.description && acc.description.trim().length > 0
        ),

        // Empty arrays for sections not extracted
        cv_documents: [], // Will be populated when file is uploaded
      };

      // Remove duplicate skills (keep the one with highest proficiency)
      const skillMap = new Map<string, CandidateSkill>();
      normalizedData.candidate_skills.forEach(skill => {
        const existing = skillMap.get(skill.skill_name.toLowerCase());
        if (!existing || skill.proficiency > existing.proficiency) {
          skillMap.set(skill.skill_name.toLowerCase(), skill);
        }
      });
      
      normalizedData.candidate_skills = Array.from(skillMap.values());
      
      // Populate simple skills array from candidate_skills
      normalizedData.skills = normalizedData.candidate_skills.map(skill => skill.skill_name);

      // 6. Simple validation
      const validation = {
        isValid: !!(rawExtractedData.basic_info.first_name && rawExtractedData.basic_info.last_name),
        errors: [] as string[]
      };

      if (!rawExtractedData.basic_info.first_name) {
        validation.errors.push('First name not found');
      }
      if (!rawExtractedData.basic_info.last_name) {
        validation.errors.push('Last name not found');
      }
      if (rawExtractedData.work_experiences.length === 0 && rawExtractedData.educations.length === 0) {
        validation.errors.push('No work experience or education information found');
      }

      console.log(' CV processing completed successfully');
      console.log(' Skills extracted by source:', 
        normalizedData.candidate_skills.reduce((acc, skill) => {
          acc[skill.skill_source] = (acc[skill.skill_source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      );

      return NextResponse.json({
        success: true,
        message: 'CV processed successfully',
        extractedData: normalizedData,
        validation: validation,
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type,
        }
      });

    } catch (processingError) {
      console.error(' CV processing error:', processingError);
      return NextResponse.json(
        { 
          error: 'Failed to process CV',
          details: processingError instanceof Error ? processingError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error(' CV upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateYearsOfExperience(workExperiences: WorkExperience[]): number {
  if (!workExperiences.length) return 0;
  
  let totalMonths = 0;
  const now = new Date();

  for (const exp of workExperiences) {
    const startDate = new Date(exp.start_date);
    const endDate = exp.end_date ? new Date(exp.end_date) : now;
    
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth());
    totalMonths += Math.max(0, months);
  }

  return Math.round(totalMonths / 12);
}