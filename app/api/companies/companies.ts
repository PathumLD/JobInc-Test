// lib/api/companies.ts

import { CompaniesResponse, CompanyOption } from '@/lib/types/company/company';

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
 * Fetch verified companies for reference purposes
 */
export async function fetchVerifiedCompanies(): Promise<CompanyOption[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/companies/verified`, {
      method: 'GET',
      headers: createAuthHeaders(),
      cache: 'no-store' // Always fetch fresh data
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      if (response.status === 403) {
        throw new Error('Insufficient permissions');
      }
      throw new Error(`Failed to fetch accessible companies: ${response.status}`);
    }

    const result: CompaniesResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch accessible companies');
    }

    return result.data || [];
  } catch (error) {
    console.error('Error fetching accessible companies:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching accessible companies');
  }
}

/**
 * Search companies by name
 */
export async function searchCompanies(query: string, limit: number = 10): Promise<CompanyOption[]> {
  try {
    const searchParams = new URLSearchParams({
      q: query,
      limit: limit.toString()
    });

    const response = await fetch(`${API_BASE_URL}/api/companies/search?${searchParams}`, {
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
      throw new Error(`Failed to search companies: ${response.status}`);
    }

    const result: CompaniesResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to search companies');
    }

    return result.data || [];
  } catch (error) {
    console.error('Error searching companies:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while searching companies');
  }
}

/**
 * Get company by ID
 */
export async function fetchCompanyById(companyId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}`, {
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
        throw new Error('Company not found');
      }
      throw new Error(`Failed to fetch company: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch company');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching company by ID:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching company');
  }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('Authentication required')) {
      // Redirect to login or show auth modal
      return 'Please log in to continue';
    }
    if (error.message.includes('Insufficient permissions')) {
      return 'You do not have permission to perform this action';
    }
    return error.message;
  }
  return 'An unexpected error occurred';
}