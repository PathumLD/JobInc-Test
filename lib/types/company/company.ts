// types/company.ts

export enum CompanySize {
  STARTUP = 'startup',
  ONE_TO_TEN = 'one_to_ten',
  ELEVEN_TO_FIFTY = 'eleven_to_fifty',
  FIFTY_ONE_TO_TWO_HUNDRED = 'fifty_one_to_two_hundred',
  TWO_HUNDRED_ONE_TO_FIVE_HUNDRED = 'two_hundred_one_to_five_hundred',
  FIVE_HUNDRED_ONE_TO_ONE_THOUSAND = 'five_hundred_one_to_one_thousand',
  ONE_THOUSAND_PLUS = 'one_thousand_plus'
}

export enum CompanyType {
  STARTUP = 'startup',
  CORPORATION = 'corporation',
  AGENCY = 'agency',
  NON_PROFIT = 'non_profit',
  GOVERNMENT = 'government'
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website_url?: string;
  logo_url?: string;
  industry?: string;
  company_size: CompanySize;
  headquarters_location?: string;
  founded_year?: number;
  company_type: CompanyType;
  remote_friendly: boolean;
  benefits?: string;
  culture_description?: string;
  social_media_links?: Record<string, any>;
  verification_status: VerificationStatus;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyOption {
  id: string;
  name: string;
  industry?: string;
  logo_url?: string;
  verification_status: VerificationStatus;
}

export interface CompaniesResponse {
  success: boolean;
  data?: CompanyOption[];
  error?: string;
  message?: string;
}

export interface CustomCompanyData {
  name: string;
  email: string;
  phone: string;
  website?: string;
}