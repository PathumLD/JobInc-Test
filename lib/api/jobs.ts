// lib/api/jobs.ts

import { CreateJobRequest, CreateJobResponse, Job, JobStatus } from '@/lib/types/jobs/job';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Create authorization headers
 */
function createAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
}

/**
 * Create a new job
 */
export async function createJob(jobData: CreateJobRequest): Promise<Job> {
  try {
    console.log('Making request to:', '/api/jobs/create');
    const response = await fetch('/api/jobs/create', {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(jobData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in.');
      }
      if (response.status === 403) {
        throw new Error('Insufficient permissions. MIS role required.');
      }
      if (response.status === 400) {
        const message = errorData.message || 'Invalid job data provided';
        const details = errorData.details;
        if (details && Array.isArray(details)) {
          const fieldErrors = details.map((detail: any) => `${detail.field}: ${detail.message}`).join(', ');
          throw new Error(`${message} - ${fieldErrors}`);
        }
        throw new Error(message);
      }
      
      throw new Error(errorData.message || `Failed to create job: ${response.status}`);
    }

    const result: CreateJobResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to create job');
    }

    return result.data;
  } catch (error) {
    console.error('Error creating job:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while creating the job');
  }
}

/**
 * Fetch jobs created by the current MIS user
 */
export async function fetchMyJobs(page: number = 1, limit: number = 10) {
  try {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await fetch(`${API_BASE_URL}/api/jobs?${searchParams}`, {
      method: 'GET',
      headers: createAuthHeaders(),
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      if (response.status === 403) {
        throw new Error('Insufficient permissions');
      }
      throw new Error(`Failed to fetch jobs: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch jobs');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching jobs');
  }
}

/**
 * Get job by ID
 */
export async function fetchJobById(jobId: string): Promise<Job> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
      method: 'GET',
      headers: createAuthHeaders(),
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      if (response.status === 403) {
        throw new Error('Insufficient permissions');
      }
      if (response.status === 404) {
        throw new Error('Job not found');
      }
      throw new Error(`Failed to fetch job: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch job');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching the job');
  }
}

/**
 * Update job status
 */
export async function updateJobStatus(jobId: string, status: JobStatus): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: createAuthHeaders(),
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      if (response.status === 403) {
        throw new Error('Insufficient permissions');
      }
      if (response.status === 404) {
        throw new Error('Job not found');
      }
      throw new Error(`Failed to update job status: ${response.status}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error updating job status:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while updating job status');
  }
}

/**
 * Fetch all skills for job creation
 */
export async function fetchSkills() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/skills`, {
      method: 'GET',
      headers: createAuthHeaders(),
      cache: 'force-cache' // Skills don't change frequently
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error(`Failed to fetch skills: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch skills');
    }

    return result.data || [];
  } catch (error) {
    console.error('Error fetching skills:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching skills');
  }
}

/**
 * Handle API errors consistently
 */
export function handleJobApiError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('Authentication required')) {
      return 'Please log in to continue';
    }
    if (error.message.includes('Insufficient permissions')) {
      return 'You do not have permission to perform this action';
    }
    if (error.message.includes('Job not found')) {
      return 'The requested job could not be found';
    }
    return error.message;
  }
  return 'An unexpected error occurred';
}