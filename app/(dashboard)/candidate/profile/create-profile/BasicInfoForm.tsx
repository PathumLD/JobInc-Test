// app/profile/create-profile/BasicInfoForm.tsx
'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, User, Globe } from 'lucide-react';
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<UnifiedProfileData>();

  const bioValue = watch('bio');
  const aboutValue = watch('about');
  const cvDocuments = watch('cv_documents') || [];

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
        cv_documents: data.cv_documents || [],
      };

      // Log CV documents for debugging
      if (validatedData.cv_documents && validatedData.cv_documents.length > 0) {
        console.log('📄 CV documents to be saved:', validatedData.cv_documents);
      }

      // Update the parent component with validated data
      onUpdate(validatedData);
      toast.success('Basic information saved successfully!');
      // Move to next step
      onNext();
    } catch (error) {
      console.error('❌ Form validation error:', error);
      toast.error('Failed to save basic information');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
            />
            {errors.first_name && (
              <p className="text-sm text-red-600 mt-1">{errors.first_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="last_name">Last Name *</Label>
            <Input
              id="last_name"
              {...register('last_name', { required: 'Last name is required' })}
              placeholder="Enter your last name"
            />
            {errors.last_name && (
              <p className="text-sm text-red-600 mt-1">{errors.last_name.message}</p>
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
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            {...register('location')}
            placeholder="City, Country"
          />
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
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="current_position">Current Position</Label>
          <Input
            id="current_position"
            {...register('current_position')}
            placeholder="Your current job title"
          />
        </div>

        <div>
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            {...register('industry')}
            placeholder="e.g., Technology, Healthcare"
          />
        </div>

        <div>
          <Label htmlFor="years_of_experience">Years of Experience</Label>
          <Input
            id="years_of_experience"
            type="number"
            {...register('years_of_experience', { valueAsNumber: true })}
            placeholder="0"
            min="0"
          />
        </div>

        <div>
          <Label htmlFor="bio">Professional Bio</Label>
          <Textarea
            id="bio"
            {...register('bio')}
            placeholder="Brief professional summary"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">{bioValue?.length || 0}/100</p>
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
          />
          {errors.about && <p className="text-sm text-red-600 mt-1">{errors.about.message}</p>}
          <p className="text-xs text-gray-500 mt-1">{aboutValue?.length || 0}/500</p>
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
          />
        </div>

        <div>
          <Label htmlFor="portfolio_url">Portfolio URL</Label>
          <Input
            id="portfolio_url"
            type="url"
            {...register('portfolio_url')}
            placeholder="https://portfolio.com"
          />
        </div>

        <div>
          <Label htmlFor="github_url">GitHub URL</Label>
          <Input
            id="github_url"
            type="url"
            {...register('github_url')}
            placeholder="https://github.com/username"
          />
        </div>

        <div>
          <Label htmlFor="linkedin_url">LinkedIn URL</Label>
          <Input
            id="linkedin_url"
            type="url"
            {...register('linkedin_url')}
            placeholder="https://linkedin.com/in/username"
          />
        </div>
      </div>

      {/* CV Documents Display */}
      {cvDocuments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Uploaded Documents</h3>
          {cvDocuments.map((doc, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-md">
              <p className="font-medium">{doc.original_filename}</p>
              <p className="text-sm text-gray-600">
                Uploaded: {new Date(doc.uploaded_at).toLocaleString()}
              </p>
              {doc.is_primary && (
                <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  Primary
                </span>
              )}
            </div>
          ))}
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
  );
}

// Export the types for use in other components
export type BasicInfoFormValues = UnifiedProfileData;
export type { CVDocument };
