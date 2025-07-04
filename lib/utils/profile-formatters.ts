// lib/utils/profile-formatters.ts

import { 
  DateRange, 
  FormattedDuration, 
  CompleteProfileData,
  ProfileSection,
  DEFAULT_COMPLETENESS_CONFIG,
  SkillDisplayData 
} from '@/lib/types/profile-display';

/**
 * Format date for display in profile sections
 */
export function formatProfileDate(date: Date | string | null, format: 'short' | 'long' | 'month-year' = 'month-year'): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
    case 'long':
      return dateObj.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric',
        year: 'numeric' 
      });
    case 'month-year':
    default:
      return dateObj.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
  }
}

/**
 * Calculate and format duration between two dates
 */
export function calculateDuration(range: DateRange): FormattedDuration {
  if (!range.start) {
    return {
      years: 0,
      months: 0,
      formatted: '',
      isOngoing: false
    };
  }
  
  const startDate = new Date(range.start);
  const endDate = range.end ? new Date(range.end) : new Date();
  const isOngoing = range.is_current || !range.end;
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return {
      years: 0,
      months: 0,
      formatted: '',
      isOngoing: false
    };
  }
  
  // Calculate total months
  const totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                     (endDate.getMonth() - startDate.getMonth());
  
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  
  // Format the duration string
  let formatted = '';
  if (years > 0 && months > 0) {
    formatted = `${years} yr${years > 1 ? 's' : ''} ${months} mo${months > 1 ? 's' : ''}`;
  } else if (years > 0) {
    formatted = `${years} yr${years > 1 ? 's' : ''}`;
  } else if (months > 0) {
    formatted = `${months} mo${months > 1 ? 's' : ''}`;
  } else {
    formatted = '1 mo'; // Less than a month
  }
  
  return {
    years,
    months,
    formatted,
    isOngoing
  };
}

/**
 * Format date range for experience/education display
 */
export function formatDateRange(range: DateRange): string {
  const startFormatted = formatProfileDate(range.start);
  
  if (range.is_current) {
    return `${startFormatted} - Present`;
  }
  
  if (!range.end) {
    return startFormatted;
  }
  
  const endFormatted = formatProfileDate(range.end);
  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Format employment type for display
 */
export function formatEmploymentType(type: string | null): string {
  if (!type) return '';
  
  const typeMap: { [key: string]: string } = {
    'full_time': 'Full-time',
    'part_time': 'Part-time',
    'contract': 'Contract',
    'internship': 'Internship',
    'freelance': 'Freelance',
    'volunteer': 'Volunteer'
  };
  
  return typeMap[type] || type;
}

/**
 * Format experience level for display
 */
export function formatExperienceLevel(level: string | null): string {
  if (!level) return '';
  
  const levelMap: { [key: string]: string } = {
    'entry': 'Entry Level',
    'junior': 'Junior',
    'mid': 'Mid Level',
    'senior': 'Senior',
    'lead': 'Lead',
    'principal': 'Principal'
  };
  
  return levelMap[level] || level;
}

/**
 * Format availability status for display
 */
export function formatAvailabilityStatus(status: string | null): string {
  if (!status) return '';
  
  const statusMap: { [key: string]: string } = {
    'available': 'Available',
    'open_to_opportunities': 'Open to opportunities',
    'not_looking': 'Not looking'
  };
  
  return statusMap[status] || status;
}

/**
 * Format phone type for display
 */
export function formatPhoneType(type: string | null): string {
  if (!type) return '';
  
  const typeMap: { [key: string]: string } = {
    'mobile': 'Mobile',
    'home': 'Home',
    'work': 'Work',
    'other': 'Other'
  };
  
  return typeMap[type] || type;
}

/**
 * Format language proficiency for display
 */
export function formatLanguageProficiency(proficiency: string | null): string {
  if (!proficiency) return '';
  
  const proficiencyMap: { [key: string]: string } = {
    'native': 'Native',
    'fluent': 'Fluent',
    'professional': 'Professional',
    'conversational': 'Conversational',
    'basic': 'Basic'
  };
  
  return proficiencyMap[proficiency] || proficiency;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number | null): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate initials from name
 */
export function generateInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return first + last || '??';
}

/**
 * Generate full name from name parts
 */
