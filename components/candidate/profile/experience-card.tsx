// components/candidate/profile/experience-card.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';
import { WorkExperienceDisplayData } from '@/lib/types/candidate/profile/profile-display';
import { 
  formatDateRange, 
  calculateDuration, 
  formatEmploymentType 
} from '@/lib/utils/profile-formatters';

interface ExperienceCardProps {
  experience: WorkExperienceDisplayData;
  showEditButton?: boolean;
}

export default function ExperienceCard({ 
  experience, 
  showEditButton = false 
}: ExperienceCardProps) {
  const dateRange = {
    start: experience.start_date,
    end: experience.end_date,
    is_current: experience.is_current
  };
  
  const duration = calculateDuration(dateRange);
  const formattedDateRange = formatDateRange(dateRange);

  return (
    <div className="group relative border-b border-gray-100 last:border-b-0 pb-6 last:pb-0 mb-6 last:mb-0">
      {/* Company Logo Placeholder */}
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-gray-400" />
          </div>
        </div>

        {/* Experience Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1">
              {/* Job Title */}
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {experience.title || 'Job Title'}
              </h3>
              
              {/* Company */}
              <p className="text-gray-700 font-medium">
                {experience.company || 'Company Name'}
              </p>
              
              {/* Employment Type & Duration */}
              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                {experience.employment_type && (
                  <span>{formatEmploymentType(experience.employment_type)}</span>
                )}
                {experience.employment_type && duration.formatted && (
                  <span>•</span>
                )}
                {duration.formatted && (
                  <span>{duration.formatted}</span>
                )}
              </div>
              
              {/* Date Range */}
              <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{formattedDateRange}</span>
              </div>
              
              {/* Location */}
              {experience.location && (
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                  <MapPin className="h-3 w-3" />
                  <span>{experience.location}</span>
                </div>
              )}
              
              {/* Current Role Badge */}
              {experience.is_current && (
                <Badge 
                  variant="secondary" 
                  className="mt-2 bg-green-100 text-green-800 hover:bg-green-100"
                >
                  Current
                </Badge>
              )}
            </div>

            {/* Edit Button */}
            {showEditButton && (
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                asChild
              >
                <Link href={`/candidate/profile/edit-profile/experience/${experience.id}`}>
                  Edit
                </Link>
              </Button>
            )}
          </div>

          {/* Description */}
          {experience.description && (
            <div className="mt-3">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {experience.description}
              </p>
            </div>
          )}

          {/* Accomplishments */}
          {experience.accomplishments && experience.accomplishments.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Key Accomplishments
              </h4>
              <ul className="space-y-1">
                {experience.accomplishments.map((accomplishment) => (
                  <li 
                    key={accomplishment.id} 
                    className="text-sm text-gray-700 flex items-start"
                  >
                    <div>
                      <span className="text-gray-400 mr-2 mt-1">•</span>
                      <span>{accomplishment.title}</span>
                    </div>
                    <div className='flex-1 ml-2 flex items-start'>
                      {accomplishment.description && (
                      <span className="ml-2 text-gray-600">{accomplishment.description}</span>
                    )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

