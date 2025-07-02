// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function extractCVData(file: File): Promise<CVData> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  
  // Convert file to base64
  const base64Data = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });

  const prompt = `
    Extract the following information from this CV/resume in JSON format:
    - first_name (string)
    - last_name (string)
    - email (string)
    - phone (string, optional)
    - title (string, optional)
    - bio (string, optional)
    - location (string, optional)
    - years_of_experience (number, optional)
    - experience_level (string: 'entry', 'junior', 'mid', 'senior', 'lead', or 'principal')
    - skills (array of strings)
    - education (array of {degree: string, institution: string, year: number})
    - work_experience (array of {position: string, company: string, duration: string, description: string})
    
    Return only the JSON object without any additional text or markdown formatting.
  `;

  const result = await model.generateContent([prompt, {
    inlineData: {
      data: base64Data,
      mimeType: file.type
    }
  }]);

  const response = result.response;
  const text = response.text();
  
  // Clean the response to get pure JSON
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}') + 1;
  const jsonString = text.substring(jsonStart, jsonEnd);
  
  return JSON.parse(jsonString);
}

interface CVData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  title?: string;
  bio?: string;
  location?: string;
  years_of_experience?: number;
  experience_level?: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'principal';
  skills?: string[];
  education?: {
    degree: string;
    institution: string;
    year: number;
  }[];
  work_experience?: {
    position: string;
    company: string;
    duration: string;
    description: string;
  }[];
}