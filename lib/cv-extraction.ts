// lib/cv-extraction.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ExtractedData {
  basic_info?: {
    first_name: string;
    last_name: string;
    additional_name?: string;
    title?: string;
    current_position?: string;
    industry?: string;
    bio?: string;
    about?: string;
    location?: string;
    phone1?: string;
    phone2?: string;
    years_of_experience?: number;
    expected_salary_min?: number;
    expected_salary_max?: number;
    currency?: string;
    availability_status?: 'available' | 'open_to_opportunities' | 'not_looking';
    availability_date?: string;
    resume_url?: string;
    portfolio_url?: string;
    personal_website?: string;
    github_url?: string;
    linkedin_url?: string;
  };
  work_experiences?: Array<{
    title: string;
    company: string;
    employment_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance' | 'volunteer';
    is_current: boolean;
    start_date: string;
    end_date?: string;
    location?: string;
    description?: string;
  }>;
  educations?: Array<{
    degree_diploma: string;
    university_school: string;
    field_of_study?: string;
    start_date: string;
    end_date?: string;
    grade?: string;
  }>;
  certificates?: Array<{
    name: string;
    issuing_authority: string;
    issue_date?: string;
    expiry_date?: string;
    credential_id?: string;
    credential_url?: string;
    description?: string;
    media_url?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    start_date?: string;
    end_date?: string;
    technologies?: string[];
    url?: string;
  }>;
  skills?: Array<{
    name: string;
    category?: string;
    proficiency?: number;
  }>;
  awards?: Array<{
    title: string;
    associated_with?: string;
    offered_by: string;
    date: string;
    description?: string;
  }>;
  volunteering?: Array<{
    role: string;
    organization: string;
    start_date: string;
    end_date?: string;
    description?: string;
    location?: string;
    cause?: string;
    is_current: boolean;
  }>;
  accomplishments?: Array<{
    title: string;
    description?: string;
  }>;
}

export const CV_EXTRACTION_PROMPT = `
Extract candidate profile data from this CV/Resume and return ONLY valid JSON in the exact structure below. 

CRITICAL RULES:
1. Return ONLY JSON with NO markdown, explanations, or additional text
2. Use exact field names as specified
3. Convert all dates to YYYY-MM-DD format (use January 1st if only year provided)
4. Return empty arrays [] for missing sections
5. Use null for missing optional fields
6. Be thorough - extract ALL information found

REQUIRED JSON STRUCTURE:
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
    "years_of_experience": "number|null",
    "portfolio_url": "string|null",
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
      "description": "string|null"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "start_date": "YYYY-MM-DD|null",
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
  ],
  "accomplishments": [
    {
      "title": "string",
      "description": "string|null"
    }
  ]
}

EXTRACTION GUIDELINES:
- Look for certificates in sections like: Certifications, Licenses, Training, Courses, Professional Development
- Extract skills from dedicated Skills section and also from job descriptions
- For employment_type: full_time (default), part_time, contract, internship, freelance, volunteer
- Extract accomplishments from any achievements, honors, or notable contributions mentioned
- If current position, set is_current: true and end_date: null
- Extract ALL information thoroughly - don't skip sections
`;

export const extractJSONFromText = (text: string): any => {
  try {
    // Remove any markdown formatting
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Find JSON boundaries
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No valid JSON found in response');
    }
    
    const jsonString = cleanText.slice(jsonStart, jsonEnd);
    const parsed = JSON.parse(jsonString);
    
    console.log(' JSON parsed successfully');
    return parsed;
  } catch (error) {
    console.error(' Error parsing JSON:', error);
    console.error('Raw text:', text.substring(0, 1000));
    throw new Error('Failed to parse extracted data as JSON');
  }
};

export const processExtractedData = async (file: File): Promise<ExtractedData> => {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.1, // Lower temperature for more consistent extraction
      topP: 0.8,
      topK: 40,
    }
  });
  
  try {
    console.log(' Processing file:', file.name, file.type);
    
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
    
    console.log(' AI Response received, length:', responseText.length);
    console.log(' Raw AI response preview:', responseText.substring(0, 500) + '...');
    
    const extractedData = extractJSONFromText(responseText);
    
    // Log extraction summary
    console.log(' Extracted data summary:', {
      basic_info: !!extractedData.basic_info,
      work_experiences: extractedData.work_experiences?.length || 0,
      educations: extractedData.educations?.length || 0,
      certificates: extractedData.certificates?.length || 0,
      projects: extractedData.projects?.length || 0,
      skills: extractedData.skills?.length || 0,
      awards: extractedData.awards?.length || 0,
      volunteering: extractedData.volunteering?.length || 0,
      accomplishments: extractedData.accomplishments?.length || 0,
    });
    
    return extractedData;
  } catch (error) {
    console.error(' Error in processExtractedData:', error);
    if (error instanceof Error) {
      throw new Error(`CV processing failed: ${error.message}`);
    }
    throw new Error('CV processing failed: Unknown error');
  }
};