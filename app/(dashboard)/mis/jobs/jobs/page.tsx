'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter,
  SortAsc,
  SortDesc,
  Briefcase,
  Eye,
  Users,
  TrendingUp,
  Loader2,
  ArrowBigLeft
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import JobCard from '@/components/mis/jobs/JobCard';
import { fetchMyJobs, updateJobStatus } from '@/app/api/jobs/jobs';
import { Job, JobStatus } from '@/lib/types/jobs/job';
import { useAuthGuard } from '@/app/api/auth/authGuard';

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [error, setError] = useState<string | null>(null);

  // Protect this page - only MIS users can access
  useAuthGuard('mis');

  // Load jobs on component mount
  useEffect(() => {
    loadJobs();
  }, []);

  // Filter and sort jobs when dependencies change
  useEffect(() => {
    filterAndSortJobs();
  }, [jobs, searchTerm, statusFilter, sortBy, sortOrder]);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchMyJobs();
      setJobs(response.jobs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortJobs = () => {
    let filtered = [...jobs];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.company?.name || job.customCompanyName || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'applications_count':
          aValue = a.applications_count;
          bValue = b.applications_count;
          break;
        case 'views_count':
          aValue = a.views_count;
          bValue = b.views_count;
          break;
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredJobs(filtered);
  };

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    try {
      await updateJobStatus(jobId, newStatus);
      
      // Update local state
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === jobId ? { ...job, status: newStatus } : job
        )
      );
    } catch (err) {
      console.error('Failed to update job status:', err);
      // TODO: Show toast notification
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      // Remove from local state immediately for better UX
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      
      // TODO: Implement delete API call
      // await deleteJob(jobId);
    } catch (err) {
      console.error('Failed to delete job:', err);
      // Reload jobs to restore state if delete failed
      loadJobs();
    }
  };

  const getStatusCounts = () => {
    const counts = {
      total: jobs.length,
      published: jobs.filter(job => job.status === JobStatus.PUBLISHED).length,
      draft: jobs.filter(job => job.status === JobStatus.DRAFT).length,
      paused: jobs.filter(job => job.status === JobStatus.PAUSED).length,
    };
    return counts;
  };

  const getTotalStats = () => {
    return {
      totalViews: jobs.reduce((sum, job) => sum + job.views_count, 0),
      totalApplications: jobs.reduce((sum, job) => sum + job.applications_count, 0),
    };
  };

  const statusCounts = getStatusCounts();
  const totalStats = getTotalStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
              <p className="text-sm text-gray-600">Manage your job postings</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => router.push('/mis/dashboard')}>
              <ArrowBigLeft className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button onClick={() => router.push('/mis/jobs/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Job
            </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.total}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {statusCounts.published} Published
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {statusCounts.draft} Draft
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all jobs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalApplications.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total applications received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Applications</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statusCounts.total > 0 ? (totalStats.totalApplications / statusCounts.total).toFixed(1) : '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Per job posting
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filter & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={JobStatus.PUBLISHED}>Published</SelectItem>
                  <SelectItem value={JobStatus.DRAFT}>Draft</SelectItem>
                  <SelectItem value={JobStatus.PAUSED}>Paused</SelectItem>
                  <SelectItem value={JobStatus.CLOSED}>Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="title">Job Title</SelectItem>
                  <SelectItem value="applications_count">Applications</SelectItem>
                  <SelectItem value="views_count">Views</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                <span className="ml-2">{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-700">{error}</p>
              <Button onClick={loadJobs} variant="outline" size="sm" className="mt-2">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {jobs.length === 0 ? 'No jobs created yet' : 'No jobs match your filters'}
              </h3>
              <p className="text-gray-600 text-center mb-4">
                {jobs.length === 0 
                  ? 'Get started by creating your first job posting' 
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {jobs.length === 0 && (
                <Button onClick={() => router.push('/mis/jobs/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Job
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteJob}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}