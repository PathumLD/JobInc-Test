'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { uploadResume } from '@/lib/supabase/upload';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';

type CandidateProfile = {
  first_name: string;
  last_name: string;
  title: string;
  bio: string;
  location: string;
  remote_preference: string;
  experience_level: string;
  years_of_experience: string;
  expected_salary_min: string;
  expected_salary_max: string;
  currency: string;
  availability_status: string;
  availability_date: string;
  resume_url: string;
  portfolio_url: string;
  github_url: string;
  linkedin_url: string;
  personal_website: string;
  profile_completion_percentage: string;
};

// Helper function to extract user ID from JWT token
function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
    return payload.userId || null;
  } catch {
    return null;
  }
}

export default function CandidateProfileForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [isExtracting, setIsExtracting] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  const { 
    register, 
    handleSubmit, 
    setValue, 
    reset,
    formState: { errors }, 
    watch 
  } = useForm<CandidateProfile>();

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

  // Fetch existing profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        // API call to get profile data
        const response = await fetch('/api/candidate/profile/display-profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            return;
          }
          throw new Error('Failed to fetch profile');
        }

        const { candidate } = await response.json();
        
        if (candidate) {
          // Reset form with existing values
          reset({
            ...candidate,
            // Convert numbers to strings for form fields
            years_of_experience: candidate.years_of_experience?.toString() || '',
            expected_salary_min: candidate.expected_salary_min?.toString() || '',
            expected_salary_max: candidate.expected_salary_max?.toString() || '',
            profile_completion_percentage: candidate.profile_completion_percentage?.toString() || '0',
            availability_date: candidate.availability_date?.split('T')[0] || '',
          });
          
          if (candidate.resume_url) {
            setResumeUrl(candidate.resume_url);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setMessage('Failed to load profile data');
        setMessageType('error');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProfile();
  }, [reset]);

  // Enhanced function to extract data from resume using Gemini AI
  const extractResumeData = async (file: File) => {
    setIsExtracting(true);
    setMessage('Extracting data from your CV... This may take a moment.');
    setMessageType('success');

    try {
      // Validate API key
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured');
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString('base64');

      // Enhanced prompt for better data extraction
      const prompt = `
      You are an expert CV/Resume parser. Extract the following information from this resume and return ONLY a valid JSON object with no additional text, comments, or formatting:

      {
        "first_name": "First name of the candidate",
        "last_name": "Last name of the candidate", 
        "title": "Professional title or current job title",
        "bio": "A professional 3-4 sentence summary highlighting key skills, experience, and career objectives",
        "location": "Current location (City, Country format)",
        "years_of_experience": "Total years of professional experience (number only)",
        "github_url": "GitHub profile URL if mentioned",
        "linkedin_url": "LinkedIn profile URL if mentioned", 
        "portfolio_url": "Portfolio or personal website URL if mentioned",
        "personal_website": "Personal website URL if different from portfolio"
      }

      Rules:
      - For years_of_experience, calculate based on work history dates and return only the number
      - For bio, create a compelling professional summary based on experience and skills mentioned
      - Only include URLs that are explicitly mentioned in the resume
      - If any field cannot be determined, use an empty string ""
      - Return ONLY the JSON object, no other text
      `;

      // Generate content with the AI
      const result = await model.generateContent([
        { text: prompt },
        {
          inlineData: {
            mimeType: file.type,
            data: base64Data
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      console.log('Raw AI response:', text); // For debugging
      
      // Clean and parse the JSON response
      let cleanedText = text.trim();
      
      // Remove any markdown code block formatting
      cleanedText = cleanedText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      
      // Find JSON object boundaries
      const jsonStart = cleanedText.indexOf('{');
      const jsonEnd = cleanedText.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No valid JSON found in response');
      }
      
      const jsonString = cleanedText.slice(jsonStart, jsonEnd);
      console.log('Extracted JSON:', jsonString); // For debugging
      
      const resumeData = JSON.parse(jsonString);
      
      // Validate the parsed data
      if (typeof resumeData !== 'object' || resumeData === null) {
        throw new Error('Invalid data structure received');
      }

      // Auto-fill the form with extracted data (only if fields are not empty)
      const fieldsToUpdate = [
        'first_name', 'last_name', 'title', 'bio', 'location', 
        'years_of_experience', 'github_url', 'linkedin_url', 
        'portfolio_url', 'personal_website'
      ];

      let updatedFields = 0;
      fieldsToUpdate.forEach(field => {
        if (resumeData[field] && resumeData[field].toString().trim() !== '') {
          setValue(field as keyof CandidateProfile, resumeData[field].toString().trim());
          updatedFields++;
        }
      });

      if (updatedFields > 0) {
        setMessage(`Successfully extracted and filled ${updatedFields} fields from your CV!`);
        setMessageType('success');
      } else {
        setMessage('CV processed, but no data could be extracted. Please fill the form manually.');
        setMessageType('error');
      }

    } catch (error) {
      console.error('Error extracting resume data:', error);
      let errorMessage = 'Failed to extract data from CV. Please fill the form manually.';
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'AI service is not properly configured. Please contact support.';
        } else if (error.message.includes('JSON')) {
          errorMessage = 'Could not parse CV content. Please ensure it\'s a clear, readable PDF.';
        }
      }
      
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsExtracting(false);
    }
  };

  // Calculate profile completion percentage
  const watchedFields = watch([
    'first_name', 'last_name', 'title', 'bio', 'location', 
    'years_of_experience', 'expected_salary_min', 'expected_salary_max',
    'portfolio_url', 'github_url', 'linkedin_url', 'personal_website'
  ]);
  
  useEffect(() => {
    const calculateCompletion = () => {
      const requiredFields = [
        'first_name', 'last_name', 'title', 'bio', 'location', 
        'years_of_experience', 'expected_salary_min', 'expected_salary_max'
      ];
      
      const optionalFields = [
        'portfolio_url', 'github_url', 'linkedin_url', 'personal_website'
      ];
      
      const resumeComplete = resumeUrl || resumeFile;
      
      const requiredCompleted = requiredFields.filter(field => {
        const fieldIndex = ['first_name', 'last_name', 'title', 'bio', 'location', 'years_of_experience', 'expected_salary_min', 'expected_salary_max', 'portfolio_url', 'github_url', 'linkedin_url', 'personal_website'].indexOf(field);
        return watchedFields[fieldIndex] && watchedFields[fieldIndex].toString().trim() !== '';
      }).length;
      
      const optionalCompleted = optionalFields.filter(field => {
        const fieldIndex = ['first_name', 'last_name', 'title', 'bio', 'location', 'years_of_experience', 'expected_salary_min', 'expected_salary_max', 'portfolio_url', 'github_url', 'linkedin_url', 'personal_website'].indexOf(field);
        return watchedFields[fieldIndex] && watchedFields[fieldIndex].toString().trim() !== '';
      }).length;
      
      const requiredWeight = 70;
      const optionalWeight = 20;
      const resumeWeight = 10;
      
      const requiredScore = (requiredCompleted / requiredFields.length) * requiredWeight;
      const optionalScore = (optionalCompleted / optionalFields.length) * optionalWeight;
      const resumeScore = resumeComplete ? resumeWeight : 0;
      
      const totalScore = Math.round(requiredScore + optionalScore + resumeScore);
      setValue('profile_completion_percentage', totalScore.toString());
    };

    calculateCompletion();
  }, [JSON.stringify(watchedFields), resumeUrl, resumeFile, setValue]);

  // Handle file selection for resume upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setMessage('Please select a PDF file for your CV.');
        setMessageType('error');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('CV file size must be less than 5MB.');
        setMessageType('error');
        return;
      }
      
      setMessage(null);
      setResumeFile(file);
      
      // Automatically extract data when file is selected
      await extractResumeData(file);
    }
  };

  // Handle form submission
  const onSubmit = async (data: CandidateProfile) => {
  setLoading(true);
  setMessage(null);

  try {
    // Validate token
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage("Please log in to continue.");
      setMessageType('error');
      setTimeout(() => window.location.href = '/login', 1500);
      return;
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      setMessage("Your session has expired. Please log in again.");
      setMessageType('error');
      localStorage.removeItem('token');
      setTimeout(() => window.location.href = '/login', 1500);
      return;
    }

    let uploadedResumeUrl = resumeUrl;

    // Handle file upload with comprehensive error handling
    if (resumeFile) {
      try {
        setMessage('Uploading resume... Please wait.');
        setMessageType('success');
        
        uploadedResumeUrl = await uploadResume(resumeFile, userId);
        setResumeUrl(uploadedResumeUrl);
        
        setMessage('Resume uploaded successfully! Saving profile...');
      } catch (uploadError: any) {
        console.error('Resume upload failed:', uploadError);
        
        let errorMessage = 'Failed to upload resume. ';
        if (uploadError.message.includes('PDF')) {
          errorMessage += 'Please ensure you\'re uploading a PDF file.';
        } else if (uploadError.message.includes('5MB')) {
          errorMessage += 'File size must be less than 5MB.';
        } else if (uploadError.message.includes('ERR_NAME_NOT_RESOLVED')) {
          errorMessage += 'Network connection issue. Please check your internet connection.';
        } else {
          errorMessage += 'Please try again or contact support.';
        }
        
        setMessage(errorMessage);
        setMessageType('error');
        return;
      }
    }

    // Prepare submission data
    const submissionData = {
      ...data,
      resume_url: uploadedResumeUrl,
      years_of_experience: data.years_of_experience || null,
      expected_salary_min: data.expected_salary_min || null,
      expected_salary_max: data.expected_salary_max || null,
      profile_completion_percentage: data.profile_completion_percentage || "0",
    };

    // Submit to API
    const response = await fetch('/api/candidate/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(submissionData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        setMessage("Session expired. Redirecting to login...");
        setMessageType('error');
        setTimeout(() => window.location.href = '/login', 1500);
        return;
      }

      
      
      const result = await response.json();
      throw new Error(result.error || `Server error (${response.status})`);
    }

    const result = await response.json();
    setMessage(result.message || 'Profile saved successfully!');
    setMessageType('success');
    setResumeFile(null);
    
    // Redirect after success
    setTimeout(() => {
      router.push('/candidate/profile/display-profile');
    }, 1500);
    
  } catch (err: any) {
    console.error('Submit error:', err);
    
    let errorMessage = 'An error occurred while saving your profile. ';
    
    if (err.message.includes('Failed to fetch') || err.message.includes('ERR_NAME_NOT_RESOLVED')) {
      errorMessage = 'Network error: Please check your internet connection and try again.';
    } else if (err.message.includes('upload')) {
      errorMessage = 'File upload failed. Please try with a smaller file or check your connection.';
    } else if (err.message.includes('required')) {
      errorMessage = err.message;
    } else {
      errorMessage += 'Please try again or contact support if the problem persists.';
    }
    
    setMessage(errorMessage);
    setMessageType('error');
  } finally {
    setLoading(false);
  }
  
};

  // Add this function to handle close confirm
  const handleConfirmClose = () => {
    setShowCloseDialog(false);
    router.push('/candidate/profile/display-profile');
  };

  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Loading Profile...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Candidate Profile</h2>
          <div className="text-sm text-gray-600">
            Profile Completion: {watch('profile_completion_percentage')}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${watch('profile_completion_percentage')}%` }}
            ></div>
          </div>
        </div>

        {/* CV Upload Section - Moved to top */}
        <div className="space-y-4 border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50">
          <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
            🤖 Smart CV Upload
          </h3>
          <p className="text-sm text-blue-700">
            Upload your CV and let AI automatically fill out the form fields for you!
          </p>
          
          <div>
            <Label htmlFor="cv-upload" className="text-blue-900">Upload Your CV (PDF, max 5MB)</Label>
            <Input
              id="cv-upload"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 border-blue-300 focus:border-blue-500"
              disabled={isExtracting}
            />
            {resumeUrl && (
              <div className="mt-2">
                <a 
                  href={resumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  📄 View Current CV
                </a>
              </div>
            )}
          </div>
        </div>

        {message && (
          <div className={`p-2 rounded-lg text-center font-medium ${
            messageType === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {isExtracting && (
          <div className="p-2 rounded-lg text-center bg-blue-100 text-blue-800 border border-blue-200">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span>AI is analyzing your CV... This may take a moment.</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
            
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input 
                id="first_name"
                {...register("first_name", { required: "First name is required" })} 
                className={errors.first_name ? "border-red-500" : ""}
              />
              {errors.first_name && <span className="text-red-500 text-xs">{errors.first_name.message}</span>}
            </div>

            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input 
                id="last_name"
                {...register("last_name", { required: "Last name is required" })} 
                className={errors.last_name ? "border-red-500" : ""}
              />
              {errors.last_name && <span className="text-red-500 text-xs">{errors.last_name.message}</span>}
            </div>

            <div>
              <Label htmlFor="title">Professional Title *</Label>
              <Input 
                id="title"
                placeholder="e.g., Software Engineer, Data Scientist"
                {...register("title", { required: "Title is required" })} 
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
            </div>

            <div>
              <Label htmlFor="bio">Professional Bio *</Label>
              <Textarea 
                id="bio"
                placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                {...register("bio", { required: "Bio is required" })} 
                className={`min-h-[100px] ${errors.bio ? "border-red-500" : ""}`}
              />
              {errors.bio && <span className="text-red-500 text-xs">{errors.bio.message}</span>}
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Input 
                id="location"
                placeholder="City, Country"
                {...register("location", { required: "Location is required" })} 
                className={errors.location ? "border-red-500" : ""}
              />
              {errors.location && <span className="text-red-500 text-xs">{errors.location.message}</span>}
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Information</h3>
            
            <div>
              <Label htmlFor="remote_preference">Remote Work Preference</Label>
              <select 
                id="remote_preference"
                {...register("remote_preference")} 
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="flexible">Flexible</option>
                <option value="remote_only">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>

            <div>
              <Label htmlFor="experience_level">Experience Level</Label>
              <select 
                id="experience_level"
                {...register("experience_level")} 
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="entry">Entry Level</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="principal">Principal</option>
              </select>
            </div>

            <div>
              <Label htmlFor="years_of_experience">Years of Experience *</Label>
              <Input 
                id="years_of_experience"
                type="number" 
                min="0"
                max="50"
                {...register("years_of_experience", { 
                  required: "Years of experience is required",
                  min: { value: 0, message: "Years must be 0 or greater" }
                })} 
                className={errors.years_of_experience ? "border-red-500" : ""}
              />
              {errors.years_of_experience && <span className="text-red-500 text-xs">{errors.years_of_experience.message}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expected_salary_min">Min Salary *</Label>
                <Input 
                  id="expected_salary_min"
                  type="number" 
                  min="0"
                  {...register("expected_salary_min", { required: "Minimum salary is required" })} 
                  className={errors.expected_salary_min ? "border-red-500" : ""}
                />
                {errors.expected_salary_min && <span className="text-red-500 text-xs">{errors.expected_salary_min.message}</span>}
              </div>
              <div>
                <Label htmlFor="expected_salary_max">Max Salary *</Label>
                <Input 
                  id="expected_salary_max"
                  type="number" 
                  min="0"
                  {...register("expected_salary_max", { required: "Maximum salary is required" })} 
                  className={errors.expected_salary_max ? "border-red-500" : ""}
                />
                {errors.expected_salary_max && <span className="text-red-500 text-xs">{errors.expected_salary_max.message}</span>}
              </div>
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <select 
                id="currency"
                {...register("currency")} 
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="LKR">LKR</option>
                <option value="INR">INR</option>
              </select>
            </div>

            <div>
              <Label htmlFor="availability_status">Availability Status</Label>
              <select 
                id="availability_status"
                {...register("availability_status")} 
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="available">Available</option>
                <option value="open_to_opportunities">Open to Opportunities</option>
                <option value="not_looking">Not Looking</option>
              </select>
            </div>

            <div>
              <Label htmlFor="availability_date">Available From</Label>
              <Input 
                id="availability_date"
                type="date" 
                {...register("availability_date")} 
              />
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Links</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="portfolio_url">Portfolio URL</Label>
              <Input 
                id="portfolio_url"
                type="url"
                placeholder="https://your-portfolio.com"
                {...register("portfolio_url")} 
              />
            </div>

            <div>
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input 
                id="github_url"
                type="url"
                placeholder="https://github.com/username"
                {...register("github_url")} 
              />
            </div>

            <div>
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input 
                id="linkedin_url"
                type="url"
                placeholder="https://linkedin.com/in/username"
                {...register("linkedin_url")} 
              />
            </div>

            <div>
              <Label htmlFor="personal_website">Personal Website</Label>
              <Input 
                id="personal_website"
                type="url"
                placeholder="https://your-website.com"
                {...register("personal_website")} 
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button 
            type="submit" 
            disabled={loading || isExtracting} 
            className="w-full sm:w-auto py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Saving Profile..." : isExtracting ? "Processing CV..." : "Save Profile"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto py-3 text-lg font-semibold border border-gray-400"
            onClick={() => setShowCloseDialog(true)}
            disabled={loading || isExtracting}
          >
            Close
          </Button>
        </div>
      </form>
      {/* Confirm Close Dialog */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Confirm Close</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to close? Unsaved changes will be lost.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleConfirmClose}>
              Yes, Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}