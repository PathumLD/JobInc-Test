// app/mis/jobs/[id]/edit/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { updateJobSchema, UpdateJobData } from '@/lib/validations/job';
import { fetchJobForEdit, updateJob } from '@/app/api/jobs/jobs';
import { Job, JobStatus } from '@/lib/types/jobs/job';
import { useAuthGuard } from '@/app/api/auth/authGuard';

// Import form components (these would be shared with create job form)
import BasicInfoSection from '@/components/mis/jobs/form/BasicInfoSection';
import CompanyInfoSection from '@/components/mis/jobs/form/CompanyInfoSection';
import JobDetailsSection from '@/components/mis/jobs/form/JobDetailsSection';
import SalarySection from '@/components/mis/jobs/form/SalarySection';
import SettingsSection from '@/components/mis/jobs/form/SettingsSection';
import ContentSection from '@/components/mis/jobs/form/ContentSection';
import SkillsSection from '@/components/mis/jobs/form/SkillsSection';

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Protect this page - only MIS users can access
  useAuthGuard('mis');

  const form = useForm<UpdateJobData>({
    resolver: zodResolver(updateJobSchema),
    defaultValues: {
      title: '',
      description: '',
      requirements: '',
      responsibilities: '',
      benefits: '',
      job_type: 'full_time',
      experience_level: 'mid_level',
      location: '',
      remote_type: 'onsite',
      salary_min: undefined,
      salary_max: undefined,
      currency: 'USD',
      salary_type: 'annual',
      equity_offered: false,
      ai_skills_required: false,
      application_deadline: undefined,
      status: JobStatus.DRAFT,
      priority_level: 1,
      customCompanyName: '',
      customCompanyEmail: '',
      customCompanyPhone: '',
      customCompanyWebsite: '',
      skills: []
    }
  });

  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  const loadJob = async () => {
  try {
    setIsLoading(true);
    setError(null);
    
    const jobData = await fetchJobForEdit(jobId);
    setJob(jobData);
    
    // Map database values back to form values for experience level
    const mapDbExperienceLevelToForm = (dbLevel: string) => {
      const mapping: Record<string, string> = {
        'entry': 'entry_level',
        'junior': 'entry_level', // Map junior to entry_level as fallback
        'mid': 'mid_level',
        'senior': 'senior_level',
        'lead': 'executive_level',
        'principal': 'executive_level'
      };
      return mapping[dbLevel] || dbLevel;
    };

    // Map database values back to form values for job type
    const mapDbJobTypeToForm = (dbType: string) => {
      // Most job types should match, but handle any special cases
      const mapping: Record<string, string> = {
        'full_time': 'full_time',
        'part_time': 'part_time',
        'contract': 'contract',
        'internship': 'internship',
        'freelance': 'freelance'
      };
      return mapping[dbType] || dbType;
    };

    // Map database values back to form values for required/proficiency levels
    const mapDbRequiredLevelToForm = (dbLevel: string) => {
      const mapping: Record<string, string> = {
        'nice_to_have': 'nice_to_have',
        'preferred': 'preferred',
        'required': 'required',
        'must_have': 'must_have'
      };
      return mapping[dbLevel] || dbLevel;
    };

    const mapDbProficiencyLevelToForm = (dbLevel: string) => {
      const mapping: Record<string, string> = {
        'beginner': 'beginner',
        'intermediate': 'intermediate',
        'advanced': 'advanced',
        'expert': 'expert'
      };
      return mapping[dbLevel] || dbLevel;
    };
    
    // Populate form with job data
    form.reset({
      title: jobData.title,
      description: jobData.description,
      requirements: jobData.requirements || '',
      responsibilities: jobData.responsibilities || '',
      benefits: jobData.benefits || '',
      job_type: mapDbJobTypeToForm(jobData.job_type),
      experience_level: mapDbExperienceLevelToForm(jobData.experience_level),
      location: jobData.location || '',
      remote_type: jobData.remote_type,
      salary_min: jobData.salary_min,
      salary_max: jobData.salary_max,
      currency: jobData.currency,
      salary_type: jobData.salary_type,
      equity_offered: jobData.equity_offered,
      ai_skills_required: jobData.ai_skills_required,
      application_deadline: jobData.application_deadline?.split('T')[0], // Convert to date string
      status: jobData.status,
      priority_level: jobData.priority_level,
      customCompanyName: jobData.customCompanyName || '',
      customCompanyEmail: jobData.customCompanyEmail || '',
      customCompanyPhone: jobData.customCompanyPhone || '',
      customCompanyWebsite: jobData.customCompanyWebsite || '',
      skills: jobData.skills?.map(skill => ({
        skill_name: skill.skill?.name || '',
        required_level: mapDbRequiredLevelToForm(skill.required_level),
        proficiency_level: mapDbProficiencyLevelToForm(skill.proficiency_level),
        years_required: skill.years_required,
        weight: skill.weight
      })) || []
    });

    toast.success('Job loaded successfully');
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load job';
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setIsLoading(false);
  }
};

  const onSubmit = async (data: UpdateJobData) => {
    try {
      setIsSaving(true);
      
      // Show loading toast
      const loadingToast = toast.loading('Updating job...');
      
      // Convert date string back to ISO string for API
      const submitData = {
        ...data,
        application_deadline: data.application_deadline 
          ? new Date(data.application_deadline).toISOString()
          : undefined
      };
      
      const updatedJob = await updateJob(jobId, submitData);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Job updated successfully!', {
        description: `"${updatedJob.title}" has been updated.`,
        action: {
          label: 'View Job',
          onClick: () => router.push(`/mis/jobs/jobs/${updatedJob.id}`)
        }
      });
      
      // Update local job state
      setJob(updatedJob);
      
      // Small delay before redirect for UX
      setTimeout(() => {
        router.push(`/mis/jobs/jobs/${updatedJob.id}`);
      }, 1000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update job';
      toast.error('Failed to update job', {
        description: errorMessage,
        action: {
          label: 'Try Again',
          onClick: () => form.handleSubmit(onSubmit)()
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndPublish = async () => {
    const formData = form.getValues();
    formData.status = JobStatus.PUBLISHED;
    
    try {
      setIsSaving(true);
      
      // Show loading toast
      const loadingToast = toast.loading('Publishing job...');
      
      // Convert date string back to ISO string for API
      const submitData = {
        ...formData,
        application_deadline: formData.application_deadline 
          ? new Date(formData.application_deadline).toISOString()
          : undefined
      };
      
      const updatedJob = await updateJob(jobId, submitData);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Job published successfully!', {
        description: `"${updatedJob.title}" is now live and accepting applications.`,
        action: {
          label: 'View Job',
          onClick: () => router.push(`/mis/jobs/jobs/${updatedJob.id}`)
        }
      });
      
      // Update local job state
      setJob(updatedJob);
      
      // Small delay before redirect for UX
      setTimeout(() => {
        router.push(`/mis/jobs/jobs/${updatedJob.id}`);
      }, 1000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish job';
      toast.error('Failed to publish job', {
        description: errorMessage,
        action: {
          label: 'Try Again',
          onClick: () => handleSaveAndPublish()
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const isDirty = form.formState.isDirty;
    
    if (isDirty) {
      toast('Unsaved changes detected', {
        description: 'Are you sure you want to leave without saving?',
        action: {
          label: 'Leave anyway',
          onClick: () => router.push(`/mis/jobs/jobs/${jobId}`)
        },
        cancel: {
          label: 'Stay',
          onClick: () => {}
        }
      });
    } else {
      router.push(`/mis/jobs/jobs/${jobId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading job...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Job</h2>
            <p className="text-gray-600 mb-4">{error || 'Job not found'}</p>
            <div className="space-y-2">
              <Button onClick={() => router.push('/mis/jobs/jobs')} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
              <Button variant="outline" onClick={loadJob} className="w-full">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleCancel}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Job
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Edit Job</h1>
                <p className="text-sm text-gray-600">{job.title}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/mis/jobs/jobs/${jobId}`)}
                disabled={isSaving}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSaving}
                variant="outline"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Draft
              </Button>
              
              <Button 
                onClick={handleSaveAndPublish}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save & Publish
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Basic details about the job position
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BasicInfoSection form={form} />
                  </CardContent>
                </Card>

                {/* Company Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>
                      Information about the hiring company
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CompanyInfoSection form={form} />
                  </CardContent>
                </Card>

                {/* Job Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Job Details</CardTitle>
                    <CardDescription>
                      Specific requirements and job characteristics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <JobDetailsSection form={form} />
                  </CardContent>
                </Card>

                {/* Salary Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Salary Information</CardTitle>
                    <CardDescription>
                      Compensation details for the position
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SalarySection form={form} />
                  </CardContent>
                </Card>

                {/* Content Sections */}
                <Card>
                  <CardHeader>
                    <CardTitle>Job Content</CardTitle>
                    <CardDescription>
                      Detailed description, requirements, and responsibilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ContentSection form={form} />
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle>Required Skills</CardTitle>
                    <CardDescription>
                      Skills and experience requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SkillsSection form={form} />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Job Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Job Settings</CardTitle>
                    <CardDescription>
                      Publication and priority settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SettingsSection form={form} />
                  </CardContent>
                </Card>

                {/* Job Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Job Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="text-sm font-medium capitalize">{job.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Created</span>
                      <span className="text-sm">{new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Updated</span>
                      <span className="text-sm">{new Date(job.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Views</span>
                      <span className="text-sm">{job.views_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Applications</span>
                      <span className="text-sm">{job.applications_count}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Save Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                    
                    <Button 
                      type="button"
                      variant="outline" 
                      className="w-full"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>

                    <Button 
                      type="button"
                      variant="secondary" 
                      className="w-full"
                      onClick={handleSaveAndPublish}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save & Publish
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}