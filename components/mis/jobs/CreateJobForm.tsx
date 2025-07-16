'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Building2, 
  DollarSign,  
  Star,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

import { jobFormSchema, JobFormData } from '@/lib/validations/job';
import { createJob } from '@/app/api/jobs/jobs';
import { fetchAccessibleCompanies } from '@/app/api/companies/companies';
import { 
  JobType, 
  ExperienceLevel, 
  RemoteType, 
  SalaryType, 
  JobStatus,
  RequiredLevel,
  ProficiencyLevel,
  CreateJobRequest 
} from '@/lib/types/jobs/job';
import { CompanyOption } from '@/lib/types/company/company';

interface CreateJobFormProps {
  onSuccess?: (jobId: string) => void;
  onCancel?: () => void;
}

export default function CreateJobForm({ onSuccess, onCancel }: CreateJobFormProps) {
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [useCustomCompany, setUseCustomCompany] = useState(false);

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: '',
      description: '',
      requirements: '',
      responsibilities: '',
      benefits: '',
      job_type: JobType.FULL_TIME,
      experience_level: ExperienceLevel.MID,
      location: '',
      remote_type: RemoteType.HYBRID,
      salary_min: '',
      salary_max: '',
      currency: 'USD',
      salary_type: SalaryType.ANNUAL,
      equity_offered: false,
      ai_skills_required: false,
      application_deadline: '',
      status: JobStatus.DRAFT,
      priority_level: 1,
      company_id: '',
      customCompanyName: '',
      customCompanyEmail: '',
      customCompanyPhone: '',
      customCompanyWebsite: '',
      skills: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'skills'
  });

  // Load companies on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const companiesData = await fetchAccessibleCompanies();
        setCompanies(companiesData);
      } catch (error) {
        console.error('Error loading companies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Watch for company selection changes
  const selectedCompanyId = form.watch('company_id');
  useEffect(() => {
    if (selectedCompanyId && selectedCompanyId !== '') {
      setUseCustomCompany(false);
      // Clear custom company fields
      form.setValue('customCompanyName', '');
      form.setValue('customCompanyEmail', '');
      form.setValue('customCompanyPhone', '');
      form.setValue('customCompanyWebsite', '');
    }
  }, [selectedCompanyId, form]);

  const handleCustomCompanyToggle = () => {
    setUseCustomCompany(!useCustomCompany);
    if (!useCustomCompany) {
      // Clear company selection
      form.setValue('company_id', '');
    } else {
      // Clear custom company fields
      form.setValue('customCompanyName', '');
      form.setValue('customCompanyEmail', '');
      form.setValue('customCompanyPhone', '');
      form.setValue('customCompanyWebsite', '');
    }
  };

  const addSkill = () => {
    append({
      skill_name: '',
      required_level: RequiredLevel.REQUIRED,
      proficiency_level: ProficiencyLevel.INTERMEDIATE,
      years_required: '',
      weight: '1'
    });
  };

  const onSubmit = async (data: JobFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Transform form data to API format
      // Ensure application_deadline is sent as YYYY-MM-DD if present
      let applicationDeadline: string | undefined = undefined;
      if (data.application_deadline && data.application_deadline.trim() !== '') {
        // Validate the date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(data.application_deadline)) {
          applicationDeadline = data.application_deadline;
        }
      }

      const jobData: CreateJobRequest = {
        title: data.title,
        description: data.description,
        requirements: data.requirements || undefined,
        responsibilities: data.responsibilities || undefined,
        benefits: data.benefits || undefined,
        job_type: data.job_type,
        experience_level: data.experience_level,
        location: data.location || undefined,
        remote_type: data.remote_type,
        salary_min: data.salary_min ? parseFloat(data.salary_min) : undefined,
        salary_max: data.salary_max ? parseFloat(data.salary_max) : undefined,
        currency: data.currency,
        salary_type: data.salary_type,
        equity_offered: data.equity_offered,
        ai_skills_required: data.ai_skills_required,
        application_deadline: applicationDeadline,
        status: data.status,
        priority_level: data.priority_level,
        company_id: useCustomCompany ? undefined : (data.company_id || undefined),
        customCompanyName: useCustomCompany ? data.customCompanyName : undefined,
        customCompanyEmail: useCustomCompany ? data.customCompanyEmail : undefined,
        customCompanyPhone: useCustomCompany ? data.customCompanyPhone : undefined,
        customCompanyWebsite: useCustomCompany ? data.customCompanyWebsite : undefined,
        skills: data.skills.map(skill => ({
          skill_name: skill.skill_name.trim(),
          required_level: skill.required_level,
          proficiency_level: skill.proficiency_level,
          years_required: skill.years_required ? parseFloat(skill.years_required) : undefined,
          weight: skill.weight ? parseFloat(skill.weight) : 1.0
        }))
      };

      const createdJob = await createJob(jobData);
      console.log('Job created successfully:', createdJob);
      
      if (onSuccess) {
        onSuccess(createdJob.id);

      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create job');
      console.error('Error creating job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading form data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>
        <p className="text-gray-600 mt-1">Fill in the details to create a new job posting</p>
      </div>

      {submitError && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{submitError}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Job Details</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Basic Job Information
                  </CardTitle>
                  <CardDescription>
                    Essential details about the job position
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Senior Software Engineer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide a detailed description of the role..."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum 50 characters required
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="job_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select job type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={JobType.FULL_TIME}>Full Time</SelectItem>
                              <SelectItem value={JobType.PART_TIME}>Part Time</SelectItem>
                              <SelectItem value={JobType.CONTRACT}>Contract</SelectItem>
                              <SelectItem value={JobType.INTERNSHIP}>Internship</SelectItem>
                              <SelectItem value={JobType.FREELANCE}>Freelance</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="experience_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience Level *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select experience level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={ExperienceLevel.ENTRY}>Entry Level</SelectItem>
                              <SelectItem value={ExperienceLevel.JUNIOR}>Junior</SelectItem>
                              <SelectItem value={ExperienceLevel.MID}>Mid Level</SelectItem>
                              <SelectItem value={ExperienceLevel.SENIOR}>Senior</SelectItem>
                              <SelectItem value={ExperienceLevel.LEAD}>Lead</SelectItem>
                              <SelectItem value={ExperienceLevel.PRINCIPAL}>Principal</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. New York, NY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="remote_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Remote Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select remote type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={RemoteType.ONSITE}>On-site</SelectItem>
                              <SelectItem value={RemoteType.HYBRID}>Hybrid</SelectItem>
                              <SelectItem value={RemoteType.REMOTE}>Remote</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Job Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Salary & Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="salary_min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Salary</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="50000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="salary_max"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Salary</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="80000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <FormControl>
                            <Input placeholder="USD" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="salary_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salary Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select salary type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={SalaryType.ANNUAL}>Annual</SelectItem>
                              <SelectItem value={SalaryType.MONTHLY}>Monthly</SelectItem>
                              <SelectItem value={SalaryType.WEEKLY}>Weekly</SelectItem>
                              <SelectItem value={SalaryType.DAILY}>Daily</SelectItem>
                              <SelectItem value={SalaryType.HOURLY}>Hourly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority Level</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1 - Low</SelectItem>
                              <SelectItem value="2">2 - Normal</SelectItem>
                              <SelectItem value="3">3 - High</SelectItem>
                              <SelectItem value="4">4 - Urgent</SelectItem>
                              <SelectItem value="5">5 - Critical</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center space-x-6">
                    <FormField
                      control={form.control}
                      name="equity_offered"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Equity Offered</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ai_skills_required"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>AI Skills Required</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requirements</FormLabel>
                        <FormControl>
                          <Textarea placeholder="List the job requirements..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="responsibilities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsibilities</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the key responsibilities..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="benefits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Benefits</FormLabel>
                        <FormControl>
                          <Textarea placeholder="List the benefits and perks..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="application_deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application Deadline</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={JobStatus.DRAFT}>Draft</SelectItem>
                              <SelectItem value={JobStatus.PUBLISHED}>Published</SelectItem>
                              <SelectItem value={JobStatus.PAUSED}>Paused</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Company Tab */}
            <TabsContent value="company" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Company Information
                  </CardTitle>
                  <CardDescription>
                    Select a company you have access to or provide custom company details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Button 
                      type="button" 
                      variant={!useCustomCompany ? "default" : "outline"}
                      onClick={() => !useCustomCompany || handleCustomCompanyToggle()}
                    >
                      Registered Company
                    </Button>
                    <Button 
                      type="button" 
                      variant={useCustomCompany ? "default" : "outline"}
                      onClick={() => useCustomCompany || handleCustomCompanyToggle()}
                    >
                      Custom Company
                    </Button>
                  </div>

                  {!useCustomCompany ? (
                    <FormField
                      control={form.control}
                      name="company_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Company</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a registered company" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {companies.length > 0 ? (
                                companies.map((company) => (
                                  <SelectItem key={company.id} value={company.id}>
                                    <div className="flex items-center">
                                      <span>{company.name}</span>
                                      {company.industry && (
                                        <Badge variant="secondary" className="ml-2 text-xs">
                                          {company.industry}
                                        </Badge>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="px-2 py-1.5 text-sm text-gray-500">
                                  No registered companies available
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          {companies.length === 0 && (
                            <FormDescription className="text-amber-600">
                              No accessible companies found. You can add custom company details instead.
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="customCompanyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter company name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="customCompanyEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Email *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="contact@company.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customCompanyPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Phone *</FormLabel>
                              <FormControl>
                                <Input placeholder="+1 (555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="customCompanyWebsite"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://company.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                  <CardDescription>
                    Add the skills required for this position by typing skill names
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <FormField
                          control={form.control}
                          name={`skills.${index}.skill_name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Skill Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g. JavaScript, React, Python" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`skills.${index}.required_level`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Required Level</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Required level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={RequiredLevel.NICE_TO_HAVE}>Nice to Have</SelectItem>
                                  <SelectItem value={RequiredLevel.PREFERRED}>Preferred</SelectItem>
                                  <SelectItem value={RequiredLevel.REQUIRED}>Required</SelectItem>
                                  <SelectItem value={RequiredLevel.MUST_HAVE}>Must Have</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`skills.${index}.proficiency_level`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Proficiency</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Proficiency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={ProficiencyLevel.BEGINNER}>Beginner</SelectItem>
                                  <SelectItem value={ProficiencyLevel.INTERMEDIATE}>Intermediate</SelectItem>
                                  <SelectItem value={ProficiencyLevel.ADVANCED}>Advanced</SelectItem>
                                  <SelectItem value={ProficiencyLevel.EXPERT}>Expert</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`skills.${index}.years_required`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Years</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="2" min="0" max="20" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSkill}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                  </Button>

                  {fields.length === 0 && (
                    <div className="text-center p-8 text-gray-500">
                      <Star className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No skills added yet</p>
                      <p className="text-sm">Add at least one skill requirement for this job</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center space-x-2">
              {form.formState.isValid ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  <span className="text-sm">Form is valid</span>
                </div>
              ) : (
                <div className="flex items-center text-amber-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Please complete required fields</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              
              <Button 
                type="submit" 
                disabled={isSubmitting || !form.formState.isValid}
                className="min-w-32"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Job'
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}