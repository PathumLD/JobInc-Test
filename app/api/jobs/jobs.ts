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
    console.log('Job data:', jobData);
    
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
    console.log('Making request to fetch jobs...');
    
    // const searchParams = new URLSearchParams({
    //   page: page.toString(),
    //   limit: limit.toString()
    // });

    const response = await fetch(`/api/jobs`, {
      method: 'GET',
      headers: createAuthHeaders(),
      cache: 'no-store'
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      if (response.status === 403) {
        throw new Error('Insufficient permissions');
      }
      
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Failed to fetch jobs: ${response.status}`);
    }

    const result = await response.json();
    console.log('Jobs fetch result:', result);

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
 * Get job by ID with better error handling
 */
export async function fetchJobById(jobId: string): Promise<Job> {
  try {
    console.log('=== FETCHING JOB BY ID ===');
    console.log('Job ID:', jobId);
    
    // Validate job ID
    if (!jobId || typeof jobId !== 'string' || jobId.trim() === '') {
      throw new Error('Invalid job ID provided');
    }

    const response = await fetch(`/api/jobs/${jobId.trim()}`, {
      method: 'GET',
      headers: createAuthHeaders(),
      cache: 'no-store'
    });

    console.log('Job fetch response status:', response.status);
    console.log('Job fetch response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.log('Job fetch error data:', errorData);
        
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You can only view jobs you created.');
        }
        if (response.status === 404) {
          throw new Error('Job not found. It may have been deleted.');
        }
        
        // Use the error message from the server if available
        errorMessage = errorData.message || errorData.error || errorMessage;
        
        // In development, include debug info
        if (process.env.NODE_ENV === 'development' && errorData.debug) {
          console.error('Debug info:', errorData.debug);
        }
        
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
        // Use the status-based error message
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Job fetch result keys:', Object.keys(result));

    if (!result.success) {
      const errorMsg = result.error || result.message || 'Failed to fetch job';
      console.error('API returned error:', errorMsg);
      throw new Error(errorMsg);
    }

    if (!result.data) {
      console.error('No job data in response:', result);
      throw new Error('No job data received from server');
    }

    console.log('✅ Job fetched successfully:', result.data.title);
    return result.data;

  } catch (error) {
    console.error('❌ Error fetching job by ID:', error);
    
    // Re-throw known errors
    if (error instanceof Error) {
      // Check for network errors
      if (error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      // Re-throw with original message
      throw error;
    }
    
    // Fallback error
    throw new Error('An unexpected error occurred while fetching the job');
  }
}

/**
 * Update job status
 */
export async function updateJobStatus(jobId: string, status: JobStatus): Promise<boolean> {
  try {
    const response = await fetch(`/api/jobs/${jobId}/status`, {
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
    const response = await fetch(`/api/skills`, {
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