// lib/validations/job.ts

import { z } from 'zod';
import { 
  JobType, 
  ExperienceLevel, 
  RemoteType, 
  SalaryType, 
  JobStatus, 
  RequiredLevel, 
  ProficiencyLevel 
} from '../types/jobs/job';

// Skill validation schema
const jobSkillSchema = z.object({
  skill_name: z.string().min(1, 'Skill name is required').max(100, 'Skill name too long'),
  required_level: z.nativeEnum(RequiredLevel),
  proficiency_level: z.nativeEnum(ProficiencyLevel),
  years_required: z.number().min(0).max(50).optional(),
  weight: z.number().min(0.1).max(10).default(1.0).optional()
});

// Custom company validation schema
const customCompanySchema = z.object({
  customCompanyName: z.string().min(2, 'Company name must be at least 2 characters').max(200),
  customCompanyEmail: z.string().email('Invalid email format'),
  customCompanyPhone: z.string().min(10, 'Phone number must be at least 10 characters').max(20),
  customCompanyWebsite: z.string().url('Invalid website URL').optional().or(z.literal(''))
});

// Main job creation schema
export const createJobSchema = z.object({
  // Basic job information
  title: z.string()
    .min(5, 'Job title must be at least 5 characters')
    .max(200, 'Job title must not exceed 200 characters'),
  
  description: z.string()
    .min(50, 'Job description must be at least 50 characters')
    .max(10000, 'Job description must not exceed 10,000 characters'),
  
  requirements: z.string()
    .max(5000, 'Requirements must not exceed 5,000 characters')
    .optional(),
  
  responsibilities: z.string()
    .max(5000, 'Responsibilities must not exceed 5,000 characters')
    .optional(),
  
  benefits: z.string()
    .max(3000, 'Benefits must not exceed 3,000 characters')
    .optional(),

  // Job type and level
  job_type: z.nativeEnum(JobType),
  experience_level: z.nativeEnum(ExperienceLevel),
  
  // Location and remote work
  location: z.string()
    .max(200, 'Location must not exceed 200 characters')
    .optional(),
  remote_type: z.nativeEnum(RemoteType),

  // Salary information
  salary_min: z.number()
    .min(0, 'Minimum salary cannot be negative')
    .max(10000000, 'Minimum salary seems too high')
    .optional(),
  
  salary_max: z.number()
    .min(0, 'Maximum salary cannot be negative')
    .max(10000000, 'Maximum salary seems too high')
    .optional(),
  
  currency: z.string()
    .length(3, 'Currency code must be 3 characters')
    .default('USD'),
  
  salary_type: z.nativeEnum(SalaryType).default(SalaryType.ANNUAL),

  // Additional options
  equity_offered: z.boolean().default(false),
  ai_skills_required: z.boolean().default(false),
  
  application_deadline: z.string()
    .optional()
    .transform((val) => {
      // Convert empty string to undefined
      if (!val || val.trim() === '') return undefined;
      return val;
    })
    .refine((val) => {
      if (!val) return true; // undefined/empty is valid
      
      // Check if it's a valid date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(val)) return false;
      
      // Check if it's a valid date
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, 'Invalid date format. Please use YYYY-MM-DD format'),

  // Job status and priority
  status: z.nativeEnum(JobStatus).default(JobStatus.DRAFT),
  priority_level: z.number().min(1).max(5).default(1),

  // Company selection - MIS jobs only use custom company fields
  company_id: z.string().optional().or(z.literal('')),
  
  // Custom company fields (required for MIS jobs)
  customCompanyName: z.string().min(2, 'Company name is required').max(200),
  customCompanyEmail: z.string().email('Valid email is required'),
  customCompanyPhone: z.string().min(10, 'Phone number is required').max(20),
  customCompanyWebsite: z.string().url('Invalid website URL').optional().or(z.literal('')),

  // Skills
  skills: z.array(jobSkillSchema)
    .min(1, 'At least one skill is required')
    .max(20, 'Maximum 20 skills allowed')

}).superRefine((data, ctx) => {
  // Validate salary range
  if (data.salary_min && data.salary_max && data.salary_min > data.salary_max) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Minimum salary cannot be greater than maximum salary',
      path: ['salary_min']
    });
  }

  // Validate application deadline (must be in the future)
  if (data.application_deadline) {
    const deadline = new Date(data.application_deadline);
    const now = new Date();
    
    // Set time to end of day for the deadline to be more user-friendly
    deadline.setHours(23, 59, 59, 999);
    
    // Check if the date is valid
    if (isNaN(deadline.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid date format',
        path: ['application_deadline']
      });
    } else if (deadline <= now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Application deadline must be in the future',
        path: ['application_deadline']
      });
    }
  }

  // Validate company information - always require custom company details for MIS jobs
  if (!data.customCompanyName || data.customCompanyName.trim() === '') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Company name is required',
      path: ['customCompanyName']
    });
  }

  if (!data.customCompanyEmail || data.customCompanyEmail.trim() === '') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Company email is required',
      path: ['customCompanyEmail']
    });
  }

  if (!data.customCompanyPhone || data.customCompanyPhone.trim() === '') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Company phone is required',
      path: ['customCompanyPhone']
    });
  }

  // Validate email format
  if (data.customCompanyEmail && !z.string().email().safeParse(data.customCompanyEmail).success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid email format',
      path: ['customCompanyEmail']
    });
  }

  // Validate website URL if provided
  if (data.customCompanyWebsite && data.customCompanyWebsite.trim() !== '') {
    if (!z.string().url().safeParse(data.customCompanyWebsite).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid website URL',
        path: ['customCompanyWebsite']
      });
    }
  }
});

