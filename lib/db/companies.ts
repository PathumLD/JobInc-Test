// lib/db/companies.ts

import { PrismaClient } from '@prisma/client';
import { CompanyOption, VerificationStatus } from '../types/company/company';


const prisma = new PrismaClient();

/**
 * Get all verified companies for reference/display purposes only
 */
export async function getVerifiedCompanies(): Promise<CompanyOption[]> {
  try {
    const companies = await prisma.company.findMany({
      where: {
        verification_status: VerificationStatus.VERIFIED
      },
      select: {
        id: true,
        name: true,
        industry: true,
        logo_url: true,
        verification_status: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return companies.map(company => ({
      id: company.id,
      name: company.name,
      industry: company.industry || undefined,
      logo_url: company.logo_url || undefined,
      verification_status: company.verification_status as VerificationStatus
    }));
  } catch (error) {
    console.error('Error fetching verified companies:', error);
    throw new Error('Failed to fetch companies');
  }
}

/**
 * Get company by ID (for reference only)
 */
export async function getCompanyById(companyId: string) {
  try {
    const company = await prisma.company.findUnique({
      where: {
        id: companyId
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        website_url: true,
        logo_url: true,
        industry: true,
        company_size: true,
        headquarters_location: true,
        founded_year: true,
        company_type: true,
        remote_friendly: true,
        verification_status: true,
        verified_at: true
      }
    });

    return company;
  } catch (error) {
    console.error('Error fetching company by ID:', error);
    throw new Error('Failed to fetch company');
  }
}

/**
 * Check if company exists and is verified (for reference only)
 */
export async function isCompanyVerified(companyId: string): Promise<boolean> {
  try {
    const company = await prisma.company.findUnique({
      where: {
        id: companyId
      },
      select: {
        verification_status: true
      }
    });

    return company?.verification_status === VerificationStatus.VERIFIED;
  } catch (error) {
    console.error('Error checking company verification:', error);
    return false;
  }
}

/**
 * Search companies by name (for reference/autocomplete only)
 */
export async function searchCompaniesByName(query: string, limit: number = 10): Promise<CompanyOption[]> {
  try {
    const companies = await prisma.company.findMany({
      where: {
        AND: [
          {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            verification_status: VerificationStatus.VERIFIED
          }
        ]
      },
      select: {
        id: true,
        name: true,
        industry: true,
        logo_url: true,
        verification_status: true
      },
      orderBy: {
        name: 'asc'
      },
      take: limit
    });

    return companies.map(company => ({
      id: company.id,
      name: company.name,
      industry: company.industry || undefined,
      logo_url: company.logo_url || undefined,
      verification_status: company.verification_status as VerificationStatus
    }));
  } catch (error) {
    console.error('Error searching companies:', error);
    throw new Error('Failed to search companies');
  }
}