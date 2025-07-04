// components/candidate/profile/education-card.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import { EducationDisplayData } from '@/lib/types/profile-display';
import { 
  formatDateRange, 
  calculateDuration 
} from '@/lib/utils/profile-formatters';

interface EducationCardProps {
  education: EducationDisplayData;
  showEditButton?: boolean;
}

export default function EducationCard({ 
  education, 
  showEditButton = false 
}: EducationCardProps) {
  const dateRange = {
    start: education.start_date,
    end: education.end_date,
    is_current: false
  };
  
  const duration = calculateDuration(dateRange);
  const formattedDateRange = formatDateRange(dateRange);

  return (
    <div className="group relative border-b border-gray-100 last:border-b-0 pb-6 last:pb-0 mb-6 last:mb-0">
      <div className="flex gap-4">
        {/* Institution Logo Placeholder */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-gray-400" />
          </div>
        </div>

        {/* Education Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1">
              {/* Institution */}
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {education.university_school || 'Institution Name'}
              </h3>
              
              {/* Degree */}
              <p className="text-gray-700 font-medium">
                {education.degree_diploma || 'Degree/Diploma'}
              </p>
              
              {/* Field of Study */}
              {education.field_of_study && (
                <p className="text-gray-600 mt-1">
                  {education.field_of_study}
                </p>
              )}
              
              {/* Date Range */}
              <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{formattedDateRange}</span>
                {duration.formatted && (
                  <>
                    <span>•</span>
                    <span>{duration.formatted}</span>
                  </>
                )}
              </div>
              
              {/* Grade */}
              {education.grade && (
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Grade: {education.grade}
                  </Badge>
                </div>
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
                <Link href={`/candidate/profile/edit/education/${education.id}`}>
                  Edit
                </Link>
              </Button>
            )}
          </div>

          {/* Activities & Societies */}
          {education.activities_societies && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                Activities & Societies
              </h4>
              <p className="text-sm text-gray-700">
                {education.activities_societies}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

