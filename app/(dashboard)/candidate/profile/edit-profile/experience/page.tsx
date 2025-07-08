
'use client';

import { useState, useEffect } from 'react';
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
  Calendar,
  Building,
  Award
} from 'lucide-react';
import { useAuthGuard } from '@/app/api/auth/authGuard';

interface AccomplishmentFormData {
  id?: string;
  title: string;
  description: string;
  temp_work_experience_index?: number;
}

interface WorkExperienceFormData {
  id?: string;
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

interface ExperienceFormData {
  work_experiences: WorkExperienceFormData[];
  accomplishments: AccomplishmentFormData[];
}

export default function ExperienceEditPage() {
  const [isLoading, setIsLoading] = useState(true);
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
  } = useForm<ExperienceFormData>({
    defaultValues: {
      work_experiences: [],
      accomplishments: []
    }
  });

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: 'work_experiences'
  });

  const { fields: accomplishmentFields, append: appendAccomplishment, remove: removeAccomplishment } = useFieldArray({
    control,
    name: 'accomplishments'
  });

  const watchedExperiences = watch('work_experiences');

  // Load existing experience data
  useEffect(() => {
    const loadExperiences = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch('/api/candidate/profile/edit-profile/experience', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load experience data');
        }

        const result = await response.json();
        if (result.success && result.data) {
          // Set work experiences
          if (result.data.work_experiences?.length > 0) {
            setValue('work_experiences', result.data.work_experiences.map((exp: any) => ({
              id: exp.id,
              title: exp.title || '',
              company: exp.company || '',
              employment_type: exp.employment_type || 'full_time',
              is_current: exp.is_current || false,
              start_date: exp.start_date ? new Date(exp.start_date).toISOString().split('T')[0] : '',
              end_date: exp.end_date ? new Date(exp.end_date).toISOString().split('T')[0] : '',
              location: exp.location || '',
              description: exp.description || '',
              job_source: exp.job_source || '',
              skill_ids: exp.skill_ids || [],
              media_url: exp.media_url || '',
              accomplishments: exp.accomplishments || []
            })));
          }

          // Set standalone accomplishments
          if (result.data.accomplishments?.length > 0) {
            setValue('accomplishments', result.data.accomplishments.map((acc: any) => ({
              id: acc.id,
              title: acc.title || '',
              description: acc.description || '',
              temp_work_experience_index: acc.work_experience_id ? 
                result.data.work_experiences.findIndex((exp: any) => exp.id === acc.work_experience_id) : 
                undefined
            })));
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading experience data:', error);
        toast.error('Failed to load experience data');
        setIsLoading(false);
      }
    };

    loadExperiences();
  }, [setValue, router]);

  // Add new work experience
  const addExperience = () => {
    appendExperience({
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
    });
  };

  // Add new accomplishment
  const addAccomplishment = () => {
    appendAccomplishment({
      title: '',
      description: '',
      temp_work_experience_index: undefined
    });
  };

  // Form submission
  const onSubmit = async (data: ExperienceFormData) => {
    setIsSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Prepare data for API
      const requestData = {
        work_experiences: data.work_experiences.map(exp => ({
          ...exp,
          start_date: exp.start_date || null,
          end_date: exp.end_date || null,
          skill_ids: exp.skill_ids || [],
          accomplishments: exp.accomplishments || []
        })),
        accomplishments: data.accomplishments.map(acc => ({
          ...acc,
          temp_work_experience_index: acc.temp_work_experience_index
        }))
      };

      const response = await fetch('/api/candidate/profile/edit-profile/experience', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.details?.join(', ') || 'Failed to update experience');
      }

      const result = await response.json();
      if (result.success) {
        toast.success('Work experience updated successfully!');
        router.push('/candidate/profile/display-profile');
      } else {
        throw new Error(result.error || 'Update failed');
      }

    } catch (error) {
      console.error('Error updating experience:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update experience');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading work experience...</span>
        </div>
      </div>
    );
  }

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
                onClick={() => router.back()}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Work Experience</h1>
                <p className="text-gray-600">Manage your professional experience and accomplishments</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Work Experiences */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Work Experience
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addExperience}
                    className="flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Experience
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {experienceFields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No work experience added yet.</p>
                    <p className="text-sm">Click "Add Experience" to get started.</p>
                  </div>
                ) : (
                  experienceFields.map((field, index) => (
                    <Card key={field.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-gray-900">
                              Experience {index + 1}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExperience(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Job Title */}
                        <div>
                          <Label htmlFor={`experiences.${index}.title`}>Job Title *</Label>
                          <Input
                            {...register(`work_experiences.${index}.title`, { 
                              required: 'Job title is required' 
                            })}
                            placeholder="e.g., Senior Software Engineer"
                          />
                          {errors.work_experiences?.[index]?.title && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors.work_experiences[index]?.title?.message}
                            </p>
                          )}
                        </div>

                        {/* Company */}
                        <div>
                          <Label htmlFor={`experiences.${index}.company`}>Company *</Label>
                          <Input
                            {...register(`work_experiences.${index}.company`, { 
                              required: 'Company name is required' 
                            })}
                            placeholder="e.g., Google Inc."
                          />
                          {errors.work_experiences?.[index]?.company && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors.work_experiences[index]?.company?.message}
                            </p>
                          )}
                        </div>

                        {/* Employment Type */}
                        <div>
                          <Label htmlFor={`experiences.${index}.employment_type`}>Employment Type</Label>
                          <Select 
                            onValueChange={(value) => setValue(`work_experiences.${index}.employment_type`, value)}
                            defaultValue={watchedExperiences[index]?.employment_type || 'full_time'}
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
                          <Label htmlFor={`experiences.${index}.location`}>Location</Label>
                          <Input
                            {...register(`work_experiences.${index}.location`)}
                            placeholder="e.g., San Francisco, CA"
                          />
                        </div>

                        {/* Start Date */}
                        <div>
                          <Label htmlFor={`experiences.${index}.start_date`}>Start Date *</Label>
                          <Input
                            type="date"
                            {...register(`work_experiences.${index}.start_date`, { 
                              required: 'Start date is required' 
                            })}
                          />
                          {errors.work_experiences?.[index]?.start_date && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors.work_experiences[index]?.start_date?.message}
                            </p>
                          )}
                        </div>

                        {/* End Date */}
                        <div>
                          <Label htmlFor={`experiences.${index}.end_date`}>End Date</Label>
                          <Input
                            type="date"
                            {...register(`work_experiences.${index}.end_date`)}
                            disabled={watchedExperiences[index]?.is_current}
                          />
                          <div className="flex items-center space-x-2 mt-2">
                            <Checkbox
                              id={`experiences.${index}.is_current`}
                              checked={watchedExperiences[index]?.is_current || false}
                              onCheckedChange={(checked) => {
                                setValue(`work_experiences.${index}.is_current`, !!checked);
                                if (checked) {
                                  setValue(`work_experiences.${index}.end_date`, '');
                                }
                              }}
                            />
                            <Label htmlFor={`experiences.${index}.is_current`} className="text-sm">
                              I currently work here
                            </Label>
                          </div>
                        </div>

                        {/* Job Source */}
                        <div>
                          <Label htmlFor={`experiences.${index}.job_source`}>Job Source</Label>
                          <Input
                            {...register(`work_experiences.${index}.job_source`)}
                            placeholder="e.g., LinkedIn, Company Website"
                          />
                        </div>

                        {/* Media URL */}
                        <div>
                          <Label htmlFor={`experiences.${index}.media_url`}>Media/Portfolio URL</Label>
                          <Input
                            {...register(`work_experiences.${index}.media_url`)}
                            placeholder="https://..."
                          />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                          <Label htmlFor={`experiences.${index}.description`}>Job Description</Label>
                          <Textarea
                            {...register(`work_experiences.${index}.description`)}
                            placeholder="Describe your role, responsibilities, and achievements..."
                            rows={4}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
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
              </CardHeader>
              <CardContent className="space-y-4">
                {accomplishmentFields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No accomplishments added yet.</p>
                    <p className="text-sm">Click "Add Accomplishment" to highlight your achievements.</p>
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

                          {/* Link to Work Experience */}
                          <div>
                            <Label htmlFor={`accomplishments.${index}.temp_work_experience_index`}>
                              Link to Work Experience (Optional)
                            </Label>
                            <Select 
                              onValueChange={(value) => 
                                setValue(`accomplishments.${index}.temp_work_experience_index`, 
                                  value === 'none' ? undefined : parseInt(value)
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select work experience" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No specific experience</SelectItem>
                                {watchedExperiences.map((exp, expIndex) => (
                                  <SelectItem key={expIndex} value={expIndex.toString()}>
                                    {exp.title} at {exp.company}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                onClick={() => router.back()}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !isDirty}
                className="min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Experience
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}