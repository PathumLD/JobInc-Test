'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Edit,
  Eye,
  Users,
  Calendar,
  MapPin,
  Building2,
  DollarSign,
  Clock,
  Star,
  Globe,
  Phone,
  Mail,
  Briefcase,
  GraduationCap,
  Loader2,
  Share2,
  MoreVertical,
  Pause,
  Play,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { fetchJobById, updateJobStatus } from '@/app/api/jobs/jobs';
import { Job, JobStatus, JobType, ExperienceLevel, RemoteType, RequiredLevel, ProficiencyLevel } from '@/lib/types/jobs/job';
import { useAuthGuard } from '@/app/api/auth/authGuard';
import { Separator } from '@/components/ui/separator';

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Protect this page - only MIS users can access
  useAuthGuard('mis');

  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  const loadJob = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const jobData = await fetchJobById(jobId);
      setJob(jobData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: JobStatus) => {
    if (!job) return;
    
    try {
      await updateJobStatus(job.id, newStatus);
      setJob({ ...job, status: newStatus });
    } catch (err) {
      console.error('Failed to update job status:', err);
    }
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.PUBLISHED:
        return 'bg-green-100 text-green-800 border-green-200';
      case JobStatus.DRAFT:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case JobStatus.PAUSED:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case JobStatus.CLOSED:
        return 'bg-red-100 text-red-800 border-red-200';
      case JobStatus.ARCHIVED:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatJobType = (type: JobType) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatExperienceLevel = (level: ExperienceLevel) => {
    return level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatRemoteType = (type: RemoteType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatRequiredLevel = (level: RequiredLevel) => {
    return level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatProficiencyLevel = (level: ProficiencyLevel) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const formatSalary = () => {
    if (!job || (!job.salary_min && !job.salary_max)) return null;
    
    const currency = job.currency || 'USD';
    const formatNumber = (num: number) => {
      return new Intl.NumberFormat('en-US').format(num);
    };

    if (job.salary_min && job.salary_max) {
      return `${currency} ${formatNumber(job.salary_min)} - ${formatNumber(job.salary_max)}`;
    } else if (job.salary_min) {
      return `${currency} ${formatNumber(job.salary_min)}+`;
    } else if (job.salary_max) {
      return `Up to ${currency} ${formatNumber(job.salary_max)}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCompanyInfo = () => {
    if (!job) return null;
    
    return {
      name: job.company?.name || job.customCompanyName || 'Company Name',
      email: job.customCompanyEmail,
      phone: job.customCompanyPhone,
      website: job.company?.website_url || job.customCompanyWebsite,
      industry: job.company?.industry
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Job Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'The job you are looking for does not exist.'}</p>
            <Button onClick={() => router.push('/mis/jobs/jobs')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const companyInfo = getCompanyInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push('/mis/jobs/jobs')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Job Details</h1>
                <p className="text-sm text-gray-600">{job.title}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/mis/jobs/jobs/${job.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Job
                    </Link>
                  </DropdownMenuItem>
                  
                  {job.status === JobStatus.PUBLISHED && (
                    <DropdownMenuItem onClick={() => handleStatusChange(JobStatus.PAUSED)}>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause Job
                    </DropdownMenuItem>
                  )}
                  
                  {(job.status === JobStatus.PAUSED || job.status === JobStatus.DRAFT) && (
                    <DropdownMenuItem onClick={() => handleStatusChange(JobStatus.PUBLISHED)}>
                      <Play className="h-4 w-4 mr-2" />
                      Publish Job
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Job
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getStatusColor(job.status)}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </Badge>
                      {job.priority_level > 4 && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <Star className="h-3 w-3 mr-1" />
                          High Priority
                        </Badge>
                      )}
                      {job.ai_skills_required && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          AI Skills Required
                        </Badge>
                      )}
                    </div>
                    
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        <span>{companyInfo?.name}</span>
                      </div>
                      {job.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Posted {formatDate(job.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Eye className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                    <div className="text-lg font-semibold">{job.views_count}</div>
                    <div className="text-xs text-gray-600">Views</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Users className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                    <div className="text-lg font-semibold">{job.applications_count}</div>
                    <div className="text-xs text-gray-600">Applications</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Briefcase className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                    <div className="text-sm font-semibold">{formatJobType(job.job_type)}</div>
                    <div className="text-xs text-gray-600">Job Type</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <GraduationCap className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                    <div className="text-sm font-semibold">{formatExperienceLevel(job.experience_level)}</div>
                    <div className="text-xs text-gray-600">Experience</div>
                  </div>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Work Type</h4>
                    <p className="text-sm text-gray-600">{formatRemoteType(job.remote_type)}</p>
                  </div>
                  
                  {formatSalary() && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Salary</h4>
                      <p className="text-sm text-gray-600">
                        {formatSalary()}
                        {job.salary_type && job.salary_type !== 'annual' && (
                          <span className="text-gray-500"> / {job.salary_type}</span>
                        )}
                      </p>
                    </div>
                  )}
                  
                  {job.application_deadline && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Application Deadline</h4>
                      <p className="text-sm text-gray-600">{formatDate(job.application_deadline)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{job.requirements}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Responsibilities */}
            {job.responsibilities && (
              <Card>
                <CardHeader>
                  <CardTitle>Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{job.responsibilities}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{job.benefits}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                  <CardDescription>Skills and experience needed for this position</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {job.skills.map((skillRelation) => (
                      <div key={skillRelation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{skillRelation.skill?.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" size="sm">
                              {formatRequiredLevel(skillRelation.required_level)}
                            </Badge>
                            <Badge variant="secondary" size="sm">
                              {formatProficiencyLevel(skillRelation.proficiency_level)}
                            </Badge>
                            {skillRelation.years_required && (
                              <span className="text-xs text-gray-600">
                                {skillRelation.years_required} years
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{companyInfo?.name}</h4>
                  {companyInfo?.industry && (
                    <p className="text-sm text-gray-600">{companyInfo.industry}</p>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  {companyInfo?.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <a href={`mailto:${companyInfo.email}`} className="text-blue-600 hover:underline">
                        {companyInfo.email}
                      </a>
                    </div>
                  )}
                  
                  {companyInfo?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <a href={`tel:${companyInfo.phone}`} className="text-blue-600 hover:underline">
                        {companyInfo.phone}
                      </a>
                    </div>
                  )}
                  
                  {companyInfo?.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <a href={companyInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Job ID</span>
                  <span className="text-sm font-mono">{job.id.slice(0, 8)}...</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm">{formatDate(job.created_at)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm">{formatDate(job.updated_at)}</span>
                </div>
                
                {job.published_at && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Published</span>
                    <span className="text-sm">{formatDate(job.published_at)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Priority Level</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: job.priority_level }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm ml-1">{job.priority_level}/5</span>
                  </div>
                </div>

                {job.equity_offered && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Equity Offered</span>
                    <Badge variant="secondary" size="sm">Yes</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full">
                  <Link href={`/mis/jobs/${job.id}/applications`}>
                    <Users className="h-4 w-4 mr-2" />
                    View Applications ({job.applications_count})
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/mis/jobs/${job.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Job
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Job
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}