// Form data schema (for client-side forms with string inputs)
export const jobFormSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  description: z.string().min(1, 'Job description is required'),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  benefits: z.string().optional(),
  job_type: z.nativeEnum(JobType),
  experience_level: z.nativeEnum(ExperienceLevel),
  location: z.string().optional(),
  remote_type: z.nativeEnum(RemoteType),
  salary_min: z.string().optional(),
  salary_max: z.string().optional(),
  currency: z.string().default('USD'),
  salary_type: z.nativeEnum(SalaryType),
  equity_offered: z.boolean().default(false),
  ai_skills_required: z.boolean().default(false),
  application_deadline: z.string().optional(),
  status: z.nativeEnum(JobStatus),
  priority_level: z.number().min(1).max(5),
  company_id: z.string().optional(),
  customCompanyName: z.string().min(1, 'Company name is required'),
  customCompanyEmail: z.string().min(1, 'Company email is required'),
  customCompanyPhone: z.string().min(1, 'Company phone is required'),
  customCompanyWebsite: z.string().optional(),
  skills: z.array(z.object({
    skill_name: z.string().min(1, 'Skill name is required'),
    required_level: z.nativeEnum(RequiredLevel),
    proficiency_level: z.nativeEnum(ProficiencyLevel),
    years_required: z.string().optional(),
    weight: z.string().optional()
  }))
});

// Update validation schema (similar to create but for updates)
export const updateJobSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(10000, 'Description must be less than 10000 characters'),
  requirements: z.string().max(5000, 'Requirements must be less than 5000 characters').optional(),
  responsibilities: z.string().max(5000, 'Responsibilities must be less than 5000 characters').optional(),
  benefits: z.string().max(5000, 'Benefits must be less than 5000 characters').optional(),
  
  // Updated to match your schema enum values
  job_type: z.enum(['full_time', 'part_time', 'contract', 'internship', 'freelance']),
  experience_level: z.enum(['entry_level', 'mid_level', 'senior_level', 'executive_level']),
  remote_type: z.enum(['onsite', 'remote', 'hybrid']),
  
  location: z.string().max(200, 'Location must be less than 200 characters').optional(),
  salary_min: z.number().positive('Minimum salary must be positive').optional(),
  salary_max: z.number().positive('Maximum salary must be positive').optional(),
  currency: z.string().length(3, 'Currency must be a 3-letter code').default('USD'),
  salary_type: z.enum(['annual', 'monthly', 'weekly', 'daily', 'hourly']).default('annual'),
  equity_offered: z.boolean().default(false),
  ai_skills_required: z.boolean().default(false),
  application_deadline: z.string().datetime().optional(),
  status: z.enum(['draft', 'published', 'paused', 'closed', 'archived']).default('draft'),
  priority_level: z.number().int().min(1).max(5).default(1),
  
  // Custom company information
  customCompanyName: z.string().min(1, 'Company name is required').max(200, 'Company name must be less than 200 characters'),
  customCompanyEmail: z.string().email('Valid email is required').max(200, 'Email must be less than 200 characters').optional(),
  customCompanyPhone: z.string().max(50, 'Phone must be less than 50 characters').optional(),
  customCompanyWebsite: z.string().url('Valid URL is required').max(500, 'Website URL must be less than 500 characters').optional(),
  
  // Skills (updated to match your schema enum values)
  skills: z.array(z.object({
    skill_name: z.string().min(1, 'Skill name is required').max(100, 'Skill name must be less than 100 characters'),
    required_level: z.enum(['nice_to_have', 'preferred', 'required', 'must_have']),
    proficiency_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    years_required: z.number().int().min(0).max(50).optional(),
    weight: z.number().min(0.1).max(10).default(1.0)
  })).optional()
}).refine(data => {
  // Ensure salary_max is greater than salary_min if both are provided
  if (data.salary_min && data.salary_max) {
    return data.salary_max >= data.salary_min;
  }
  return true;
}, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['salary_max']
});


// Type exports
export type CreateJobData = z.infer<typeof createJobSchema>;
export type JobFormData = z.infer<typeof jobFormSchema>;
export type UpdateJobData = z.infer<typeof updateJobSchema>;