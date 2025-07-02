// lib/cv-extraction.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ExtractedData {
  basic_info?: {
    [key: string]: string | null | number;
    first_name: string;
    last_name: string;
    additional_name: string | null;
    title: string;
    current_position: string | null;
    industry: string | null;
    bio: string;
    about: string;
    location: string;
    phone: string | null;
    phone_type: 'mobile' | 'home' | 'work' | 'other' | null;
    years_of_experience: number | null;
    expected_salary_min: number | null;
    expected_salary_max: number | null;
    currency: string | null;
    availability_status: 'available' | 'open_to_opportunities' | 'not_looking' | null;
    availability_date: string | null;
    resume_url: string | null;
    portfolio_url: string | null;
    personal_website: string | null;
    github_url: string | null;
    linkedin_url: string | null;
  };
  work_experiences?: Array<{
    title: string;
    company: string;
    employment_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance' | 'volunteer';
    is_current: boolean;
    start_date: string;
    end_date: string | null;
    location: string | null;
    description: string | null;
  }>;
  educations?: Array<{
    degree_diploma: string;
    university_school: string;
    field_of_study: string | null;
    start_date: string;
    end_date: string | null;
    grade: string | null;
  }>;
  certificates?: Array<{
    name: string;
    issuing_authority: string;
    issue_date: string | null;
    expiry_date: string | null;
    credential_id: string | null;
    credential_url: string | null;
    description: string | null;
    media_url: string | null;
  }>;
  // Alternative certificate field names that might be returned by AI
  certifications?: Array<{
    name?: string;
    title?: string;
    issuing_authority?: string;
    issuer?: string;
    organization?: string;
    issue_date?: string;
    date?: string;
    expiry_date?: string;
    credential_id?: string;
    credential_url?: string;
    description?: string;
    media_url?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    start_date: string;
    end_date: string | null;
    technologies: string[];
    url: string | null;
  }>;
  skills?: Array<{
    name: string;
    category: string | null;
    proficiency: number | null;
  }>;
  awards?: Array<{
    title: string;
    associated_with: string | null;
    offered_by: string;
    date: string;
    description: string | null;
  }>;
  volunteering?: Array<{
    role: string;
    organization: string;
    start_date: string;
    end_date: string | null;
    description: string | null;
    location: string | null;
    cause: string | null;
    is_current: boolean;
  }>;
}

export const CV_EXTRACTION_PROMPT = `
Extract candidate profile data from this CV and return STRICT JSON matching the EXACT structure.

CRITICAL CERTIFICATE EXTRACTION RULES:
1. ALWAYS use "certificates" as the field name (never "certifications")
2. Look for certificates in ALL sections: Certifications, Licenses, Professional Credentials, Training, Courses, etc.
3. Extract EVERY certificate found, even if mentioned briefly
4. If no certificates found, return empty array: "certificates": []

{
  "basic_info": {
    "first_name": "string",
    "last_name": "string",
    "additional_name": "string|null",
    "title": "string",
    "current_position": "string|null",
    "industry": "string|null",
    "bio": "string",
    "about": "string",
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
      "employment_type": "full_time|part_time|contract|internship|freelance|volunteer",
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
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD|null",
      "technologies": ["string"],
      "url": "string|null"
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
      "associated_with": "string|null",
      "offered_by": "string",
      "date": "YYYY-MM-DD",
      "description": "string|null"
    }
  ],
  "volunteering": [
    {
      "role": "string",
      "organization": "string",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD|null",
      "description": "string|null",
      "location": "string|null",
      "cause": "string|null",
      "is_current": "boolean"
    }
  ]
}

EXAMPLE CERTIFICATE EXTRACTION:
- "AWS Certified Solutions Architect, Amazon Web Services, 2023" becomes:
  {"name": "AWS Certified Solutions Architect", "issuing_authority": "Amazon Web Services", "issue_date": "2023-01-01"}
- "Google Analytics Certified" becomes:
  {"name": "Google Analytics Certified", "issuing_authority": "Google"}

GENERAL RULES:
1. Return ONLY valid JSON with NO additional text
2. Use exact field names as specified
3. Convert dates to YYYY-MM-DD format
4. Return empty arrays for missing sections
5. Use null for missing optional fields
6. Be thorough - extract ALL certificates found
`;

export const extractJSONFromText = (text: string): any => {
  try {
    // Remove any markdown formatting
    let cleanText = text.replace(/``````\n?/g, '');
    
    // Find JSON boundaries
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No valid JSON found in response');
    }
    
    const jsonString = cleanText.slice(jsonStart, jsonEnd);
    const parsed = JSON.parse(jsonString);
    
    console.log('✅ JSON parsed successfully');
    return parsed;
  } catch (error) {
    console.error('❌ Error parsing JSON:', error);
    console.error('Raw text:', text);
    throw new Error('Failed to parse extracted data as JSON');
  }
};

export const processExtractedData = async (file: File): Promise<ExtractedData> => {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  try {
    console.log('📤 Processing file:', file.name, file.type);
    
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    
    const result = await model.generateContent([
      { text: CV_EXTRACTION_PROMPT },
      {
        inlineData: {
          mimeType: file.type,
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    const responseText = response.text();
    
    console.log('🤖 AI Response received, length:', responseText.length);
    console.log('📄 Raw AI response:', responseText.substring(0, 500) + '...');
    
    const extractedData = extractJSONFromText(responseText);
    
    console.log('🔍 Extracted data structure:', {
      basic_info: !!extractedData.basic_info,
      work_experiences: extractedData.work_experiences?.length || 0,
      educations: extractedData.educations?.length || 0,
      certificates: extractedData.certificates?.length || 0,
      certifications: extractedData.certifications?.length || 0,
      projects: extractedData.projects?.length || 0,
      skills: extractedData.skills?.length || 0,
      awards: extractedData.awards?.length || 0,
      volunteering: extractedData.volunteering?.length || 0,
    });
    
    return extractedData;
  } catch (error) {
    console.error('❌ Error in processExtractedData:', error);
    throw error;
  }
};
