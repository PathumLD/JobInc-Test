// app/(dashboard)/candidate/profile/edit/experience/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Award,
  AlertTriangle
} from 'lucide-react';
import { useAuthGuard } from '@/app/api/auth/authGuard';

interface AccomplishmentFormData {
  id?: string;
  title: string;
  description: string;
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

export default function ExperienceAddEditPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();
  const params = useParams();
  
  const experienceId = params.id as string;
  const isEditing = experienceId && experienceId !== 'add';

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

  // Load existing experience data for editing
  useEffect(() => {
    const loadExperience = async () => {
      if (!isEditing) {
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`/api/candidate/profile/edit-profile/experience/${experienceId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Experience not found');
            router.push('/candidate/profile/edit-profile/experience');
            return;
          }
          throw new Error('Failed to load experience data');
        }

        const result = await response.json();
        if (result.success && result.data) {
          const exp = result.data;
          
          // Set form values
          setValue('id', exp.id);
          setValue('title', exp.title || '');
          setValue('company', exp.company || '');
          setValue('employment_type', exp.employment_type || 'full_time');
          setValue('is_current', exp.is_current || false);
          setValue('start_date', exp.start_date ? new Date(exp.start_date).toISOString().split('T')[0] : '');
          setValue('end_date', exp.end_date ? new Date(exp.end_date).toISOString().split('T')[0] : '');
          setValue('location', exp.location || '');
          setValue('description', exp.description || '');
          setValue('job_source', exp.job_source || '');
          setValue('skill_ids', exp.skill_ids || []);
          setValue('media_url', exp.media_url || '');
          setValue('accomplishments', exp.accomplishments || []);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading experience data:', error);
        toast.error('Failed to load experience data');
        router.push('/candidate/profile/edit-profile/experience');
      }
    };

    loadExperience();
  }, [isEditing, experienceId, setValue, router]);

  // Add new accomplishment
  const addAccomplishment = () => {
    appendAccomplishment({
      title: '',
      description: ''
    });
  };

  // Delete experience
  const handleDelete = async () => {
    if (!isEditing) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/candidate/profile/edit-profile/experience/${experienceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete experience');
      }

      toast.success('Experience deleted successfully');
      router.push('/candidate/profile/edit-profile/experience');
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast.error('Failed to delete experience');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Form submission
  const onSubmit = async (data: WorkExperienceFormData) => {
    setIsSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const requestData = {
        ...data,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        skill_ids: data.skill_ids || [],
        accomplishments: data.accomplishments || []
      };

      const url = isEditing 
        ? `/api/candidate/profile/edit-profile/experience/${experienceId}`
        : '/api/candidate/profile/edit-profile/experience/add';

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.details?.join(', ') || 'Failed to save experience');
      }

      const result = await response.json();
      if (result.success) {
        toast.success(`Experience ${isEditing ? 'updated' : 'added'} successfully!`);
        router.push('/candidate/profile/display-profile');
      } else {
        throw new Error(result.error || 'Save failed');
      }

    } catch (error) {
      console.error('Error saving experience:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save experience');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading experience...</span>
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
                onClick={() => router.push('/candidate/profile/display-profile')}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Experience
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Edit Experience' : 'Add Experience'}
                </h1>
                <p className="text-gray-600">
                  {isEditing ? 'Update your work experience details' : 'Add a new work experience'}
                </p>
              </div>
            </div>
            {isEditing && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="flex items-center bg-red-400 hover:bg-red-600 text-white"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-1" />
                )}
                Delete
              </Button>
            )}
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
                    defaultValue={watchedValues.employment_type}
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
                <span className="text-sm text-gray-500 px-8">
                    <li>You can add accomplishments related to this experience.</li>
                    
                </span>
              </CardHeader>
              <CardContent className="space-y-4">
                {accomplishmentFields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No your accomplishments added yet.</p>
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
                disabled={isSaving || (!isDirty && isEditing)}
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
                    {isEditing ? 'Update Experience' : 'Add Experience'}
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Delete Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    Are you sure you want to delete this experience? This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        'Delete Experience'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}