export function generateFullName(
  firstName: string | null, 
  lastName: string | null, 
  additionalName?: string | null
): string {
  const parts = [firstName, additionalName, lastName].filter(Boolean);
  return parts.join(' ') || 'User';
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string | null, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Format skill proficiency as percentage
 */
export function formatSkillProficiency(proficiency: number | null): string {
  if (!proficiency) return '0%';
  return `${Math.round(proficiency)}%`;
}

/**
 * Get proficiency level name from number
 */
export function getProficiencyLevel(proficiency: number | null): string {
  if (!proficiency) return 'Beginner';
  
  if (proficiency >= 90) return 'Expert';
  if (proficiency >= 75) return 'Advanced';
  if (proficiency >= 50) return 'Intermediate';
  return 'Beginner';
}

/**
 * Group skills by category
 */
export function groupSkillsByCategory(skills: SkillDisplayData[]): { [category: string]: SkillDisplayData[] } {
  return skills.reduce((grouped, skill) => {
    const category = skill.category || 'Other';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(skill);
    return grouped;
  }, {} as { [category: string]: SkillDisplayData[] });
}

/**
 * Sort skills by proficiency within categories
 */
export function sortSkillsByProficiency(skills: SkillDisplayData[]): SkillDisplayData[] {
  return [...skills].sort((a, b) => {
    const proficiencyA = a.proficiency || 0;
    const proficiencyB = b.proficiency || 0;
    return proficiencyB - proficiencyA;
  });
}

/**
 * Check if certificate is expired
 */
export function isCertificateExpired(expiryDate: Date | string | null): boolean {
  if (!expiryDate) return false;
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  return expiry < new Date();
}

/**
 * Check if certificate expires soon (within 30 days)
 */
export function isCertificateExpiringSoon(expiryDate: Date | string | null): boolean {
  if (!expiryDate) return false;
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return expiry <= thirtyDaysFromNow && expiry >= new Date();
}

/**
 * Calculate enhanced profile completion percentage
 */
export function calculateEnhancedProfileCompletion(data: CompleteProfileData): {
  percentage: number;
  completedSections: string[];
  missingSections: string[];
  recommendations: string[];
} {
  const completed: string[] = [];
  const missing: string[] = [];
  const recommendations: string[] = [];
  let totalScore = 0;
  let maxScore = 0;
  
  // Calculate score for each section based on configuration
  Object.entries(DEFAULT_COMPLETENESS_CONFIG.sections).forEach(([sectionKey, config]) => {
    const section = sectionKey as ProfileSection;
    maxScore += config.weight;
    
    let sectionCompleted = false;
    
    switch (section) {
      case ProfileSection.BASIC_INFO:
        if (data.candidate.first_name && data.candidate.last_name && data.candidate.title) {
          sectionCompleted = true;
          totalScore += config.weight;
        }
        break;
        
      case ProfileSection.ABOUT:
        if (data.candidate.about && data.candidate.about.length >= (config.minimumLength || 50)) {
          sectionCompleted = true;
          totalScore += config.weight;
        } else if (!data.candidate.about) {
          recommendations.push('Add a professional summary to tell your story');
        }
        break;
        
      case ProfileSection.EXPERIENCE:
        if (data.work_experiences.length >= (config.minimumItems || 1)) {
          sectionCompleted = true;
          totalScore += config.weight;
        } else {
          recommendations.push('Add your work experience to showcase your background');
        }
        break;
        
      case ProfileSection.EDUCATION:
        if (data.education.length >= (config.minimumItems || 1)) {
          sectionCompleted = true;
          totalScore += config.weight;
        } else {
          recommendations.push('Add your education background');
        }
        break;
        
      case ProfileSection.SKILLS:
        if (data.skills.length >= (config.minimumItems || 3)) {
          sectionCompleted = true;
          totalScore += config.weight;
        } else {
          recommendations.push('Add more skills to highlight your expertise');
        }
        break;
        
      case ProfileSection.PROJECTS:
        if (data.projects.length >= (config.minimumItems || 1)) {
          sectionCompleted = true;
          totalScore += config.weight;
        } else if (config.required) {
          recommendations.push('Showcase your projects to demonstrate your abilities');
        }
        break;
        
      case ProfileSection.CERTIFICATES:
        if (data.certificates.length > 0) {
          sectionCompleted = true;
          totalScore += config.weight;
        }
        break;
        
      case ProfileSection.AWARDS:
        if (data.awards.length > 0) {
          sectionCompleted = true;
          totalScore += config.weight;
        }
        break;
        
      case ProfileSection.VOLUNTEERING:
        if (data.volunteering.length > 0) {
          sectionCompleted = true;
          totalScore += config.weight;
        }
        break;
        
      case ProfileSection.LANGUAGES:
        if (data.languages.length > 0) {
          sectionCompleted = true;
          totalScore += config.weight;
        }
        break;
        
      case ProfileSection.CV_DOCUMENTS:
        if (data.cv_documents.length >= (config.minimumItems || 1)) {
          sectionCompleted = true;
          totalScore += config.weight;
        } else {
          recommendations.push('Upload your resume/CV to complete your profile');
        }
        break;
    }
    
    if (sectionCompleted) {
      completed.push(section);
    } else if (config.required) {
      missing.push(section);
    }
  });
  
  const percentage = Math.round((totalScore / maxScore) * 100);
  
  return {
    percentage,
    completedSections: completed,
    missingSections: missing,
    recommendations: recommendations.slice(0, 3) // Limit to top 3 recommendations
  };
}

/**
 * Get section display name
 */
export function getSectionDisplayName(section: ProfileSection): string {
  const displayNames: { [key in ProfileSection]: string } = {
    [ProfileSection.BASIC_INFO]: 'Basic Information',
    [ProfileSection.ABOUT]: 'About',
    [ProfileSection.EXPERIENCE]: 'Work Experience',
    [ProfileSection.EDUCATION]: 'Education',
    [ProfileSection.SKILLS]: 'Skills',
    [ProfileSection.PROJECTS]: 'Projects',
    [ProfileSection.CERTIFICATES]: 'Certificates',
    [ProfileSection.AWARDS]: 'Awards',
    [ProfileSection.VOLUNTEERING]: 'Volunteering',
    [ProfileSection.LANGUAGES]: 'Languages',
    [ProfileSection.CV_DOCUMENTS]: 'Resume & Documents'
  };
  
  return displayNames[section];
}

/**
 * Check if profile has any data
 */
export function hasProfileData(data: CompleteProfileData): boolean {
  return !!(
    data.candidate.first_name ||
    data.work_experiences.length > 0 ||
    data.education.length > 0 ||
    data.skills.length > 0 ||
    data.projects.length > 0 ||
    data.certificates.length > 0 ||
    data.awards.length > 0 ||
    data.volunteering.length > 0
  );
}

/**
 * Format years of experience
 */
export function formatYearsOfExperience(years: number | null): string {
  if (!years || years === 0) return 'Less than 1 year';
  if (years === 1) return '1 year';
  return `${Math.round(years)} years`;
}