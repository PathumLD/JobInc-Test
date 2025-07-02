import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

// You'll need to implement these based on your storage solution
// import { uploadResume } from '@/lib/supabase/upload';

interface CVDocument {
  original_filename: string;
  file_size: number;
  file_type: string;
  file_url: string;
  uploaded_at: string;
  is_primary: boolean;
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

interface Project {
  name: string;
  description: string;
  start_date: string;
  end_date: string | null;
  technologies: string[];
  url: string | null;
}

interface Skill {
  name: string;
  category: string | null;
  proficiency: number | null;
}

interface ExtractedData {
  basic_info: {
    first_name: string;
    last_name: string;
    additional_name: string | null;
    title: string;
    current_position: string | null;
    industry: string | null;
    bio: string;
    location: string;
    phone: string | null;
    personal_website: string | null;
    github_url: string | null;
    linkedin_url: string | null;
  };
  work_experiences: WorkExperience[];
  educations: Education[];
  projects: Project[];
  skills: Skill[];
}

const getCVExtractionPrompt = () => `
Extract candidate profile data from this CV and return STRICT JSON matching the EXACT structure:

{
  "basic_info": {
    "first_name": "string",
    "last_name": "string", 
    "additional_name": "string|null",
    "title": "string",
    "current_position": "string|null",
    "industry": "string|null", 
    "bio": "string",
    "location": "string",
    "phone": "string|null",
    "personal_website": "string|null",
    "github_url": "string|null",
    "linkedin_url": "string|null"
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
  "projects": [
    {
      "name": "string",
      "description": "string",
      "start_date": "YYYY-MM-DD", 
      "end_date": "YYYY-MM-DD|null",
      "technologies": "string[]",
      "url": "string|null"
    }
  ],
  "skills": [
    {
      "name": "string",
      "category": "string|null",
      "proficiency": "number|null (0-100)"
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
`;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    console.log('📤 Processing CV:', file.name, 'Size:', file.size);

    try {
      // 1. Process CV with Gemini AI
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
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
      
      // Parse the JSON response
      let extractedData: ExtractedData;
      try {
        extractedData = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse AI response:', text);
        throw new Error('Invalid AI response format');
      }

      console.log('✅ Data extracted successfully');

      // 2. Upload the file to storage (implement based on your storage solution)
      // const resumeUrl = await uploadResume(file, session.user.id);
      const resumeUrl = 'placeholder-url'; // Replace with actual upload logic
      
      // 3. Transform to your frontend format
      const normalizedData = {
        // Basic info mapping
        first_name: extractedData.basic_info.first_name || '',
        last_name: extractedData.basic_info.last_name || '',
        email: '', // Not extracted from CV
        phone: extractedData.basic_info.phone || '',
        location: extractedData.basic_info.location || '',
        linkedin_url: extractedData.basic_info.linkedin_url || '',
        github_url: extractedData.basic_info.github_url || '',
        portfolio_url: '',
        personal_website: extractedData.basic_info.personal_website || '',
        bio: extractedData.basic_info.bio || '',
        about: extractedData.basic_info.bio || '',
        title: extractedData.basic_info.title || '',
        years_of_experience: 0, // Calculate from work experience if needed
        current_position: extractedData.basic_info.current_position || '',
        industry: extractedData.basic_info.industry || '',
        
        // Arrays - use the correct field names for your form
        work_experiences: extractedData.work_experiences || [],
        educations: extractedData.educations || [],
        certificates: [], // Not extracted
        projects: extractedData.projects || [],
        awards: [], // Not extracted
        volunteering: [], // Not extracted
        skills: extractedData.skills || [],
        
        // CV Document
        cv_documents: [{
          original_filename: file.name,
          file_size: file.size,
          file_type: file.type,
          file_url: resumeUrl,
          uploaded_at: new Date().toISOString(),
          is_primary: true,
        }] as CVDocument[]
      };

      // 4. Simple validation
      const validation = {
        isValid: !!(extractedData.basic_info.first_name && extractedData.basic_info.last_name),
        errors: [] as string[]
      };

      if (!extractedData.basic_info.first_name) {
        validation.errors.push('First name not found');
      }
      if (!extractedData.basic_info.last_name) {
        validation.errors.push('Last name not found');
      }

      return NextResponse.json({
        success: true,
        resumeUrl,
        extractedData: normalizedData,
        validation: validation,
        message: 'CV processed and data normalized successfully'
      });

    } catch (processingError) {
      console.error('❌ CV processing error:', processingError);
      return NextResponse.json(
        { 
          error: 'Failed to process CV',
          details: processingError instanceof Error ? processingError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ CV upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}