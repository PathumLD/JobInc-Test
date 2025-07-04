// app/profile/create-profile/BasicInfoForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
//import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
//import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, User, Globe, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import type { UnifiedProfileData, CVDocument } from '@/lib/data-transformer';

interface BasicInfoFormProps {
  initialData?: Partial<UnifiedProfileData>;
  onUpdate: (data: UnifiedProfileData) => void;
  onNext: () => void;
}

export default function BasicInfoForm({
  onUpdate,
  onNext
}: BasicInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useFormContext<UnifiedProfileData>();

  // Watch form state for CV-related data and form fields
  const bioValue = watch('bio');
  const aboutValue = watch('about');
  const cvDocuments = watch('cv_documents') || [];
  const cvProcessingStatus = watch('cv_processing_status') || 'none';
  const cvExtractionCompleted = watch('cv_extraction_completed') || false;
  const uploadedCvIds = watch('uploaded_cv_ids') || [];

  // Watch all form fields to track changes
  const firstName = watch('first_name');
  const lastName = watch('last_name');
  const email = watch('email');
  const phone = watch('phone');
  const location = watch('location');
  const title = watch('title');
  const currentPosition = watch('current_position');
  const industry = watch('industry');
  const yearsOfExperience = watch('years_of_experience');
  const personalWebsite = watch('personal_website');
  const portfolioUrl = watch('portfolio_url');
  const githubUrl = watch('github_url');
  const linkedinUrl = watch('linkedin_url');

  // Initialize form with existing data on component mount
  useEffect(() => {
    if (!formInitialized) {
      console.log('📋 Initializing BasicInfoForm with existing data...');
      
      // Check if there's existing form data
      const existingData = getValues();
      
      if (existingData) {
        console.log('📊 Found existing form data:', {
          hasBasicInfo: !!(existingData.first_name && existingData.last_name),
          hasCvDocuments: (existingData.cv_documents || []).length > 0,
          cvProcessingStatus: existingData.cv_processing_status || 'none',
          cvExtractionCompleted: existingData.cv_extraction_completed || false
        });
      }
      
      setFormInitialized(true);
    }
  }, [getValues, formInitialized]);

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get CV processing status display
  const getCvStatusDisplay = () => {
    if (cvDocuments.length === 0) return null;

    const statusConfig = {
      completed: {
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        message: 'CV data has been automatically extracted and populated in the form fields below.'
      },
      failed: {
        icon: AlertCircle,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        message: 'CV was uploaded successfully but automatic data extraction failed. Please fill the form manually.'
      },
      none: {
        icon: FileText,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        message: 'CV is uploaded and ready. Data extraction was not attempted.'
      }
    };

    const config = statusConfig[cvProcessingStatus as keyof typeof statusConfig] || statusConfig.none;
    const Icon = config.icon;

    return (
      <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 mb-6`}>
        <div className="flex items-start space-x-3">
          <Icon className={`h-5 w-5 ${config.color} mt-0.5`} />
          <div>
            <h3 className={`text-sm font-medium ${config.textColor}`}>
              CV Processing Status: {cvProcessingStatus.charAt(0).toUpperCase() + cvProcessingStatus.slice(1)}
            </h3>
            <p className={`text-sm ${config.textColor} mt-1`}>
              {config.message}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const onSubmit = async (data: UnifiedProfileData) => {
    setIsSubmitting(true);
    try {
      // Ensure all required arrays exist
      const validatedData: UnifiedProfileData = {
        ...data,
        work_experience: data.work_experience || [],
        education: data.education || [],
        certificates: data.certificates || [],
        projects: data.projects || [],
        awards: data.awards || [],
        volunteering: data.volunteering || [],
        skills: data.skills || [],
        candidate_skills: data.candidate_skills || [],
        accomplishments: data.accomplishments || [],
        cv_documents: data.cv_documents || [],
        
        // Ensure CV-related form state is preserved
        cv_processing_status: data.cv_processing_status || 'none',
        cv_extraction_completed: data.cv_extraction_completed || false,
        uploaded_cv_ids: data.uploaded_cv_ids || [],
      };

      // Log CV documents for debugging
      if (validatedData.cv_documents && validatedData.cv_documents.length > 0) {
        console.log(' CV documents to be preserved:', validatedData.cv_documents);
        console.log(' CV processing status:', validatedData.cv_processing_status);
        console.log(' CV extraction completed:', validatedData.cv_extraction_completed);
      }

      // Validate required fields
      if (!validatedData.first_name || !validatedData.last_name) {
        toast.error('First name and last name are required');
        return;
      }

      if (!validatedData.title) {
        toast.error('Professional title is required');
        return;
      }

      if (!validatedData.about || validatedData.about.length < 50) {
        toast.error('About section is required and should be at least 50 characters');
        return;
      }

      // Update the parent component with validated data
      onUpdate(validatedData);
      
      // Success message based on CV status
      if (cvExtractionCompleted) {
        toast.success('Basic information saved successfully! CV data has been preserved.');
      } else {
        toast.success('Basic information saved successfully!');
      }
      
      // Move to next step
      onNext();
    } catch (error) {
      console.error(' Form validation error:', error);
      toast.error('Failed to save basic information');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* CV Processing Status Display */}
      {getCvStatusDisplay()}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Information Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                {...register('first_name', { required: 'First name is required' })}
                placeholder="Enter your first name"
                className={firstName ? 'bg-blue-50' : ''}
              />
              {errors.first_name && (
                <p className="text-sm text-red-600 mt-1">{errors.first_name.message}</p>
              )}
              {firstName && cvExtractionCompleted && (
                <p className="text-xs text-blue-600 mt-1">✓ Auto-filled from CV</p>
              )}
            </div>

            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                {...register('last_name', { required: 'Last name is required' })}
                placeholder="Enter your last name"
                className={lastName ? 'bg-blue-50' : ''}
              />
              {errors.last_name && (
                <p className="text-sm text-red-600 mt-1">{errors.last_name.message}</p>
              )}
              {lastName && cvExtractionCompleted && (
                <p className="text-xs text-blue-600 mt-1">✓ Auto-filled from CV</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Enter your email address"
              className={email ? 'bg-blue-50' : ''}
            />
            {email && cvExtractionCompleted && (
              <p className="text-xs text-blue-600 mt-1">✓ Auto-filled from CV</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="Enter your phone number"
              className={phone ? 'bg-blue-50' : ''}
            />
            {phone && cvExtractionCompleted && (
              <p className="text-xs text-blue-600 mt-1">✓ Auto-filled from CV</p>
            )}
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="City, Country"
              className={location ? 'bg-blue-50' : ''}
            />
            {location && cvExtractionCompleted && (
              <p className="text-xs text-blue-600 mt-1">✓ Auto-filled from CV</p>
            )}
          </div>
        </div>

        {/* Professional Information Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Professional Information</h2>

          <div>
            <Label htmlFor="title">Professional Title *</Label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="e.g., Software Engineer"
              className={title ? 'bg-blue-50' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
            {title && cvExtractionCompleted && (
              <p className="text-xs text-blue-600 mt-1">✓ Auto-filled from CV</p>
            )}
          </div>

          <div>
            <Label htmlFor="current_position">Current Position</Label>
            <Input
              id="current_position"
              {...register('current_position')}
              placeholder="Your current job title"
              className={currentPosition ? 'bg-blue-50' : ''}
            />
            {currentPosition && cvExtractionCompleted && (
              <p className="text-xs text-blue-600 mt-1">✓ Auto-filled from CV</p>
            )}
          </div>

          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              {...register('industry')}
              placeholder="e.g., Technology, Healthcare"
              className={industry ? 'bg-blue-50' : ''}
            />
            {industry && cvExtractionCompleted && (
              <p className="text-xs text-blue-600 mt-1">✓ Auto-filled from CV</p>
            )}
          </div>

          <div>
            <Label htmlFor="years_of_experience">Years of Experience</Label>
            <Input
              id="years_of_experience"
              type="number"
              {...register('years_of_experience', { valueAsNumber: true })}
              placeholder="0"
              min="0"
              className={yearsOfExperience ? 'bg-blue-50' : ''}
            />
            {yearsOfExperience && cvExtractionCompleted && (
              <p className="text-xs text-blue-600 mt-1">✓ Auto-calculated from CV</p>
            )}
          </div>

          <div>
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              placeholder="Brief professional summary"
              rows={3}
              className={bioValue ? 'bg-blue-50' : ''}
            />
            <p className="text-xs text-gray-500 mt-1">{bioValue?.length || 0}/100</p>
            {bioValue && cvExtractionCompleted && (
              <p className="text-xs text-blue-600 mt-1">✓ Auto-filled from CV</p>
            )}
          </div>

          <div>
            <Label htmlFor="about">About Me *</Label>
            <Textarea
              id="about"
              {...register('about', { 
                required: 'About section is required',
                minLength: { value: 50, message: 'About should be at least 50 characters' }
              })}
              placeholder="Tell us about yourself, your goals, and what you're looking for"
              rows={4}
              className={aboutValue ? 'bg-blue-50' : ''}
            />
            {errors.about && <p className="text-sm text-red-600 mt-1">{errors.about.message}</p>}
            <p className="text-xs text-gray-500 mt-1">{aboutValue?.length || 0}/500</p>
            {aboutValue && cvExtractionCompleted && (
              <p className="text-xs text-blue-600 mt-1">✓ Auto-filled from CV</p>
            )}
          </div>
        </div>

        {/* Online Presence Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Online Presence
          </h2>

          <div>
            <Label htmlFor="personal_website">Personal Website</Label>
            <Input
              id="personal_website"
              type="url"
              {...register('personal_website')}
              placeholder="https://yourwebsite.com"
              className={personalWebsite ? 'bg-blue-50' : ''}
            />
            {personalWebsite && cvExtractionCompleted && (
              <p className="text-xs text-blue-600 mt-1">✓ Auto-filled from CV</p>
            )}
          </div>

          <div>
            <Label htmlFor="portfolio_url">Portfolio URL</Label>
            <Input
              id="portfolio_url"
              type="url"
              {...register('portfolio_url')}
              placeholder="https://portfolio.com"
              className={portfolioUrl ? 'bg-blue-50' : ''}
            />
            {portfolioUrl && cvExtractionCompleted && (
              <p className="text-xs text-blue-600 mt-1">✓ Auto-filled from CV</p>
            )}
          </div>

          <div>
            <Label htmlFor="github_url">GitHub URL</Label>
            <Input
              id="github_url"
              type="url"
              {...register('github_url')}
              placeholder="https://github.com/username"
              className={githubUrl ? 'bg-blue-50' : ''}
            />
            {githubUrl && cvExtractionCompleted && (
              <p className="text-xs text-blue-600 mt-1">✓ Auto-filled from CV</p>
            )}
          </div>

          <div>
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input
              id="linkedin_url"
              type="url"
              {...register('linkedin_url')}
              placeholder="https://linkedin.com/in/username"
              className={linkedinUrl ? 'bg-blue-50' : ''}
            />
            {linkedinUrl && cvExtractionCompleted && (
              <p className="text-xs text-blue-600 mt-1">✓ Auto-filled from CV</p>
            )}
          </div>
        </div>

        {/* CV Documents Display */}
        {cvDocuments.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Uploaded Documents ({cvDocuments.length})
            </h3>
            <div className="space-y-3">
              {cvDocuments.map((doc, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {doc.original_filename}
                        {doc.is_primary && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            Primary
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Size: {formatFileSize(doc.file_size)} • 
                        Uploaded: {new Date(doc.uploaded_at).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Status: {cvProcessingStatus === 'completed' ? 'Data extracted' : 
                                cvProcessingStatus === 'failed' ? 'Extraction failed' : 'No extraction'}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {cvProcessingStatus === 'completed' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {cvProcessingStatus === 'failed' && (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      {cvProcessingStatus === 'none' && (
                        <FileText className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Preservation Notice */}
        {cvDocuments.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Data Preservation</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Your CV files and {cvExtractionCompleted ? 'extracted data' : 'form data'} will be preserved 
                  when navigating between form sections. All information will be saved when you complete the profile.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save & Continue'
          )}
        </Button>
      </form>
    </div>
  );
}

// Export the types for use in other components
export type BasicInfoFormValues = UnifiedProfileData;
export type { CVDocument };