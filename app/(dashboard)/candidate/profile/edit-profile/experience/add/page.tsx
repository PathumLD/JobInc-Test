// app/(dashboard)/candidate/profile/edit/experience/add/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Briefcase,
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  Award
} from 'lucide-react';
import { useAuthGuard } from '@/app/api/auth/authGuard';

interface AccomplishmentFormData {
  title: string;
  description: string;
}

interface WorkExperienceFormData {
  title: string;
  company: string;
  employment_type: string;
  is_current: boolean;
  start_date: string;
  end_date: string;
  location: string;
  description: string;
  job_source: string;
  skill_ids: string[];
  media_url: string;
  accomplishments: AccomplishmentFormData[];
}

export default function AddExperiencePage() {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useAuthGuard('candidate');

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<WorkExperienceFormData>({
    defaultValues: {
      title: '',
      company: '',
      employment_type: 'full_time',
      is_current: false,
      start_date: '',
      end_date: '',
      location: '',
      description: '',
      job_source: '',
      skill_ids: [],
      media_url: '',
      accomplishments: []
    }
  });

  const { fields: accomplishmentFields, append: appendAccomplishment, remove: removeAccomplishment } = useFieldArray({
    control,
    name: 'accomplishments'
  });

  const watchedValues = watch();

  // Add new accomplishment
  const addAccomplishment = () => {
    appendAccomplishment({
      title: '',
      description: ''
    });
  };

  // Form submission
  const onSubmit = async (data: WorkExperienceFormData) => {
    setIsSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Prepare data for API
      const requestData = {
        ...data,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        skill_ids: data.skill_ids || [],
        accomplishments: data.accomplishments || []
      };

      const response = await fetch('/api/candidate/profile/edit-profile/experience/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.details?.join(', ') || 'Failed to add experience');
      }

      const result = await response.json();
      if (result.success) {
        toast.success('Experience added successfully!');
        router.push('/candidate/profile/display-profile');
      } else {
        throw new Error(result.error || 'Add failed');
      }

    } catch (error) {
      console.error('Error adding experience:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add experience');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/candidate/profile/edit/experience')}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Experience
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add Experience</h1>
                <p className="text-gray-600">Add a new work experience to your profile</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Work Experience Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Experience Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Job Title */}
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    {...register('title', { required: 'Job title is required' })}
                    placeholder="e.g., Senior Software Engineer"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                  )}
                </div>

                {/* Company */}
                <div>
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    {...register('company', { required: 'Company name is required' })}
                    placeholder="e.g., Google Inc."
                  />
                  {errors.company && (
                    <p className="text-sm text-red-600 mt-1">{errors.company.message}</p>
                  )}
                </div>

                {/* Employment Type */}
                <div>
                  <Label htmlFor="employment_type">Employment Type</Label>
                  <Select 
                    onValueChange={(value) => setValue('employment_type', value)}
                    defaultValue="full_time"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    {...register('location')}
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    type="date"
                    {...register('start_date', { required: 'Start date is required' })}
                  />
                  {errors.start_date && (
                    <p className="text-sm text-red-600 mt-1">{errors.start_date.message}</p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    type="date"
                    {...register('end_date')}
                    disabled={watchedValues.is_current}
                  />
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="is_current"
                      checked={watchedValues.is_current}
                      onCheckedChange={(checked) => {
                        setValue('is_current', !!checked);
                        if (checked) {
                          setValue('end_date', '');
                        }
                      }}
                    />
                    <Label htmlFor="is_current" className="text-sm">
                      I currently work here
                    </Label>
                  </div>
                </div>

                {/* Job Source */}
                <div>
                  <Label htmlFor="job_source">Job Source</Label>
                  <Input
                    {...register('job_source')}
                    placeholder="e.g., LinkedIn, Company Website"
                  />
                </div>

                {/* Media URL */}
                <div>
                  <Label htmlFor="media_url">Media/Portfolio URL</Label>
                  <Input
                    {...register('media_url')}
                    placeholder="https://..."
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    {...register('description')}
                    placeholder="Describe your role, responsibilities, and key achievements..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Accomplishments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Accomplishments
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAccomplishment}
                    className="flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Accomplishment
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Add key accomplishments and achievements for this role
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {accomplishmentFields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-600 mb-2">No accomplishments added yet</p>
                    <p className="text-sm text-gray-500">
                      Click "Add Accomplishment" to highlight your key achievements in this role
                    </p>
                  </div>
                ) : (
                  accomplishmentFields.map((field, index) => (
                    <Card key={field.id} className="border-l-4 border-l-green-500">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Award className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-gray-900">
                                Accomplishment {index + 1}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAccomplishment(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Title */}
                          <div>
                            <Label htmlFor={`accomplishments.${index}.title`}>Title *</Label>
                            <Input
                              {...register(`accomplishments.${index}.title`, { 
                                required: 'Accomplishment title is required' 
                              })}
                              placeholder="e.g., Led team to increase sales by 150%"
                            />
                            {errors.accomplishments?.[index]?.title && (
                              <p className="text-sm text-red-600 mt-1">
                                {errors.accomplishments[index]?.title?.message}
                              </p>
                            )}
                          </div>

                          {/* Description */}
                          <div>
                            <Label htmlFor={`accomplishments.${index}.description`}>Description</Label>
                            <Textarea
                              {...register(`accomplishments.${index}.description`)}
                              placeholder="Describe your accomplishment in detail..."
                              rows={3}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/candidate/profile/edit/experience')}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="min-w-[140px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Add Experience
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Tips for adding experience:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use specific job titles that accurately reflect your role</li>
              <li>• Include quantifiable accomplishments when possible</li>
              <li>• Describe your responsibilities and impact in the role</li>
              <li>• Add accomplishments that demonstrate your value and growth</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}