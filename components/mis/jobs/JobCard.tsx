'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Eye, 
  Users, 
  DollarSign,
  Clock,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  Pause,
  Play
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExperienceLevel, Job, JobStatus, JobType, RemoteType } from '@/lib/types/jobs/job';


interface JobCardProps {
  job: Job;
  onStatusChange?: (jobId: string, status: JobStatus) => void;
  onDelete?: (jobId: string) => void;
}

export default function JobCard({ job, onStatusChange, onDelete }: JobCardProps) {
  const [isLoading, setIsLoading] = useState(false);

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

  const getJobTypeColor = (type: JobType) => {
    switch (type) {
      case JobType.FULL_TIME:
        return 'bg-blue-100 text-blue-800';
      case JobType.PART_TIME:
        return 'bg-purple-100 text-purple-800';
      case JobType.CONTRACT:
        return 'bg-orange-100 text-orange-800';
      case JobType.INTERNSHIP:
        return 'bg-green-100 text-green-800';
      case JobType.FREELANCE:
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    
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
      month: 'short',
      day: 'numeric'
    });
  };

  const handleStatusChange = async (newStatus: JobStatus) => {
    if (onStatusChange) {
      setIsLoading(true);
      try {
        await onStatusChange(job.id, newStatus);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm('Are you sure you want to delete this job?')) {
      onDelete(job.id);
    }
  };

  const getCompanyName = () => {
    return job.company?.name || job.customCompanyName || 'Company Name';
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={getStatusColor(job.status)}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </Badge>
              {job.priority_level > 2 && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <Star className="h-3 w-3 mr-1" />
                  High Priority
                </Badge>
              )}
            </div>
            
            <Link href={`/mis/jobs/jobs/${job.id}`}>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer line-clamp-2">
                {job.title}
              </h3>
            </Link>
            
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
              <Building2 className="h-4 w-4" />
              <span className="truncate">{getCompanyName()}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/mis/jobs/${job.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              
              {job.status === JobStatus.PUBLISHED && (
                <DropdownMenuItem onClick={() => handleStatusChange(JobStatus.PAUSED)}>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </DropdownMenuItem>
              )}
              
              {job.status === JobStatus.PAUSED && (
                <DropdownMenuItem onClick={() => handleStatusChange(JobStatus.PUBLISHED)}>
                  <Play className="h-4 w-4 mr-2" />
                  Publish
                </DropdownMenuItem>
              )}
              
              {job.status === JobStatus.DRAFT && (
                <DropdownMenuItem onClick={() => handleStatusChange(JobStatus.PUBLISHED)}>
                  <Play className="h-4 w-4 mr-2" />
                  Publish
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Job Type and Experience */}
          <div className="flex flex-wrap gap-2">
            <Badge className={getJobTypeColor(job.job_type)}>
              {formatJobType(job.job_type)}
            </Badge>
            <Badge variant="outline">
              {formatExperienceLevel(job.experience_level)}
            </Badge>
            <Badge variant="outline">
              {formatRemoteType(job.remote_type)}
            </Badge>
          </div>

          {/* Location */}
          {job.location && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
          )}

          {/* Salary */}
          {formatSalary() && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span>{formatSalary()}</span>
              {job.salary_type && job.salary_type !== 'annual' && (
                <span className="text-gray-500">/ {job.salary_type}</span>
              )}
            </div>
          )}

          {/* Description Preview */}
          <p className="text-sm text-gray-600 line-clamp-3">
            {job.description}
          </p>

          {/* Skills Preview */}
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.skills.slice(0, 3).map((skillRelation) => (
                <Badge key={skillRelation.id} variant="secondary" className="text-xs">
                  {skillRelation.skill?.name}
                </Badge>
              ))}
              {job.skills.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{job.skills.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{job.views_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{job.applications_count}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{formatDate(job.created_at)}</span>
            </div>
          </div>

          {/* Application Deadline */}
          {job.application_deadline && (
            <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
              <Calendar className="h-3 w-3" />
              <span>Deadline: {formatDate(job.application_deadline)}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-4">
          <Link href={`/mis/jobs/jobs/${job.id}`}>
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}